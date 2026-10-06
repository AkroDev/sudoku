import type { CompletedGameRecord } from './statistics';
import { getSupabaseBrowserClient } from './supabase-browser';

const VISITOR_ID_STORAGE_KEY = 'akrolabs-sudoku-public-visitor-v1';
const NICKNAME_STORAGE_KEY = 'akrolabs-sudoku-public-nickname-v1';

export const PUBLIC_NICKNAME_MIN_LENGTH = 2;
export const PUBLIC_NICKNAME_MAX_LENGTH = 24;

export type SubmitPublicScoreResult =
  | { submitted: true }
  | { submitted: false; reason: 'already-submitted' | 'failed' | 'not-configured' };

export function getStoredPublicNickname() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NICKNAME_STORAGE_KEY) ?? '';
}

function getVisitorId() {
  const stored = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
  if (stored) return stored;

  const visitorId = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
  return visitorId;
}

export async function submitPublicScore(
  record: CompletedGameRecord,
  nickname: string,
): Promise<SubmitPublicScoreResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { submitted: false, reason: 'not-configured' };

  const cleanNickname = nickname.trim().replace(/\s+/g, ' ');
  if (cleanNickname.length < PUBLIC_NICKNAME_MIN_LENGTH || cleanNickname.length > PUBLIC_NICKNAME_MAX_LENGTH) {
    return { submitted: false, reason: 'failed' };
  }

  const { data: userData } = await client.auth.getUser();
  const { error } = await client.from('sudoku_public_scores').insert({
    visitor_id: getVisitorId(),
    user_id: userData.user?.id ?? null,
    nickname: cleanNickname,
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

  if (!error) {
    window.localStorage.setItem(NICKNAME_STORAGE_KEY, cleanNickname);
    return { submitted: true };
  }

  if (error.code === '23505') return { submitted: false, reason: 'already-submitted' };
  return { submitted: false, reason: 'failed' };
}
