'use client';

import { useEffect, useState } from 'react';
import { EMPTY_RANKING_MESSAGES, loadHallOfFame, type HallOfFameEntry } from '@/lib/hall-of-fame';
import { formatTime } from '@/lib/time';

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
      <h1>{grid ? `#${grid}` : 'Hall of Fame'}</h1>
      {grid && (
        <ol className="ranking-list ranking-list--page" aria-label="Classement">
          {rankingSlots.map((entry, index) => (
            <li className={`ranking-row${entry ? '' : ' ranking-row--empty'}`} key={entry ? `${entry.puzzleId}-${entry.completedAt}-${index}` : `empty-${index}`}>
              <span className="ranking-rank">#{index + 1}</span>
              {entry ? (
                <span className="ranking-score">
                  <span className="ranking-name">{entry.nickname}</span>
                  <span className="ranking-time">{formatTime(entry.finalTime)}</span>
                </span>
              ) : (
                <span className="ranking-empty-message">{EMPTY_RANKING_MESSAGES[index] ?? '—'}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
