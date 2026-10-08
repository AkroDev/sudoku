import type { Metadata } from 'next';
import { formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import HallOfFameView from '@/components/HallOfFameView';
import BitcoinPrice from '@/components/BitcoinPrice';

type HallOfFamePageProps = {
  searchParams: Promise<{ grid?: string | string[]; from?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Hall of Fame — AkroLabs Sudoku',
};

export default async function HallOfFamePage({ searchParams }: HallOfFamePageProps) {
  const params = await searchParams;
  const rawGrid = typeof params.grid === 'string' ? params.grid.toUpperCase() : null;
  const rawFrom = typeof params.from === 'string' ? params.from.toUpperCase() : null;
  const parsedGrid = rawGrid ? parsePuzzleId(rawGrid) : null;
  const parsedFrom = rawFrom ? parsePuzzleId(rawFrom) : null;
  const grid = parsedGrid ? formatPuzzleId(parsedGrid.difficulty, parsedGrid.seed) : null;
  const returnGrid = parsedFrom ? formatPuzzleId(parsedFrom.difficulty, parsedFrom.seed) : null;

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
        <BitcoinPrice />
        <div className="topbar-page-info">
          <div className="topbar-meta">
            <span>HALL OF FAME</span>
            {grid && <a className="grid-return-link" href={`/sudoku/${grid}`}>#{grid}</a>}
            {!grid && returnGrid && <a className="grid-return-link" href={`/sudoku/${returnGrid}`}>↩ #{returnGrid}</a>}
            {grid && <a className="grid-return-link" href={`/sudoku/hall-of-fame?from=${grid}`}>Toutes les grilles</a>}
          </div>
        </div>
      </header>

      <HallOfFameView grid={grid} returnGrid={returnGrid} />
    </main>
  );
}
