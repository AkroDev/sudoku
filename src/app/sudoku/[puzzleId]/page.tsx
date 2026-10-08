import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SudokuGame from '@/components/SudokuGame';
import { formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import { buildShareImagePath, getShareText, type ShareDetails } from '@/lib/share';

type PuzzlePageProps = {
  params: Promise<{ puzzleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function readShareSeconds(value: string | string[] | undefined) {
  const rawValue = readSearchParam(value);
  if (!rawValue || !/^\d+$/.test(rawValue)) return null;
  const seconds = Number(rawValue);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

export async function generateMetadata({ params, searchParams }: PuzzlePageProps): Promise<Metadata> {
  const { puzzleId } = await params;
  const parsed = parsePuzzleId(puzzleId);
  if (!parsed) return { title: 'Sudoku — AkroLabs' };
  const canonicalPuzzleId = formatPuzzleId(parsed.difficulty, parsed.seed);
  const elapsedSeconds = readShareSeconds((await searchParams).time);
  const title = `Sudoku #${canonicalPuzzleId} — AkroLabs`;
  if (elapsedSeconds === null) return { title };

  const shareDetails: ShareDetails = {
    puzzleId: canonicalPuzzleId,
    elapsedSeconds,
    difficulty: parsed.difficulty,
    notesUsed: readSearchParam((await searchParams).notes) === '1',
    highlightSame: readSearchParam((await searchParams).highlight) !== '0',
    checkErrors: readSearchParam((await searchParams).check) !== '0',
  };
  const description = getShareText(shareDetails);
  const imagePath = buildShareImagePath(shareDetails);

  return {
    title,
    description,
    openGraph: {
      title: description,
      description,
      type: 'website',
      images: [{ url: imagePath, width: 1200, height: 630, alt: description }],
    },
    twitter: {
      card: 'summary_large_image',
      title: description,
      description,
      images: [imagePath],
    },
  };
}

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const { puzzleId } = await params;
  const parsed = parsePuzzleId(puzzleId);
  if (!parsed) notFound();

  return <SudokuGame initialDifficulty={parsed.difficulty} initialSeed={parsed.seed} />;
}
