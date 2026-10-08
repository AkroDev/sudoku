import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import type { Difficulty } from '@/lib/sudoku';
import {
  recordCompletedGame,
  type CompletedGameRecord,
  type PersonalStatistics,
} from '@/lib/statistics';
import { syncCompletedGame } from '@/lib/supabase-stats';
import type { Grid } from './types';

type UseGameCompletionOptions = {
  puzzleId: string;
  difficulty: Difficulty;
  seed: number;
  solution: number[][];
  elapsedSeconds: number;
  penalties: number;
  errors: number;
  notesUsed: boolean;
  highlightSame: boolean;
  checkErrors: boolean;
  setCompleted: Dispatch<SetStateAction<boolean>>;
  setCompletionModalOpen: Dispatch<SetStateAction<boolean>>;
  setStarted: Dispatch<SetStateAction<boolean>>;
  setCompletedRecord: Dispatch<SetStateAction<CompletedGameRecord | null>>;
  setStatistics: Dispatch<SetStateAction<PersonalStatistics>>;
};

export function useGameCompletion({
  puzzleId,
  difficulty,
  seed,
  solution,
  elapsedSeconds,
  penalties,
  errors,
  notesUsed,
  highlightSame,
  checkErrors,
  setCompleted,
  setCompletionModalOpen,
  setStarted,
  setCompletedRecord,
  setStatistics,
}: UseGameCompletionOptions) {
  const completionRecorded = useRef(false);

  const markHydrated = useCallback((wasCompleted: boolean) => {
    completionRecorded.current = wasCompleted;
  }, []);

  const resetCompletion = useCallback(() => {
    completionRecorded.current = false;
  }, []);

  const completeGame = (nextGrid: Grid) => {
    const isFull = nextGrid.every((row) => row.every((value) => value !== null));
    const isCorrect = nextGrid.every((row, rowIndex) => row.every((value, columnIndex) => value === solution[rowIndex][columnIndex]));
    if (!isFull || !isCorrect) return;

    setCompleted(true);
    setCompletionModalOpen(true);
    setStarted(false);
    if (completionRecorded.current) return;

    const record: CompletedGameRecord = {
      puzzleId,
      difficulty,
      seed,
      rawTime: elapsedSeconds,
      penalties,
      finalTime: elapsedSeconds + penalties,
      errors,
      notesUsed,
      highlightSame,
      checkErrors,
      completedAt: Date.now(),
    };
    setCompletedRecord(record);
    setStatistics(recordCompletedGame(record));
    void syncCompletedGame(record);
    completionRecorded.current = true;
  };

  return { completeGame, markHydrated, resetCompletion };
}
