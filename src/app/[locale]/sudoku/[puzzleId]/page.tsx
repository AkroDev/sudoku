import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SudokuGame from '@/components/SudokuGame';
import { formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import { buildShareImagePath, getShareText, type ShareDetails } from '@/lib/share';

type PuzzlePageProps = {
  params: Promise<{ locale: string; puzzleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function readSeconds(value: string | string[] | undefined) {
  const raw = readParam(value);
  if (!raw || !/^\d+$/.test(raw)) return null;
  const seconds = Number(raw);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

export async function generateMetadata({ params, searchParams }: PuzzlePageProps): Promise<Metadata> {
  const { locale, puzzleId } = await params;
  const parsed = parsePuzzleId(puzzleId);
  if (!parsed) return { title: 'Sudoku — AkroLabs', description: 'Play Sudoku by AkroLabs.' };
  const id = formatPuzzleId(parsed.difficulty, parsed.seed);
  const query = await searchParams;
  const seconds = readSeconds(query.time);
  const title = `Sudoku #${id} — AkroLabs`;
  if (seconds === null) {
    const description = `Play Sudoku puzzle #${id} by AkroLabs.`;
    return {
      title,
      description,
      openGraph: { title, description, type: 'website', locale: 'en_US' },
      twitter: { card: 'summary', title, description },
    };
  }

  const details: ShareDetails = {
    puzzleId: id,
    elapsedSeconds: seconds,
    difficulty: parsed.difficulty,
    notesUsed: readParam(query.notes) === '1',
    highlightSame: readParam(query.highlight) !== '0',
    checkErrors: readParam(query.check) !== '0',
    locale: 'en',
  };
  const description = getShareText(details, 'en');
  const imagePath = buildShareImagePath(details, 'en');
  return {
    title,
    description,
    openGraph: { title: description, description, type: 'website', locale: 'en_US', images: [{ url: imagePath, width: 1200, height: 630, alt: description }] },
    twitter: { card: 'summary_large_image', title: description, description, images: [imagePath] },
  };
}

export default async function EnglishPuzzlePage({ params }: PuzzlePageProps) {
  const { locale, puzzleId } = await params;
  if (locale !== 'en') notFound();
  const parsed = parsePuzzleId(puzzleId);
  if (!parsed) notFound();
  return <SudokuGame initialDifficulty={parsed.difficulty} initialSeed={parsed.seed} />;
}
