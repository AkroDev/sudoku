import type { Metadata } from 'next';
import PersonalStatisticsView from '@/components/PersonalStatisticsView';

export const metadata: Metadata = {
  title: 'Statistiques personnelles — AkroLabs Sudoku',
};

export default function StatisticsPage() {
  return <PersonalStatisticsView />;
}
