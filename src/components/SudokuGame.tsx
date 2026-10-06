'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  createPuzzle,
  DIFFICULTY_ORDER,
  DIFFICULTY_PROFILES,
  type Difficulty,
} from '@/lib/sudoku';
import {
  createEmptyStatistics,
  loadStatistics,
  recordCompletedGame,
  type PersonalStatistics,
} from '@/lib/statistics';
import { syncCompletedGame } from '@/lib/supabase-stats';
import { sendMagicLink, signOutFromSupabase, subscribeToSupabaseSession } from '@/lib/supabase-auth';

type Cell = number | null;
type Grid = Cell[][];
type NotesGrid = number[][][];

const ERROR_PENALTY_SECONDS = 15;
const DEFAULT_DIFFICULTY: Difficulty = 'medium';
const DEFAULT_SEED = 1927;

function createInitialGrid(puzzle: number[][]): Grid {
  return puzzle.map((row) => row.map((value) => (value === 0 ? null : value)));
}
function createEmptyNotes(): NotesGrid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds];
  return parts.map((part) => String(part).padStart(2, '0')).join(':');
}

function isSameUnit(row: number, column: number, selectedRow: number, selectedColumn: number) {
  const sameRow = row === selectedRow;
  const sameColumn = column === selectedColumn;
  const sameBlock = Math.floor(row / 3) === Math.floor(selectedRow / 3)
    && Math.floor(column / 3) === Math.floor(selectedColumn / 3);
  return sameRow || sameColumn || sameBlock;
}

type SudokuGameProps = {
  initialDifficulty?: Difficulty;
  initialSeed?: number;
};

