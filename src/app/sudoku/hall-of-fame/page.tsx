import type { Metadata } from 'next';
import { formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import HallOfFameView from '@/components/HallOfFameView';
import AppHeader from '@/components/AppHeader';

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
      <AppHeader page="hall-of-fame" grid={grid} returnGrid={returnGrid} />
      <HallOfFameView grid={grid} returnGrid={returnGrid} />
    </main>
  );
}
