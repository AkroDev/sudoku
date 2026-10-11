import type { Metadata } from 'next';
export { default } from '../../../sudoku/statistiques/page';

export const metadata: Metadata = {
  title: 'Personal stats — AkroLabs Sudoku',
  description: 'Review your personal Sudoku statistics and game history.',
  openGraph: { title: 'Personal stats — AkroLabs Sudoku', description: 'Review your personal Sudoku statistics and game history.', locale: 'en_US' },
  twitter: { card: 'summary', title: 'Personal stats — AkroLabs Sudoku', description: 'Review your personal Sudoku statistics and game history.' },
};
