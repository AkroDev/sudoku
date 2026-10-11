'use client';

import { DIFFICULTY_PROFILES } from '@/lib/sudoku';
import type { HallOfFameEntry } from '@/lib/hall-of-fame';
import { formatTime } from '@/lib/time';
import { useLocaleText } from '@/i18n';

type RankingRowProps = {
  entry: HallOfFameEntry;
  index: number;
  showPuzzleId?: boolean;
};

export default function RankingRow({ entry, index, showPuzzleId = false }: RankingRowProps) {
  const { t } = useLocaleText();
  const errorLabel = entry.errors === 1
    ? t('{{count}} erreur', { count: entry.errors })
    : t('{{count}} erreurs', { count: entry.errors });
  const errorShortLabel = t('{{count}} err.', { count: entry.errors });
  const difficultyLabel = t(DIFFICULTY_PROFILES[entry.difficulty].label);
  const tags = [
    { label: difficultyLabel, shortLabel: DIFFICULTY_PROFILES[entry.difficulty].code, title: t('Difficulté : {{difficulty}}', { difficulty: difficultyLabel }) },
    { label: errorLabel, shortLabel: errorShortLabel, title: errorLabel },
    entry.notesUsed ? { label: t('Notes'), shortLabel: 'N', title: t('Notes utilisées') } : null,
    entry.highlightSame ? { label: t('Surbrillance'), shortLabel: 'S', title: t('Surbrillance active') } : null,
    entry.checkErrors ? { label: t('Vérification'), shortLabel: '✓', title: t('Vérification des erreurs active') } : null,
  ].filter((tag): tag is NonNullable<typeof tag> => tag !== null);

  return (
    <li className={`ranking-row${showPuzzleId ? ' ranking-row--global' : ''}`} aria-label={t('Place {{place}}, {{nickname}}, {{errors}}{{grid}}', { place: index + 1, nickname: entry.nickname, errors: errorLabel, grid: showPuzzleId ? `, ${t('Grille')} ${entry.puzzleId}` : '' })}>
      <span className="ranking-rank">#{index + 1}</span>
      {showPuzzleId && <span className="ranking-grid-id">#{entry.puzzleId}</span>}
      <span className="ranking-score">
        <span className="ranking-name">{entry.nickname}</span>
        <span className="ranking-time-meta">
          <span className="ranking-time">{formatTime(entry.finalTime)}</span>
          <span className="ranking-meta">
            {tags.map((tag) => (
            <span
              className="ranking-tag"
              data-tooltip={tag.title}
              aria-label={tag.title}
              tabIndex={0}
              key={tag.label}
            >
                <span className="ranking-tag--full">{tag.label}</span>
                <span className="ranking-tag--short" aria-hidden="true">{tag.shortLabel}</span>
              </span>
            ))}
          </span>
        </span>
      </span>
    </li>
  );
}
