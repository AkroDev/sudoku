'use client';

import { useEffect, useState } from 'react';
import { EMPTY_RANKING_MESSAGES, loadHallOfFame, type HallOfFameEntry } from '@/lib/hall-of-fame';
import RankingRow from '@/components/RankingRow';

type HallOfFameViewProps = {
  grid: string | null;
};

export default function HallOfFameView({ grid }: HallOfFameViewProps) {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);

  useEffect(() => {
    if (!grid) {
      setEntries([]);
      return;
    }

    let active = true;
    void loadHallOfFame(grid).then((nextEntries) => {
      if (active) setEntries(nextEntries);
    });
    return () => {
      active = false;
    };
  }, [grid]);

  const rankingSlots = Array.from({ length: 10 }, (_, index) => entries[index] ?? null);

  return (
    <section className="panel hall-of-fame-card" aria-label="Hall of Fame">
      <p className="eyebrow">Hall of Fame</p>
      <h1>
        {grid ? (
          <a className="grid-return-link" href={`/sudoku/${grid}`}>
            #{grid}
          </a>
        ) : 'Hall of Fame'}
      </h1>
      {grid && (
        <ol className="ranking-list ranking-list--page" aria-label="Classement">
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
      )}
    </section>
  );
}
