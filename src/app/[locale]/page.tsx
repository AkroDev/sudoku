import type { Metadata } from 'next';
import SudokuGame from '@/components/SudokuGame';

export const metadata: Metadata = {
  title: 'Sudoku — AkroLabs',
  description: 'Play Sudoku by AkroLabs.',
  openGraph: {
    title: 'Sudoku — AkroLabs',
    description: 'Your turn!',
    locale: 'en_US',
    url: '/en',
    images: [{ url: '/api/og?mode=home&lang=en', width: 1200, height: 630, alt: 'Sudoku — AkroLabs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sudoku — AkroLabs',
    description: 'Your turn!',
    images: ['/api/og?mode=home&lang=en'],
  },
};

export default function EnglishHomePage() {
  return <SudokuGame resumeLastPuzzle />;
}
