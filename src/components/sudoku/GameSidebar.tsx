import { EMPTY_RANKING_MESSAGES, type HallOfFameEntry } from '@/lib/hall-of-fame';
import type { DifficultyStatistics, PersonalStatistics } from '@/lib/statistics';
import { formatTime } from '@/lib/time';
import RankingRow from '@/components/RankingRow';

type GameSidebarProps = {
  puzzleId: string;
  hallOfFame: HallOfFameEntry[];
  statistics: PersonalStatistics;
  currentStatistics: DifficultyStatistics;
  averageTime: number | null;
};

function formatOptionalTime(value: number | null) {
  return value === null ? '—' : formatTime(value);
}

export default function GameSidebar({ puzzleId, hallOfFame, statistics, currentStatistics, averageTime }: GameSidebarProps) {
  const rankingSlots = Array.from({ length: 10 }, (_, index) => hallOfFame[index] ?? null);

  return (
    <aside className="side-column">
      <section className="panel side-panel hof-panel">
        <div className="hof-heading">
          <a className="hof-link" href={`/sudoku/hall-of-fame?grid=${puzzleId}`} aria-label="Hall of Fame">
            <div className="hof-copy">
              <p className="panel-title">Hall of Fame</p>
              <div className="hof-number-line">
                <strong>#{puzzleId}</strong>
                <span className="hof-arrow" aria-hidden="true">↗</span>
              </div>
            </div>
          </a>
        </div>
        <ol className="ranking-list ranking-list--compact" aria-label="Classement">
          {rankingSlots.map((entry, index) => (
            entry ? (
              <RankingRow key={`${entry.puzzleId}-${entry.completedAt}-${index}`} entry={entry} index={index} />
            ) : (
              <li className="ranking-row ranking-row--empty" key={`empty-${index}`}>
                <span className="ranking-rank">#{index + 1}</span>
                <span className="ranking-empty-message">{EMPTY_RANKING_MESSAGES[index] ?? '—'}</span>
              </li>
            )
          ))}
        </ol>
      </section>

      <section className="panel side-panel personal-stats-panel" aria-label="Statistiques personnelles">
        <p className="panel-title">Statistiques personnelles</p>
        <div className="stats-grid">
          <div className="stat-item"><span>Parties terminées</span><strong>{statistics.totalCompleted}</strong></div>
          <div className="stat-item"><span>Meilleur temps</span><strong>{formatOptionalTime(currentStatistics.bestTime)}</strong></div>
          <div className="stat-item"><span>Temps moyen</span><strong>{formatOptionalTime(averageTime)}</strong></div>
          <div className="stat-item"><span>Erreurs</span><strong>{currentStatistics.errors}</strong></div>
        </div>
        <a className="stats-detail-link" href="/sudoku/statistiques">
          Voir mes statistiques détaillées
        </a>
      </section>
    </aside>
  );
}
