import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { CompletedGameRecord } from '@/lib/statistics';
import type { Grid, NotesGrid } from './types';

type PersistedGameState = {
  grid: Grid;
  notes: NotesGrid;
  selectedCell: number | null;
  elapsedSeconds: number;
  penalties: number;
  errors: number;
  started: boolean;
  paused: boolean;
  completed: boolean;
  notesEnabled: boolean;
  notesMode: boolean;
  notesUsed: boolean;
  highlightSame: boolean;
  checkErrors: boolean;
  completedRecord: CompletedGameRecord | null;
  publicScoreSubmitted: boolean;
};

type GameStateSetters = {
  setGrid: Dispatch<SetStateAction<Grid>>;
  setNotes: Dispatch<SetStateAction<NotesGrid>>;
  setSelectedCell: Dispatch<SetStateAction<number | null>>;
  setElapsedSeconds: Dispatch<SetStateAction<number>>;
  setPenalties: Dispatch<SetStateAction<number>>;
  setErrors: Dispatch<SetStateAction<number>>;
  setStarted: Dispatch<SetStateAction<boolean>>;
  setPaused: Dispatch<SetStateAction<boolean>>;
  setCompleted: Dispatch<SetStateAction<boolean>>;
  setNotesEnabled: Dispatch<SetStateAction<boolean>>;
  setNotesMode: Dispatch<SetStateAction<boolean>>;
  setNotesUsed: Dispatch<SetStateAction<boolean>>;
  setHighlightSame: Dispatch<SetStateAction<boolean>>;
  setCheckErrors: Dispatch<SetStateAction<boolean>>;
  setCompletedRecord: Dispatch<SetStateAction<CompletedGameRecord | null>>;
  setPublicScoreSubmitted: Dispatch<SetStateAction<boolean>>;
  setReplayNoticeOpen: Dispatch<SetStateAction<boolean>>;
  setErrorCell: Dispatch<SetStateAction<number | null>>;
  setCorrectCell: Dispatch<SetStateAction<number | null>>;
  setCompletionModalOpen: Dispatch<SetStateAction<boolean>>;
};

type UseSudokuPersistenceOptions = {
  puzzleId: string;
  puzzleGrid: number[][];
  storageKey: string;
  state: PersistedGameState;
  setters: GameStateSetters;
  onHydrated?: (completed: boolean) => void;
};

function createInitialGrid(puzzle: number[][]): Grid {
  return puzzle.map((row) => row.map((value) => (value === 0 ? null : value)));
}

function createEmptyNotes(): NotesGrid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
}

function isSavedGridCompatible(grid: unknown, puzzleGrid: number[][]): grid is Grid {
  if (!Array.isArray(grid) || grid.length !== 9 || !grid.every((row) => Array.isArray(row) && row.length === 9)) {
    return false;
  }

  return puzzleGrid.every((row, rowIndex) => row.every((value, columnIndex) => (
    value === 0 || grid[rowIndex][columnIndex] === value
  )));
}

export function useSudokuPersistence({ puzzleId, puzzleGrid, storageKey, state, setters, onHydrated }: UseSudokuPersistenceOptions) {
  const [hydrated, setHydrated] = useState(false);
  const lastPersistedStorageKey = useRef<string | null>(null);
  const latest = useRef({ puzzleGrid, state, setters, onHydrated });
  latest.current = { puzzleGrid, state, setters, onHydrated };

  useEffect(() => {
    const current = latest.current;
    const currentSetters = current.setters;
    const currentPuzzleGrid = current.puzzleGrid;
    let restoredCompleted = false;
    setHydrated(false);
    currentSetters.setGrid(createInitialGrid(currentPuzzleGrid));
    currentSetters.setNotes(createEmptyNotes());
    currentSetters.setSelectedCell(null);
    currentSetters.setElapsedSeconds(0);
    currentSetters.setPenalties(0);
    currentSetters.setErrors(0);
    currentSetters.setStarted(false);
    currentSetters.setPaused(false);
    currentSetters.setCompleted(false);
    currentSetters.setNotesEnabled(false);
    currentSetters.setNotesMode(false);
    currentSetters.setNotesUsed(false);
    currentSetters.setErrorCell(null);
    currentSetters.setCorrectCell(null);
    currentSetters.setCompletedRecord(null);
    currentSetters.setPublicScoreSubmitted(false);
    currentSetters.setCompletionModalOpen(false);
    currentSetters.setReplayNoticeOpen(false);

    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedState = JSON.parse(saved) as Partial<PersistedGameState> & { puzzleId?: string };
        const isSavedStateForPuzzle = savedState.puzzleId === puzzleId
          || (typeof savedState.puzzleId === 'undefined' && isSavedGridCompatible(savedState.grid, currentPuzzleGrid));

        if (isSavedStateForPuzzle && isSavedGridCompatible(savedState.grid, currentPuzzleGrid) && Array.isArray(savedState.notes)) {
          currentSetters.setGrid(savedState.grid);
          currentSetters.setNotes(savedState.notes);
          currentSetters.setSelectedCell(typeof savedState.selectedCell === 'number' ? savedState.selectedCell : null);
          currentSetters.setElapsedSeconds(Number(savedState.elapsedSeconds) || 0);
          currentSetters.setPenalties(Number(savedState.penalties) || 0);
          currentSetters.setErrors(Number(savedState.errors) || 0);
          currentSetters.setStarted(Boolean(savedState.started));
          currentSetters.setPaused(Boolean(savedState.paused));
          currentSetters.setCompleted(Boolean(savedState.completed));
          const savedNotesEnabled = typeof savedState.notesEnabled === 'boolean'
            ? savedState.notesEnabled
            : Boolean(savedState.notesMode);
          currentSetters.setNotesEnabled(savedNotesEnabled);
          currentSetters.setNotesMode(savedNotesEnabled && Boolean(savedState.notesMode));
          currentSetters.setNotesUsed(Boolean(savedState.notesUsed));
          currentSetters.setHighlightSame(savedState.highlightSame !== false);
          currentSetters.setCheckErrors(savedState.checkErrors !== false);
          currentSetters.setCompletedRecord(savedState.completedRecord?.puzzleId === puzzleId ? savedState.completedRecord : null);
          currentSetters.setPublicScoreSubmitted(Boolean(savedState.publicScoreSubmitted));
          currentSetters.setReplayNoticeOpen(Boolean(savedState.completed));
          restoredCompleted = Boolean(savedState.completed);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    current.onHydrated?.(restoredCompleted);
    setHydrated(true);
  }, [puzzleId, storageKey]);

  const persistedState = JSON.stringify({ puzzleId, ...state });
  useEffect(() => {
    if (!hydrated) return;
    if (lastPersistedStorageKey.current !== storageKey) {
      lastPersistedStorageKey.current = storageKey;
      return;
    }

    window.localStorage.setItem(storageKey, persistedState);
  }, [hydrated, persistedState, storageKey]);

  return hydrated;
}
