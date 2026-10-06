import { DIFFICULTY_PROFILES } from '@/lib/sudoku';
import type { HallOfFameEntry } from '@/lib/hall-of-fame';
import { formatTime } from '@/lib/time';

type RankingRowProps = {
  entry: HallOfFameEntry;
  index: number;
  showPuzzleId?: boolean;
};

export default function RankingRow({ entry, index, showPuzzleId = false }: RankingRowProps) {
  const errorLabel = `${entry.errors} ${entry.errors === 1 ? 'erreur' : 'erreurs'}`;
  const errorShortLabel = `${entry.errors} err.`;
  const difficultyLabel = DIFFICULTY_PROFILES[entry.difficulty].label;
  const tags = [
    { label: difficultyLabel, shortLabel: DIFFICULTY_PROFILES[entry.difficulty].code, title: `Difficulté : ${difficultyLabel}` },
    { label: errorLabel, shortLabel: errorShortLabel, title: errorLabel },
    entry.notesUsed ? { label: 'Notes', shortLabel: 'N', title: 'Notes utilisées' } : null,
    entry.highlightSame ? { label: 'Surbrillance', shortLabel: 'S', title: 'Surbrillance active' } : null,
    entry.checkErrors ? { label: 'Vérification', shortLabel: '✓', title: 'Vérification des erreurs active' } : null,
  ].filter((tag): tag is NonNullable<typeof tag> => tag !== null);

  return (
    <li className={`ranking-row${showPuzzleId ? ' ranking-row--global' : ''}`} aria-label={`Place ${index + 1}, ${entry.nickname}, ${errorLabel}${showPuzzleId ? `, grille ${entry.puzzleId}` : ''}`}>
      <span className="ranking-rank">#{index + 1}</span>
      {showPuzzleId && <span className="ranking-grid-id">#{entry.puzzleId}</span>}
      <span className="ranking-score">
        <span className="ranking-name">{entry.nickname}</span>
        <span className="ranking-time">{formatTime(entry.finalTime)}</span>
        <span className="ranking-meta">
          {tags.map((tag) => (
            <span className="ranking-tag" title={tag.title} key={tag.label}>
              <span className="ranking-tag--full">{tag.label}</span>
              <span className="ranking-tag--short" aria-hidden="true">{tag.shortLabel}</span>
            </span>
          ))}
        </span>
      </span>
    </li>
  );
}
