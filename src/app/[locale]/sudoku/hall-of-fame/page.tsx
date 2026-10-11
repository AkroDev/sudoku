import type { Metadata } from 'next';
export { default } from '../../../sudoku/hall-of-fame/page';

export const metadata: Metadata = {
  title: 'Hall of Fame — AkroLabs Sudoku',
  description: 'Compare your Sudoku times with players around the world.',
  openGraph: { title: 'Hall of Fame — AkroLabs Sudoku', description: 'Compare your Sudoku times with players around the world.', locale: 'en_US' },
  twitter: { card: 'summary', title: 'Hall of Fame — AkroLabs Sudoku', description: 'Compare your Sudoku times with players around the world.' },
};
