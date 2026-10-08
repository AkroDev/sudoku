import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SudokuGame from '@/components/SudokuGame';
import { formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';

type PuzzlePageProps = {
  params: Promise<{ puzzleId: string }>;
};

export async function generateMetadata({ params }: PuzzlePageProps): Promise<Metadata> {
  const { puzzleId } = await params;
  const parsed = parsePuzzleId(puzzleId);
  if (!parsed) return { title: 'Sudoku — AkroLabs' };
  return { title: `Sudoku #${formatPuzzleId(parsed.difficulty, parsed.seed)} — AkroLabs` };
}

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const { puzzleId } = await params;
  const parsed = parsePuzzleId(puzzleId);
  if (!parsed) notFound();

  return <SudokuGame initialDifficulty={parsed.difficulty} initialSeed={parsed.seed} />;
}
