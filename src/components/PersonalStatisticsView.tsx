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
import BitcoinPrice from '@/components/BitcoinPrice';

function formatOptionalTime(value: number | null) {
  return value === null ? '—' : formatTime(value);
}

function formatAverageTime(totalTime: number, completed: number) {
  return completed > 0 ? formatTime(Math.round(totalTime / completed)) : '—';
}

function formatCompletedAt(timestamp: number) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function RecordOptions({ record }: { record: CompletedGameRecord }) {
  return (
    <div className="stats-record-options" aria-label="Options utilisées">
      {record.notesUsed && <span className="ranking-tag">Notes</span>}
      {record.highlightSame && <span className="ranking-tag">Surbrillance</span>}
      {record.checkErrors && <span className="ranking-tag">Vérification</span>}
    </div>
  );
}

export default function PersonalStatisticsView() {
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
      <header className="topbar">
        <a className="brand-link" href="https://akrolabs.fr/fr/labs">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">✦</span>
            <div>
              <p className="brand-name">AkroLabs</p>
              <p className="brand-subtitle">Sudoku</p>
            </div>
          </div>
        </a>
        <BitcoinPrice />
        <div className="topbar-page-info">
          <div className="topbar-meta">
            <span>STATISTIQUES PERSONNELLES</span>
            <a className="grid-return-link" href="/">Sudoku</a>
          </div>
        </div>
      </header>

      <div className="statistics-page-content">
        <section className="panel statistics-hero">
          <p className="eyebrow">Sudoku</p>
          <h1>Voir mes statistiques détaillées</h1>
          <div className="stats-grid statistics-summary-grid">
            <div className="stat-item"><span>Parties terminées</span><strong>{statistics.totalCompleted}</strong></div>
            <div className="stat-item"><span>Meilleur temps</span><strong>{formatOptionalTime(DIFFICULTY_ORDER.reduce<number | null>((best, difficulty) => {
              const difficultyBest = currentStatistics[difficulty].bestTime;
              if (difficultyBest === null) return best;
              return best === null ? difficultyBest : Math.min(best, difficultyBest);
            }, null))}</strong></div>
            <div className="stat-item"><span>Temps moyen</span><strong>{formatOptionalTime(averageTime)}</strong></div>
            <div className="stat-item"><span>Erreurs</span><strong>{DIFFICULTY_ORDER.reduce((total, difficulty) => total + currentStatistics[difficulty].errors, 0)}</strong></div>
          </div>
        </section>

        <section className="panel statistics-card">
          <p className="panel-title">Statistiques par difficulté</p>
          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th scope="col">Difficulté</th>
                  <th scope="col">Parties terminées</th>
                  <th scope="col">Meilleur temps</th>
                  <th scope="col">Temps moyen</th>
                  <th scope="col">Erreurs</th>
                </tr>
              </thead>
              <tbody>
                {DIFFICULTY_ORDER.map((difficulty) => {
                  const entry = currentStatistics[difficulty];
                  return (
                    <tr key={difficulty}>
                      <th scope="row">{DIFFICULTY_PROFILES[difficulty].label}</th>
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
          <p className="panel-title">Historique</p>
          {statistics.history.length === 0 ? (
            <p className="stats-empty">—</p>
          ) : (
            <div className="stats-table-wrap">
              <table className="stats-table stats-history-table">
                <thead>
                  <tr>
                    <th scope="col">Grille</th>
                    <th scope="col">Difficulté</th>
                    <th scope="col">Temps</th>
                    <th scope="col">Erreurs</th>
                    <th scope="col">Options</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.history.map((record) => (
                    <tr key={`${record.puzzleId}-${record.completedAt}`}>
                      <th scope="row">#{record.puzzleId}</th>
                      <td>{DIFFICULTY_PROFILES[record.difficulty].label}</td>
                      <td>{formatTime(record.finalTime)}</td>
                      <td>{record.errors}</td>
                      <td><RecordOptions record={record} /></td>
                      <td>{formatCompletedAt(record.completedAt)}</td>
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
