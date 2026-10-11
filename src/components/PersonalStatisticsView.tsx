'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createEmptyStatistics,
  loadStatistics,
  type CompletedGameRecord,
  type PersonalStatistics,
} from '@/lib/statistics';
import { DIFFICULTY_ORDER, DIFFICULTY_PROFILES } from '@/lib/sudoku';
import { formatTime } from '@/lib/time';
import { useLocaleText } from '@/i18n';
import AppHeader from '@/components/AppHeader';

function formatOptionalTime(value: number | null) {
  return value === null ? '—' : formatTime(value);
}

function formatAverageTime(totalTime: number, completed: number) {
  return completed > 0 ? formatTime(Math.round(totalTime / completed)) : '—';
}

function formatCompletedAt(timestamp: number, locale: 'fr' | 'en') {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function RecordOptions({ record }: { record: CompletedGameRecord }) {
  const { t } = useLocaleText();
  return (
    <div className="stats-record-options" aria-label={t('Options utilisées')}>
      {record.notesUsed && <span className="ranking-tag">{t('Notes')}</span>}
      {record.highlightSame && <span className="ranking-tag">{t('Surbrillance')}</span>}
      {record.checkErrors && <span className="ranking-tag">{t('Vérification')}</span>}
    </div>
  );
}

export default function PersonalStatisticsView() {
  const { locale, t } = useLocaleText();
  const [statistics, setStatistics] = useState<PersonalStatistics>(() => createEmptyStatistics());

  useEffect(() => {
    setStatistics(loadStatistics());
  }, []);

  const currentStatistics = statistics.byDifficulty;
  const averageTime = useMemo(() => (
    statistics.totalCompleted > 0
      ? Math.round(DIFFICULTY_ORDER.reduce((total, difficulty) => total + currentStatistics[difficulty].totalTime, 0) / statistics.totalCompleted)
      : null
  ), [currentStatistics, statistics.totalCompleted]);

  return (
    <main className="app-shell statistics-page">
      <AppHeader page="statistics" />

      <div className="statistics-page-content">
        <section className="panel statistics-hero">
          <p className="eyebrow">{t('Sudoku')}</p>
          <h1>{t('Voir mes statistiques détaillées')}</h1>
          <div className="stats-grid statistics-summary-grid">
            <div className="stat-item"><span>{t('Parties terminées')}</span><strong>{statistics.totalCompleted}</strong></div>
            <div className="stat-item"><span>{t('Meilleur temps')}</span><strong>{formatOptionalTime(DIFFICULTY_ORDER.reduce<number | null>((best, difficulty) => {
              const difficultyBest = currentStatistics[difficulty].bestTime;
              if (difficultyBest === null) return best;
              return best === null ? difficultyBest : Math.min(best, difficultyBest);
            }, null))}</strong></div>
            <div className="stat-item"><span>{t('Temps moyen')}</span><strong>{formatOptionalTime(averageTime)}</strong></div>
            <div className="stat-item"><span>{t('Erreurs')}</span><strong>{DIFFICULTY_ORDER.reduce((total, difficulty) => total + currentStatistics[difficulty].errors, 0)}</strong></div>
          </div>
        </section>

        <section className="panel statistics-card">
          <p className="panel-title">{t('Statistiques par difficulté')}</p>
          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th scope="col">{t('Difficulté')}</th>
                  <th scope="col">{t('Parties terminées')}</th>
                  <th scope="col">{t('Meilleur temps')}</th>
                  <th scope="col">{t('Temps moyen')}</th>
                  <th scope="col">{t('Erreurs')}</th>
                </tr>
              </thead>
              <tbody>
                {DIFFICULTY_ORDER.map((difficulty) => {
                  const entry = currentStatistics[difficulty];
                  return (
                    <tr key={difficulty}>
                      <th scope="row">{t(DIFFICULTY_PROFILES[difficulty].label)}</th>
                      <td>{entry.completed}</td>
                      <td>{formatOptionalTime(entry.bestTime)}</td>
                      <td>{formatAverageTime(entry.totalTime, entry.completed)}</td>
                      <td>{entry.errors}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel statistics-card">
          <p className="panel-title">{t('Historique')}</p>
          {statistics.history.length === 0 ? (
            <p className="stats-empty">—</p>
          ) : (
            <div className="stats-table-wrap">
              <table className="stats-table stats-history-table">
                <thead>
                  <tr>
                    <th scope="col">{t('Grille')}</th>
                    <th scope="col">{t('Difficulté')}</th>
                    <th scope="col">{t('Temps')}</th>
                    <th scope="col">{t('Erreurs')}</th>
                    <th scope="col">{t('Options')}</th>
                    <th scope="col">{t('Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.history.map((record) => (
                    <tr key={`${record.puzzleId}-${record.completedAt}`}>
                      <th scope="row">#{record.puzzleId}</th>
                      <td>{t(DIFFICULTY_PROFILES[record.difficulty].label)}</td>
                      <td>{formatTime(record.finalTime)}</td>
                      <td>{record.errors}</td>
                      <td><RecordOptions record={record} /></td>
                      <td>{formatCompletedAt(record.completedAt, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