export default function SudokuGame({
  initialDifficulty = DEFAULT_DIFFICULTY,
  initialSeed = DEFAULT_SEED,
}: SudokuGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [seed, setSeed] = useState(initialSeed);
  const puzzle = useMemo(() => createPuzzle(difficulty, seed), [difficulty, seed]);
  const storageKey = `akrolabs-sudoku-${puzzle.id.toLowerCase()}`;
  const [grid, setGrid] = useState<Grid>(() => createInitialGrid(puzzle.grid));
  const [notes, setNotes] = useState<NotesGrid>(createEmptyNotes);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [errors, setErrors] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [notesUsed, setNotesUsed] = useState(false);
  const [highlightSame, setHighlightSame] = useState(true);
  const [checkErrors, setCheckErrors] = useState(true);
  const [errorCell, setErrorCell] = useState<number | null>(null);
  const [correctCell, setCorrectCell] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [statistics, setStatistics] = useState<PersonalStatistics>(() => createEmptyStatistics());
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const completionRecorded = useRef(false);

  const puzzleId = puzzle.id;
  const puzzleGrid = puzzle.grid;
  const solution = puzzle.solution;
  const difficultyLabel = puzzle.label;

  useEffect(() => {
    if (window.location.pathname.startsWith('/sudoku/')) {
      window.history.replaceState(null, '', `/sudoku/${puzzleId}`);
    }
  }, [puzzleId]);

  const selectedRow = selectedCell === null ? null : Math.floor(selectedCell / 9);
  const selectedColumn = selectedCell === null ? null : selectedCell % 9;
  const selectedValue = selectedCell === null || selectedRow === null || selectedColumn === null
    ? null
    : grid[selectedRow][selectedColumn];

  useEffect(() => {
    setStatistics(loadStatistics());
  }, []);

  useEffect(() => subscribeToSupabaseSession(setSession), []);

  useEffect(() => {
    setHydrated(false);
    setGrid(createInitialGrid(puzzleGrid));
    setNotes(createEmptyNotes());
    setSelectedCell(null);
    setElapsedSeconds(0);
    setPenalties(0);
    setErrors(0);
    setStarted(false);
    setPaused(false);
    setCompleted(false);
    setNotesUsed(false);
    setErrorCell(null);
    setCorrectCell(null);
    completionRecorded.current = false;

    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (Array.isArray(state.grid) && Array.isArray(state.notes)) {
          setGrid(state.grid);
          setNotes(state.notes);
          setSelectedCell(typeof state.selectedCell === 'number' ? state.selectedCell : null);
          setElapsedSeconds(Number(state.elapsedSeconds) || 0);
          setPenalties(Number(state.penalties) || 0);
          setErrors(Number(state.errors) || 0);
          setStarted(Boolean(state.started));
          setPaused(Boolean(state.paused));
          setCompleted(Boolean(state.completed));
          setNotesMode(Boolean(state.notesMode));
          setNotesUsed(Boolean(state.notesUsed));
          setHighlightSame(state.highlightSame !== false);
          setCheckErrors(state.checkErrors !== false);
          completionRecorded.current = Boolean(state.completed);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setHydrated(true);
  }, [puzzleGrid, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify({
      grid,
      notes,
      selectedCell,
      elapsedSeconds,
      penalties,
      errors,
      started,
      paused,
      completed,
      notesMode,
      notesUsed,
      highlightSame,
      checkErrors,
    }));
  }, [grid, notes, selectedCell, elapsedSeconds, penalties, errors, started, paused, completed, notesMode, notesUsed, highlightSame, checkErrors, hydrated, storageKey]);

  useEffect(() => {
    if (!started || paused || completed) return;
    const timer = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, paused, completed]);

  const completeGame = (nextGrid: Grid) => {
    const isFull = nextGrid.every((row) => row.every((value) => value !== null));
    const isCorrect = nextGrid.every((row, rowIndex) => row.every((value, columnIndex) => value === solution[rowIndex][columnIndex]));
    if (isFull && isCorrect) {
      setCompleted(true);
      setStarted(false);
      if (!completionRecorded.current) {
        const completedRecord = {
          puzzleId,
          difficulty,
          seed,
          rawTime: elapsedSeconds,
          penalties,
          finalTime: elapsedSeconds + penalties,
          errors,
          notesUsed,
          highlightSame,
          checkErrors,
          completedAt: Date.now(),
        };
        const nextStatistics = recordCompletedGame(completedRecord);
        setStatistics(nextStatistics);
        void syncCompletedGame(completedRecord);
        completionRecorded.current = true;
      }
    }
  };

  const enterValue = (value: number) => {
    if (selectedCell === null || paused || completed) return;
    const row = Math.floor(selectedCell / 9);
    const column = selectedCell % 9;
    if (puzzleGrid[row][column] !== 0) return;

    if (!started) setStarted(true);

    if (notesMode) {
      setNotesUsed(true);
      setNotes((current) => current.map((notesRow, rowIndex) => notesRow.map((cellNotes, columnIndex) => {
        if (rowIndex !== row || columnIndex !== column) return cellNotes;
        return cellNotes.includes(value)
          ? cellNotes.filter((candidate) => candidate !== value)
          : [...cellNotes, value].sort((a, b) => a - b);
      })));
      return;
    }

    if (checkErrors && value !== solution[row][column]) {
      setErrorCell(selectedCell);
      setErrors((current) => current + 1);
      setPenalties((current) => current + ERROR_PENALTY_SECONDS);
      window.setTimeout(() => setErrorCell(null), 1000);
      return;
    }

    const nextGrid = grid.map((gridRow) => [...gridRow]);
    nextGrid[row][column] = value;
    setGrid(nextGrid);
    setNotes((current) => current.map((notesRow, rowIndex) => notesRow.map((cellNotes, columnIndex) => (
      rowIndex === row && columnIndex === column ? [] : cellNotes
    ))));
    setCorrectCell(selectedCell);
    window.setTimeout(() => setCorrectCell(null), 480);
    completeGame(nextGrid);
  };

  const clearValue = () => {
    if (selectedCell === null || paused || completed) return;
    const row = Math.floor(selectedCell / 9);
    const column = selectedCell % 9;
    if (puzzleGrid[row][column] !== 0) return;
    setGrid((current) => current.map((gridRow, rowIndex) => gridRow.map((value, columnIndex) => (
      rowIndex === row && columnIndex === column ? null : value
    ))));
  };

  const moveSelection = (rowDelta: number, columnDelta: number) => {
    const current = selectedCell ?? 0;
    const row = Math.floor(current / 9);
    const column = current % 9;
    const nextRow = Math.min(8, Math.max(0, row + rowDelta));
    const nextColumn = Math.min(8, Math.max(0, column + columnDelta));
    setSelectedCell(nextRow * 9 + nextColumn);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (paused || completed) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const deltas: Record<string, [number, number]> = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
        };
        moveSelection(...deltas[event.key]);
      } else if (/^[1-9]$/.test(event.key)) {
        enterValue(Number(event.key));
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        clearValue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const confirmNewGame = () => started && !completed && !window.confirm('Nouvelle grille ?');

  const resetGame = () => {
    if (confirmNewGame()) return;
    setSeed((current) => current + 1);
  };

  const selectDifficulty = (nextDifficulty: Difficulty) => {
    if (nextDifficulty === difficulty || confirmNewGame()) return;
    setDifficulty(nextDifficulty);
  };

  const handleMagicLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    setMagicLinkSent(false);
    const result = await sendMagicLink(email.trim());
    if (result.sent) setMagicLinkSent(true);
    setAuthBusy(false);
  };

  const activeNumber = useMemo(() => (
    selectedValue ?? (selectedCell === null || selectedRow === null || selectedColumn === null
      ? null
      : grid[selectedRow][selectedColumn])
  ), [grid, selectedCell, selectedRow, selectedColumn, selectedValue]);
  const currentStatistics = statistics.byDifficulty[difficulty];
  const averageTime = currentStatistics.completed > 0
    ? Math.round(currentStatistics.totalTime / currentStatistics.completed)
    : null;
  const formatOptionalTime = (value: number | null) => value === null ? '—' : formatTime(value);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <div>
            <p className="brand-name">AkroLabs</p>
            <p className="brand-subtitle">Sudoku</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span>GRILLE</span>
          <strong>#{puzzleId}</strong>
          <span className="meta-dot">•</span>
          <span>{difficultyLabel}</span>
        </div>
      </header>

      <div className="game-layout">
        <section className="panel board-panel" aria-label="Grille Sudoku">
          <div className="board-heading">
            <div>
              <p className="eyebrow">Sudoku</p>
              <h1>#{puzzleId}</h1>
            </div>
            <div className="timer" aria-label="Chronomètre">{formatTime(elapsedSeconds)}</div>
          </div>

          <div className="board-wrap">
            <div className="sudoku-grid" role="grid" aria-label="Grille 9 par 9">
              {grid.map((row, rowIndex) => row.map((value, columnIndex) => {
                const index = rowIndex * 9 + columnIndex;
                const isGiven = puzzleGrid[rowIndex][columnIndex] !== 0;
                const isSelected = selectedCell === index;
                const isRelated = selectedRow !== null && selectedColumn !== null
                  && isSameUnit(rowIndex, columnIndex, selectedRow, selectedColumn);
                const isSame = highlightSame && activeNumber !== null && value === activeNumber;
                const classes = [
                  'cell',
                  isGiven ? 'cell--given' : 'cell--user',
                  isRelated ? 'cell--related' : '',
                  isSame ? 'cell--same' : '',
                  isSelected ? 'cell--selected' : '',
                  errorCell === index ? 'cell--error' : '',
                  correctCell === index ? 'cell--correct' : '',
                ].filter(Boolean).join(' ');

                return (
                  <button
                    className={classes}
                    key={index}
                    type="button"
                    role="gridcell"
                    aria-label={`Case ${index + 1}`}
                    aria-selected={isSelected}
                    onClick={() => {
                      if (!paused && !completed) {
                        setSelectedCell(index);
                        if (!started && !isGiven) setStarted(true);
                      }
                    }}
                  >
                    {value ?? (
                      <span className="cell-notes">
                        {Array.from({ length: 9 }, (_, noteIndex) => (
                          <span key={noteIndex}>{notes[rowIndex][columnIndex].includes(noteIndex + 1) ? noteIndex + 1 : ''}</span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              }))}
            </div>

            {paused && (
              <div className="board-overlay">
                <p className="eyebrow">Pause</p>
                <button className="action-button action-button--primary" type="button" onClick={() => setPaused(false)}>
                  Reprendre
                </button>
              </div>
            )}
          </div>

          <div className="board-actions">
            <button className="action-button" type="button" onClick={() => setPaused((current) => !current)}>
              {paused ? 'Reprendre' : 'Pause'}
            </button>
            <button className="action-button" type="button" onClick={resetGame}>
              Nouvelle grille
            </button>
          </div>

          <div className="number-pad" aria-label="Saisie des chiffres">
            {Array.from({ length: 9 }, (_, index) => (
              <button className="number-button" key={index + 1} type="button" onClick={() => enterValue(index + 1)}>
                {index + 1}
              </button>
            ))}
            <button className="number-button number-button--clear" type="button" aria-label="Effacer" onClick={clearValue}>
              ×
            </button>
          </div>
        </section>

        <aside className="side-column">
          <section className="panel side-panel">
            <p className="panel-title">Chronomètre</p>
            <div className="status-card">
              <strong>{formatTime(elapsedSeconds)}</strong>
              <span className="penalty">{penalties > 0 ? `+${penalties} s` : ' '}</span>
            </div>
          </section>

          <section className="panel side-panel">
            <p className="panel-title">Options</p>
            <div className="control-list">
              <div className="control-row">
                <span>Notes</span>
                <button className="toggle-button" type="button" aria-pressed={notesMode} onClick={() => setNotesMode((current) => !current)}>
                  {notesMode ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="control-row">
                <span>Surbrillance</span>
                <button className="toggle-button" type="button" aria-pressed={highlightSame} onClick={() => setHighlightSame((current) => !current)}>
                  {highlightSame ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="control-row">
                <span>Vérification des erreurs</span>
                <button className="toggle-button" type="button" aria-pressed={checkErrors} onClick={() => setCheckErrors((current) => !current)}>
                  {checkErrors ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </section>

          <section className="panel side-panel">
            <p className="panel-title">Difficulté</p>
            <div className="difficulty-row">
              {DIFFICULTY_ORDER.map((option) => (
                <button
                  className="difficulty-button"
                  key={option}
                  type="button"
                  aria-pressed={option === difficulty}
                  onClick={() => selectDifficulty(option)}
                >
                  {DIFFICULTY_PROFILES[option].label}
                </button>
              ))}
            </div>
          </section>

          <section className="panel side-panel auth-panel" aria-label="Se connecter pour synchroniser mes statistiques">
            {session?.user ? (
              <div className="auth-user">
                <span className="auth-email">{session.user.email}</span>
                <button className="action-button" type="button" onClick={() => void signOutFromSupabase()}>
                  Se déconnecter
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleMagicLinkSubmit}>
                <label className="field-label" htmlFor="sudoku-email">Adresse e-mail</label>
                <input
                  className="auth-input"
                  id="sudoku-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMagicLinkSent(false);
                  }}
                  required
                />
                <button className="action-button action-button--primary" type="submit" disabled={authBusy}>
                  Se connecter pour synchroniser mes statistiques
                </button>
                {magicLinkSent && (
                  <p className="auth-status" role="status">Lien envoyé. Consultez votre boîte mail.</p>
                )}
              </form>
            )}
          </section>

          <section className="panel side-panel">
            <p className="panel-title">Statistiques personnelles</p>
            <div className="stats-grid">
              <div className="stat-item"><span>Parties terminées</span><strong>{statistics.totalCompleted}</strong></div>
              <div className="stat-item"><span>Meilleur temps</span><strong>{formatOptionalTime(currentStatistics.bestTime)}</strong></div>
              <div className="stat-item"><span>Temps moyen</span><strong>{formatOptionalTime(averageTime)}</strong></div>
              <div className="stat-item"><span>Erreurs</span><strong>{currentStatistics.errors}</strong></div>
            </div>
            <p className="field-label history-heading">Historique</p>
            <ul className="history-list">
              {statistics.history.slice(0, 5).map((record) => (
                <li className="history-item" key={`${record.puzzleId}-${record.completedAt}`}>
                  <strong>#{record.puzzleId}</strong>
                  <span>{formatTime(record.finalTime)}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {completed && (
        <section className="panel side-panel" aria-label="Fin de partie">
          <p className="panel-title">Sudoku #{puzzleId} terminé</p>
          <div className="status-line"><span>Temps</span><strong>{formatTime(elapsedSeconds)}</strong></div>
          <div className="status-line"><span>Pénalités</span><strong>+{penalties} s</strong></div>
          <div className="status-line"><span>Temps final</span><strong>{formatTime(elapsedSeconds + penalties)}</strong></div>
          <div className="status-line"><span>Erreurs</span><strong>{errors}</strong></div>
          <div className="status-line"><span>Surbrillance</span><strong>{highlightSame ? 'activée' : 'désactivée'}</strong></div>
          <div className="status-line"><span>Vérification des erreurs</span><strong>{checkErrors ? 'activée' : 'désactivée'}</strong></div>
        </section>
      )}

      <p className="footer-line">AkroLabs · Sudoku</p>
    </main>
  );
}
