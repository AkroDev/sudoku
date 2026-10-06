import { getSupabaseBrowserClient } from './supabase-browser';
import type { Difficulty } from './sudoku';

export const EMPTY_RANKING_MESSAGES = [
  'En attente d’un nouveau champion',
  'Éternel second ?',
  'Le podium, c’est déjà bien',
] as const;

export type HallOfFameEntry = {
  puzzleId: string;
  difficulty: Difficulty;
  nickname: string;
  finalTime: number;
  errors: number;
  notesUsed: boolean;
  highlightSame: boolean;
  checkErrors: boolean;
  completedAt: string;
};

export async function loadHallOfFame(puzzleId: string): Promise<HallOfFameEntry[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from('sudoku_leaderboard')
    .select('puzzle_id, difficulty, nickname, final_time_seconds, errors, notes_used, highlight_same, check_errors, completed_at')
    .eq('puzzle_id', puzzleId)
    .order('final_time_seconds', { ascending: true })
    .order('completed_at', { ascending: true })
    .limit(10);

  if (error || !data) return [];

  return data.map((entry) => ({
    puzzleId: entry.puzzle_id,
    difficulty: entry.difficulty,
    nickname: entry.nickname,
    finalTime: entry.final_time_seconds,
    errors: entry.errors,
    notesUsed: entry.notes_used,
    highlightSame: entry.highlight_same,
    checkErrors: entry.check_errors,
    completedAt: entry.completed_at,
  }));
}
