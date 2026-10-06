import { DIFFICULTY_PROFILES } from '@/lib/sudoku';
import type { HallOfFameEntry } from '@/lib/hall-of-fame';
import { formatTime } from '@/lib/time';

type RankingRowProps = {
  entry: HallOfFameEntry;
  index: number;
};

export default function RankingRow({ entry, index }: RankingRowProps) {
  const errorLabel = `${entry.errors} ${entry.errors === 1 ? 'erreur' : 'erreurs'}`;

  return (
    <li className="ranking-row" aria-label={`Place ${index + 1}, ${entry.nickname}, ${errorLabel}`}>
      <span className="ranking-rank">#{index + 1}</span>
      <span className="ranking-score">
        <span className="ranking-name">{entry.nickname}</span>
        <span className="ranking-time">{formatTime(entry.finalTime)}</span>
        <span className="ranking-meta">
          <span className="ranking-tag">{DIFFICULTY_PROFILES[entry.difficulty].label}</span>
          <span className="ranking-tag">{errorLabel}</span>
          {entry.notesUsed && <span className="ranking-tag">Notes</span>}
          {entry.highlightSame && <span className="ranking-tag">Surbrillance</span>}
          {entry.checkErrors && <span className="ranking-tag">Vérification</span>}
        </span>
      </span>
    </li>
  );
}
