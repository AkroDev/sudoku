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

export type BooleanLeaderboardFilter = 'all' | 'with' | 'without';

export type HallOfFameFilters = {
  difficulty: Difficulty | 'all';
  notes: BooleanLeaderboardFilter;
  highlightSame: BooleanLeaderboardFilter;
  checkErrors: BooleanLeaderboardFilter;
};

export const DEFAULT_HALL_OF_FAME_FILTERS: HallOfFameFilters = {
  difficulty: 'all',
  notes: 'all',
  highlightSame: 'all',
  checkErrors: 'all',
};

export async function loadHallOfFame(
  puzzleId: string | null,
  filters: HallOfFameFilters = DEFAULT_HALL_OF_FAME_FILTERS,
): Promise<HallOfFameEntry[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  let request = client
    .from('sudoku_leaderboard')
    .select('puzzle_id, difficulty, nickname, final_time_seconds, errors, notes_used, highlight_same, check_errors, completed_at');

  if (puzzleId) {
    request = request.eq('puzzle_id', puzzleId);
  }

  if (filters.difficulty !== 'all') {
    request = request.eq('difficulty', filters.difficulty);
  }

  if (filters.notes !== 'all') {
    request = request.eq('notes_used', filters.notes === 'with');
  }
  if (filters.highlightSame !== 'all') {
    request = request.eq('highlight_same', filters.highlightSame === 'with');
  }
  if (filters.checkErrors !== 'all') {
    request = request.eq('check_errors', filters.checkErrors === 'with');
  }

  const { data, error } = await request
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
