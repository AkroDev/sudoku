import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countSolutions,
  createPuzzle,
  DIFFICULTY_ORDER,
  formatPuzzleId,
  parsePuzzleId,
  type SudokuGrid,
} from '../src/lib/sudoku';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function assertValidSolution(grid: SudokuGrid) {
  assert.equal(grid.length, 9);
  for (const row of grid) {
    assert.deepEqual([...row].sort((a, b) => a - b), DIGITS);
  }
  for (let column = 0; column < 9; column += 1) {
    assert.deepEqual(grid.map((row) => row[column]).sort((a, b) => a - b), DIGITS);
  }
  for (let blockRow = 0; blockRow < 3; blockRow += 1) {
    for (let blockColumn = 0; blockColumn < 3; blockColumn += 1) {
      const values = Array.from({ length: 9 }, (_, index) => (
        grid[blockRow * 3 + Math.floor(index / 3)][blockColumn * 3 + index % 3]
      ));
      assert.deepEqual(values.sort((a, b) => a - b), DIGITS);
    }
  }
}

test('generated puzzles have valid solutions, preserve clues, and have one solution', {
  timeout: 120_000,
}, () => {
  for (const difficulty of DIFFICULTY_ORDER) {
    const puzzle = createPuzzle(difficulty, 27);
    assertValidSolution(puzzle.solution);
    assert.equal(puzzle.id, formatPuzzleId(difficulty, 27));

    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        if (puzzle.grid[row][column] !== 0) {
          assert.equal(puzzle.grid[row][column], puzzle.solution[row][column]);
        }
      }
    }

    assert.equal(countSolutions(puzzle.grid.map((row) => [...row])), 1, `${puzzle.id} must have one solution`);
  }
});

test('solution counting rejects conflicts and does not mutate the supplied grid', () => {
  const solvedGrid: SudokuGrid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  const oneEmptyCell = solvedGrid.map((row) => [...row]);
  oneEmptyCell[8][8] = 0;

  assert.equal(countSolutions(oneEmptyCell), 1);
  assert.equal(oneEmptyCell[8][8], 0);

  const conflict = solvedGrid.map((row) => [...row]);
  conflict[0][0] = conflict[0][1];
  assert.equal(countSolutions(conflict), 0);
});

test('puzzle ids format and parse difficulty and number', () => {
  assert.equal(formatPuzzleId('easy', 1), 'F-0001');
  assert.deepEqual(parsePuzzleId('m-0042'), { difficulty: 'medium', seed: 42 });
  assert.equal(parsePuzzleId('Q-0001'), null);
  assert.equal(parsePuzzleId('M-not-a-number'), null);
});
