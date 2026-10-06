import type { Metadata } from 'next';
import { parsePuzzleId } from '@/lib/sudoku';
import HallOfFameView from '@/components/HallOfFameView';

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
        <a className="brand-link" href="https://akrolabs.fr/fr/labs">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">✦</span>
            <div>
              <p className="brand-name">AkroLabs</p>
              <p className="brand-subtitle">Sudoku</p>
            </div>
          </div>
        </a>
        <div className="topbar-meta">
          <span>HALL OF FAME</span>
          {grid && <a className="grid-return-link" href={`/sudoku/${grid}`}>#{grid}</a>}
        </div>
      </header>

      <HallOfFameView grid={grid} />
    </main>
  );
}
