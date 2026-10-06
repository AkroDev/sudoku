export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SudokuGrid = number[][];

export type DifficultyProfile = {
  code: string;
  label: string;
  targetClues: number;
};

export type GeneratedPuzzle = {
  id: string;
  difficulty: Difficulty;
  label: string;
  seed: number;
  grid: SudokuGrid;
  solution: SudokuGrid;
  profile: DifficultyProfile;
};

export const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  easy: { code: 'F', label: 'Facile', targetClues: 42 },
  medium: { code: 'M', label: 'Moyen', targetClues: 36 },
  hard: { code: 'D', label: 'Difficile', targetClues: 31 },
  expert: { code: 'X', label: 'Expert', targetClues: 27 },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

const DIGITS = 9;

function hashSeed(difficulty: Difficulty, seed: number) {
  let hash = 2166136261;
  const input = `${difficulty}:${Math.trunc(seed)}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function basePattern(row: number, column: number) {
  return (row * 3 + Math.floor(row / 3) + column) % DIGITS;
}

function createSolvedGrid(random: () => number): SudokuGrid {
  const rows = shuffle([0, 1, 2], random).flatMap((band) => shuffle([0, 1, 2], random).map((row) => band * 3 + row));
  const columns = shuffle([0, 1, 2], random).flatMap((stack) => shuffle([0, 1, 2], random).map((column) => stack * 3 + column));
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);

  return rows.map((row) => columns.map((column) => digits[basePattern(row, column)]));
}

export function countSolutions(grid: SudokuGrid, limit = 2): number {
  const rowMasks = Array.from({ length: DIGITS }, () => 0);
  const columnMasks = Array.from({ length: DIGITS }, () => 0);
  const blockMasks = Array.from({ length: DIGITS }, () => 0);
  const emptyCells: Array<[number, number]> = [];

  for (let row = 0; row < DIGITS; row += 1) {
    for (let column = 0; column < DIGITS; column += 1) {
      const value = grid[row][column];
      if (value === 0) {
        emptyCells.push([row, column]);
        continue;
      }
      const bit = 1 << value;
      const block = Math.floor(row / 3) * 3 + Math.floor(column / 3);
      if ((rowMasks[row] & bit) || (columnMasks[column] & bit) || (blockMasks[block] & bit)) return 0;
      rowMasks[row] |= bit;
      columnMasks[column] |= bit;
      blockMasks[block] |= bit;
    }
  }

  let solutions = 0;

  const search = () => {
    if (solutions >= limit) return;
    if (emptyCells.length === 0) {
      solutions += 1;
      return;
    }

    let bestIndex = 0;
    let bestMask = 0;
    let bestCount = DIGITS + 1;

    for (let index = 0; index < emptyCells.length; index += 1) {
      const [row, column] = emptyCells[index];
      const block = Math.floor(row / 3) * 3 + Math.floor(column / 3);
      const used = rowMasks[row] | columnMasks[column] | blockMasks[block];
      const available = (~used) & 0b1111111110;
      const count = available.toString(2).replaceAll('0', '').length;
      if (count < bestCount) {
        bestIndex = index;
        bestMask = available;
        bestCount = count;
        if (count === 1) break;
      }
    }

    if (bestMask === 0) return;
    const [row, column] = emptyCells[bestIndex];
    const block = Math.floor(row / 3) * 3 + Math.floor(column / 3);
    const remaining = emptyCells.splice(bestIndex, 1)[0];

    for (let value = 1; value <= DIGITS; value += 1) {
      const bit = 1 << value;
      if ((bestMask & bit) === 0) continue;
      grid[row][column] = value;
      rowMasks[row] |= bit;
      columnMasks[column] |= bit;
      blockMasks[block] |= bit;
      search();
      rowMasks[row] ^= bit;
      columnMasks[column] ^= bit;
      blockMasks[block] ^= bit;
      grid[row][column] = 0;
      if (solutions >= limit) break;
    }

    emptyCells.splice(bestIndex, 0, remaining);
  };

  search();
  return solutions;
}

function createPuzzleGrid(solution: SudokuGrid, targetClues: number, random: () => number) {
  const grid = solution.map((row) => [...row]);
  const cells = shuffle(Array.from({ length: 81 }, (_, index) => index), random);
  let clues = 81;

  for (const cell of cells) {
    if (clues <= targetClues) break;
    const row = Math.floor(cell / 9);
    const column = cell % 9;
    const previous = grid[row][column];
    grid[row][column] = 0;
    if (countSolutions(grid) !== 1) {
      grid[row][column] = previous;
    } else {
      clues -= 1;
    }
  }

  return grid;
}

export function createPuzzle(difficulty: Difficulty, seed: number): GeneratedPuzzle {
  const profile = DIFFICULTY_PROFILES[difficulty];
  const random = createRandom(hashSeed(difficulty, seed));
  const solution = createSolvedGrid(random);
  const grid = createPuzzleGrid(solution, profile.targetClues, random);
  const normalizedSeed = Math.abs(Math.trunc(seed));

  return {
    id: `${profile.code}-${normalizedSeed}`,
    difficulty,
    label: profile.label,
    seed: normalizedSeed,
    grid,
    solution,
    profile,
  };
}

export function parsePuzzleId(id: string) {
  const match = /^([FMDX])-(\d+)$/.exec(id.toUpperCase());
  if (!match) return null;
  const difficulty = DIFFICULTY_ORDER.find((key) => DIFFICULTY_PROFILES[key].code === match[1]);
  if (!difficulty) return null;
  return { difficulty, seed: Number(match[2]) };
}
