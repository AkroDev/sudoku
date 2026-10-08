import { formatTime } from './time';
import type { Difficulty } from './sudoku';

export type ShareDetails = {
  puzzleId: string;
  elapsedSeconds: number;
  difficulty: Difficulty;
  notesUsed: boolean;
  highlightSame: boolean;
  checkErrors: boolean;
};

function createShareParams(details: ShareDetails) {
  const params = new URLSearchParams({
    share: '1',
    time: String(Math.max(0, Math.trunc(details.elapsedSeconds))),
  });

  if (details.notesUsed) params.set('notes', '1');
  if (!details.highlightSame) params.set('highlight', '0');
  if (!details.checkErrors) params.set('check', '0');

  return params;
}

export function getShareText(details: ShareDetails) {
  return `Je viens de terminer la grille #${details.puzzleId} en ${formatTime(details.elapsedSeconds)}. À toi de jouer !`;
}

export function buildSharePagePath(details: ShareDetails) {
  return `/sudoku/${encodeURIComponent(details.puzzleId)}?${createShareParams(details).toString()}`;
}

export function buildShareImagePath(details: ShareDetails) {
  const params = createShareParams(details);
  params.delete('share');
  params.set('grid', details.puzzleId);
  return `/api/og?${params.toString()}`;
}
