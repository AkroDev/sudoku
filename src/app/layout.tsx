import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Sudoku — AkroLabs',
  description: 'Sudoku AkroLabs',
  openGraph: {
    title: 'Sudoku — AkroLabs',
    description: 'À toi de jouer !',
    type: 'website',
    url: '/',
    images: [{
      url: '/api/og?mode=home',
      width: 1200,
      height: 630,
      alt: 'Sudoku — AkroLabs',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sudoku — AkroLabs',
    description: 'À toi de jouer !',
    images: ['/api/og?mode=home'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
