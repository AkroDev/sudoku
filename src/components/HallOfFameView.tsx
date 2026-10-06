'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_HALL_OF_FAME_FILTERS,
  EMPTY_RANKING_MESSAGES,
  loadHallOfFame,
  type HallOfFameEntry,
  type HallOfFameFilters,
} from '@/lib/hall-of-fame';
import RankingRow from '@/components/RankingRow';
import GridLookup from '@/components/GridLookup';

type HallOfFameViewProps = {
  grid: string | null;
};

export default function HallOfFameView({ grid }: HallOfFameViewProps) {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [filters, setFilters] = useState<HallOfFameFilters>(DEFAULT_HALL_OF_FAME_FILTERS);

  useEffect(() => {
    if (!grid) {
      setEntries([]);
      return;
    }

    let active = true;
    void loadHallOfFame(grid, filters).then((nextEntries) => {
      if (active) setEntries(nextEntries);
    });
    return () => {
      active = false;
    };
  }, [grid, filters]);

  const rankingSlots = Array.from({ length: 10 }, (_, index) => entries[index] ?? null);

  return (
    <section className="panel hall-of-fame-card" aria-label="Hall of Fame">
      <GridLookup initialGrid={grid} />
      <p className="eyebrow">Hall of Fame</p>
      <h1>
        {grid ? (
          <a className="grid-return-link" href={`/sudoku/${grid}`}>
            #{grid}
          </a>
        ) : 'Hall of Fame'}
      </h1>
      {grid && (
        <>
          <div className="hof-filters" aria-label="Filtrer le classement">
            <label className="hof-filter">
              <span>Notes</span>
              <select
                value={filters.notes}
                onChange={(event) => setFilters((current) => ({ ...current, notes: event.target.value as HallOfFameFilters['notes'] }))}
              >
                <option value="all">Toutes</option>
                <option value="with">Avec</option>
                <option value="without">Sans</option>
              </select>
            </label>
            <label className="hof-filter">
              <span>Surbrillance</span>
              <select
                value={filters.highlightSame}
                onChange={(event) => setFilters((current) => ({ ...current, highlightSame: event.target.value as HallOfFameFilters['highlightSame'] }))}
              >
                <option value="all">Toutes</option>
                <option value="with">Activée</option>
                <option value="without">Désactivée</option>
              </select>
            </label>
            <label className="hof-filter">
              <span>Vérification</span>
              <select
                value={filters.checkErrors}
                onChange={(event) => setFilters((current) => ({ ...current, checkErrors: event.target.value as HallOfFameFilters['checkErrors'] }))}
              >
                <option value="all">Toutes</option>
                <option value="with">Activée</option>
                <option value="without">Désactivée</option>
              </select>
            </label>
          </div>
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
        </>
      )}
    </section>
  );
}
