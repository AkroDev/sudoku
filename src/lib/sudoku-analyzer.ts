import type { SudokuGrid } from './sudoku';

export type SudokuTechnique = 'naked-single' | 'hidden-single' | 'search';

export type PuzzleAnalysis = {
  techniques: SudokuTechnique[];
  steps: number;
  searchDepth: number;
  score: number;
  solvedLogically: boolean;
};

type CandidatesGrid = Array<Array<Set<number> | null>>;

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((row) => [...row]);
}

function getCandidates(grid: SudokuGrid, row: number, column: number) {
  const used = new Set<number>();
  for (let index = 0; index < 9; index += 1) {
    used.add(grid[row][index]);
    used.add(grid[index][column]);
  }
  const blockRow = Math.floor(row / 3) * 3;
  const blockColumn = Math.floor(column / 3) * 3;
  for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
      used.add(grid[blockRow + rowOffset][blockColumn + columnOffset]);
    }
  }
  return new Set(DIGITS.filter((digit) => !used.has(digit)));
}

function buildCandidates(grid: SudokuGrid): CandidatesGrid {
  return grid.map((row, rowIndex) => row.map((value, columnIndex) => (
    value === 0 ? getCandidates(grid, rowIndex, columnIndex) : null
  )));
}

function listUnits() {
  const units: Array<Array<[number, number]>> = [];
  for (let row = 0; row < 9; row += 1) {
    units.push(Array.from({ length: 9 }, (_, column) => [row, column]));
  }
  for (let column = 0; column < 9; column += 1) {
    units.push(Array.from({ length: 9 }, (_, row) => [row, column]));
  }
  for (let blockRow = 0; blockRow < 9; blockRow += 3) {
    for (let blockColumn = 0; blockColumn < 9; blockColumn += 3) {
      const unit: Array<[number, number]> = [];
      for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
        for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
          unit.push([blockRow + rowOffset, blockColumn + columnOffset]);
        }
      }
      units.push(unit);
    }
  }
  return units;
}

const UNITS = listUnits();

function placeValue(grid: SudokuGrid, row: number, column: number, value: number) {
  grid[row][column] = value;
}

function applyNakedSingle(grid: SudokuGrid, candidates: CandidatesGrid) {
  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const cellCandidates = candidates[row][column];
      if (cellCandidates?.size === 1) {
        placeValue(grid, row, column, [...cellCandidates][0]);
        return true;
      }
    }
  }
  return false;
}

function applyHiddenSingle(grid: SudokuGrid, candidates: CandidatesGrid) {
  for (const unit of UNITS) {
    for (const digit of DIGITS) {
      const matches = unit.filter(([row, column]) => candidates[row][column]?.has(digit));
      if (matches.length === 1) {
        const [row, column] = matches[0];
        placeValue(grid, row, column, digit);
        return true;
      }
    }
  }
  return false;
}

function findBestSearchCell(grid: SudokuGrid) {
  const candidates = buildCandidates(grid);
  let best: { row: number; column: number; values: number[] } | null = null;

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const values = candidates[row][column];
      if (!values) continue;
      const sortedValues = [...values].sort((a, b) => a - b);
      if (!best || sortedValues.length < best.values.length) {
        best = { row, column, values: sortedValues };
      }
    }
  }

  return best;
}

function search(grid: SudokuGrid, depth: number): { solved: boolean; maxDepth: number } {
  const cell = findBestSearchCell(grid);
  if (!cell) return { solved: true, maxDepth: depth };
  if (cell.values.length === 0) return { solved: false, maxDepth: depth };

  let maxDepth = depth;
  for (const value of cell.values) {
    const branch = cloneGrid(grid);
    branch[cell.row][cell.column] = value;
    const result = search(branch, depth + 1);
    maxDepth = Math.max(maxDepth, result.maxDepth);
    if (result.solved) return { solved: true, maxDepth };
  }
  return { solved: false, maxDepth };
}

export function analyzePuzzle(puzzle: SudokuGrid): PuzzleAnalysis {
  const logicalGrid = cloneGrid(puzzle);
  const techniques: SudokuTechnique[] = [];
  let steps = 0;

  while (logicalGrid.some((row) => row.includes(0))) {
    const candidates = buildCandidates(logicalGrid);
    if (applyNakedSingle(logicalGrid, candidates)) {
      if (!techniques.includes('naked-single')) techniques.push('naked-single');
      steps += 1;
      continue;
    }
    if (applyHiddenSingle(logicalGrid, candidates)) {
      if (!techniques.includes('hidden-single')) techniques.push('hidden-single');
      steps += 1;
      continue;
    }
    break;
  }

  const solvedLogically = !logicalGrid.some((row) => row.includes(0));
  if (solvedLogically) {
    return {
      techniques,
      steps,
      searchDepth: 0,
      score: techniques.includes('hidden-single') ? 2 : 1,
      solvedLogically: true,
    };
  }

  const result = search(logicalGrid, 1);
  techniques.push('search');
  return {
    techniques,
    steps,
    searchDepth: result.maxDepth,
    score: 10 + result.maxDepth * 5,
    solvedLogically: false,
  };
}
