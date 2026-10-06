import type { Metadata } from 'next';
import { parsePuzzleId } from '@/lib/sudoku';

type HallOfFamePageProps = {
  searchParams: Promise<{ grid?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Hall of Fame — AkroLabs Sudoku',
};

export default async function HallOfFamePage({ searchParams }: HallOfFamePageProps) {
  const params = await searchParams;
  const rawGrid = typeof params.grid === 'string' ? params.grid.toUpperCase() : null;
  const grid = rawGrid && parsePuzzleId(rawGrid) ? rawGrid : null;

  return (
    <main className="app-shell hall-of-fame-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <div>
            <p className="brand-name">AkroLabs</p>
            <p className="brand-subtitle">Sudoku</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span>HALL OF FAME</span>
          {grid && <strong>#{grid}</strong>}
        </div>
      </header>

      <section className="panel hall-of-fame-card" aria-label="Hall of Fame">
        <p className="eyebrow">Hall of Fame</p>
        <h1>{grid ? `#${grid}` : 'Hall of Fame'}</h1>
      </section>
    </main>
  );
}
