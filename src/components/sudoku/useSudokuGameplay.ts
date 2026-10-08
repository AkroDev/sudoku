import type { Dispatch, SetStateAction } from 'react';
import type { Grid, NotesGrid } from './types';

const ERROR_PENALTY_SECONDS = 15;

type UseSudokuGameplayOptions = {
  grid: Grid;
  puzzleGrid: number[][];
  solution: number[][];
  selectedCell: number | null;
  paused: boolean;
  completed: boolean;
  started: boolean;
  notesEnabled: boolean;
  notesMode: boolean;
  checkErrors: boolean;
  setGrid: Dispatch<SetStateAction<Grid>>;
  setNotes: Dispatch<SetStateAction<NotesGrid>>;
  setSelectedCell: Dispatch<SetStateAction<number | null>>;
  setStarted: Dispatch<SetStateAction<boolean>>;
  setNotesEnabled: Dispatch<SetStateAction<boolean>>;
  setNotesUsed: Dispatch<SetStateAction<boolean>>;
  setNotesMode: Dispatch<SetStateAction<boolean>>;
  setErrors: Dispatch<SetStateAction<number>>;
  setPenalties: Dispatch<SetStateAction<number>>;
  setErrorCell: Dispatch<SetStateAction<number | null>>;
  setCorrectCell: Dispatch<SetStateAction<number | null>>;
  onComplete: (nextGrid: Grid) => void;
};

export function useSudokuGameplay({
  grid,
  puzzleGrid,
  solution,
  selectedCell,
  paused,
  completed,
  started,
  notesEnabled,
  notesMode,
  checkErrors,
  setGrid,
  setNotes,
  setSelectedCell,
  setStarted,
  setNotesEnabled,
  setNotesUsed,
  setNotesMode,
  setErrors,
  setPenalties,
  setErrorCell,
  setCorrectCell,
  onComplete,
}: UseSudokuGameplayOptions) {
  const enterValue = (value: number) => {
    if (selectedCell === null || paused || completed) return;
    const row = Math.floor(selectedCell / 9);
    const column = selectedCell % 9;
    if (puzzleGrid[row][column] !== 0) return;

    if (!started) setStarted(true);

    if (notesMode) {
      if (grid[row][column] !== null) return;
      setNotesUsed(true);
      setNotes((current) => current.map((notesRow, rowIndex) => notesRow.map((cellNotes, columnIndex) => {
        if (rowIndex !== row || columnIndex !== column) return cellNotes;
        return cellNotes.includes(value)
          ? cellNotes.filter((candidate) => candidate !== value)
          : [...cellNotes, value].sort((a, b) => a - b);
      })));
      return;
    }

    if (checkErrors && value !== solution[row][column]) {
      setErrorCell(selectedCell);
      setErrors((current) => current + 1);
      setPenalties((current) => current + ERROR_PENALTY_SECONDS);
      window.setTimeout(() => setErrorCell(null), 1000);
      return;
    }

    const nextGrid = grid.map((gridRow) => [...gridRow]);
    nextGrid[row][column] = value;
    setGrid(nextGrid);
    setNotes((current) => current.map((notesRow, rowIndex) => notesRow.map((cellNotes, columnIndex) => (
      rowIndex === row && columnIndex === column ? [] : cellNotes
    ))));
    setCorrectCell(selectedCell);
    window.setTimeout(() => setCorrectCell(null), 480);
    onComplete(nextGrid);
  };

  const clearValue = () => {
    if (selectedCell === null || paused || completed) return;
    const row = Math.floor(selectedCell / 9);
    const column = selectedCell % 9;
    if (puzzleGrid[row][column] !== 0) return;

    if (grid[row][column] === null) {
      setNotes((current) => current.map((notesRow, rowIndex) => notesRow.map((cellNotes, columnIndex) => (
        rowIndex === row && columnIndex === column ? [] : cellNotes
      ))));
      return;
    }

    setGrid((current) => current.map((gridRow, rowIndex) => gridRow.map((value, columnIndex) => (
      rowIndex === row && columnIndex === column ? null : value
    ))));
  };

  const toggleNotesMode = () => {
    if (!notesEnabled) return;
    setNotesMode((current) => !current);
  };

  const toggleNotesEnabled = () => {
    setNotesEnabled((current) => {
      const next = !current;
      if (!next) setNotesMode(false);
      return next;
    });
  };

  const moveSelection = (rowDelta: number, columnDelta: number) => {
    const current = selectedCell ?? 0;
    const row = Math.floor(current / 9);
    const column = current % 9;
    const nextRow = Math.min(8, Math.max(0, row + rowDelta));
    const nextColumn = Math.min(8, Math.max(0, column + columnDelta));
    setSelectedCell(nextRow * 9 + nextColumn);
  };

  return { enterValue, clearValue, toggleNotesMode, toggleNotesEnabled, moveSelection };
}
