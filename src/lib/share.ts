import { formatTime } from './time';
import type { Difficulty } from './sudoku';
import type { Locale } from '@/i18n';

export type ShareDetails = {
  puzzleId: string;
  elapsedSeconds: number;
  difficulty: Difficulty;
  notesUsed: boolean;
  highlightSame: boolean;
  checkErrors: boolean;
  locale?: Locale;
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

export function getShareText(details: ShareDetails, locale: Locale = details.locale ?? 'fr') {
  const time = formatTime(details.elapsedSeconds);
  return locale === 'en'
    ? `I just completed puzzle #${details.puzzleId} in ${time}. Your turn!`
    : `Je viens de terminer la grille #${details.puzzleId} en ${time}. À toi de jouer !`;
}

export function buildSharePagePath(details: ShareDetails, locale: Locale = details.locale ?? 'fr') {
  const prefix = locale === 'en' ? '/en' : '';
  return `${prefix}/sudoku/${encodeURIComponent(details.puzzleId)}?${createShareParams(details).toString()}`;
}

export function buildShareImagePath(details: ShareDetails, locale: Locale = details.locale ?? 'fr') {
  const params = createShareParams(details);
  params.delete('share');
  params.set('grid', details.puzzleId);
  if (locale === 'en') params.set('lang', locale);
  return `/api/og?${params.toString()}`;
}
