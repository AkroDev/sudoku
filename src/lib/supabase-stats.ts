import type { CompletedGameRecord } from './statistics';
import { getSupabaseBrowserClient } from './supabase-browser';

export type SyncCompletedGameResult =
  | { synced: true }
  | { synced: false; reason: 'not-configured' | 'not-authenticated' | 'failed' };

export async function syncCompletedGame(record: CompletedGameRecord): Promise<SyncCompletedGameResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { synced: false, reason: 'not-configured' };

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { synced: false, reason: 'not-authenticated' };

  const { error } = await client.from('sudoku_completions').insert({
    user_id: userData.user.id,
    puzzle_id: record.puzzleId,
    difficulty: record.difficulty,
    seed: record.seed,
    raw_time_seconds: record.rawTime,
    penalties_seconds: record.penalties,
    final_time_seconds: record.finalTime,
    errors: record.errors,
    notes_used: record.notesUsed,
    highlight_same: record.highlightSame,
    check_errors: record.checkErrors,
    completed_at: new Date(record.completedAt).toISOString(),
  });

  return error ? { synced: false, reason: 'failed' } : { synced: true };
}
