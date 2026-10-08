'use client';

import { useEffect, useLayoutEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  createCatalogPuzzle,
  createPuzzle,
  findNextDistinctSeed,
  type Difficulty,
} from '@/lib/sudoku';
import {
  createEmptyStatistics,
  loadStatistics,
  type CompletedGameRecord,
  type PersonalStatistics,
} from '@/lib/statistics';
import { sendMagicLink, signOutFromSupabase, subscribeToSupabaseSession } from '@/lib/supabase-auth';
import { loadHallOfFame, type HallOfFameEntry } from '@/lib/hall-of-fame';
import BitcoinPrice from '@/components/BitcoinPrice';
import CompletionDialog from '@/components/sudoku/CompletionDialog';
import GameDialogs from '@/components/sudoku/GameDialogs';
import GameSidebar from '@/components/sudoku/GameSidebar';
import SettingsDialog from '@/components/sudoku/SettingsDialog';
import SudokuBoard from '@/components/sudoku/SudokuBoard';
import type { Grid, NotesGrid } from '@/components/sudoku/types';
import { useGameKeyboard } from '@/components/sudoku/useGameKeyboard';
import { useGameTimer } from '@/components/sudoku/useGameTimer';
import { useSudokuPersistence } from '@/components/sudoku/useSudokuPersistence';
import { usePublicScoreSubmission } from '@/components/sudoku/usePublicScoreSubmission';
import { useSudokuGameplay } from '@/components/sudoku/useSudokuGameplay';
import { useGameCompletion } from '@/components/sudoku/useGameCompletion';
import { useGameSharing } from '@/components/sudoku/useGameSharing';

const DEFAULT_DIFFICULTY: Difficulty = 'medium';
const configuredDefaultSeed = Number(process.env.NEXT_PUBLIC_SUDOKU_START_SEED);
const DEFAULT_SEED = Number.isSafeInteger(configuredDefaultSeed) && configuredDefaultSeed >= 0
  ? configuredDefaultSeed
  : 1927;
const USE_PRODUCTION_CATALOG = process.env.NEXT_PUBLIC_SUDOKU_START_SEED === '1';
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function createInitialGrid(puzzle: number[][]): Grid {
  return puzzle.map((row) => row.map((value) => (value === 0 ? null : value)));
}
function createEmptyNotes(): NotesGrid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
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
  const [puzzleNumber, setPuzzleNumber] = useState(initialSeed);
  const puzzle = useMemo(
    () => USE_PRODUCTION_CATALOG
      ? createCatalogPuzzle(difficulty, puzzleNumber)
      : createPuzzle(difficulty, puzzleNumber),
    [difficulty, puzzleNumber],
  );
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
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [notesEnabled, setNotesEnabled] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [notesUsed, setNotesUsed] = useState(false);
  const [highlightSame, setHighlightSame] = useState(true);
  const [checkErrors, setCheckErrors] = useState(true);
  const [errorCell, setErrorCell] = useState<number | null>(null);
  const [correctCell, setCorrectCell] = useState<number | null>(null);
  const [statistics, setStatistics] = useState<PersonalStatistics>(() => createEmptyStatistics());
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showOptionsIntro, setShowOptionsIntro] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [introDontShowAgain, setIntroDontShowAgain] = useState(false);
  const [confirmNewGameOpen, setConfirmNewGameOpen] = useState(false);
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);
  const [pendingNewGameDifficulty, setPendingNewGameDifficulty] = useState<Difficulty | null>(null);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [completedRecord, setCompletedRecord] = useState<CompletedGameRecord | null>(null);
  const [publicScoreSubmitted, setPublicScoreSubmitted] = useState(false);
  const [replayNoticeOpen, setReplayNoticeOpen] = useState(false);
  const { nickname, setNickname, busy: publicScoreBusy, submitScore } = usePublicScoreSubmission();
  const { busy: shareBusy, copied: shareCopied, share } = useGameSharing(puzzle.id);

  const puzzleId = puzzle.id;
  const puzzleGrid = puzzle.grid;
  const solution = puzzle.solution;
  const difficultyLabel = puzzle.label;

  const { completeGame, markHydrated, resetCompletion } = useGameCompletion({
    puzzleId,
    difficulty,
    seed: puzzle.seed,
    solution,
    elapsedSeconds,
    penalties,
    errors,
    notesUsed,
    highlightSame,
    checkErrors,
    setCompleted,
    setCompletionModalOpen,
    setStarted,
    setCompletedRecord,
    setStatistics,
  });

  const hydrated = useSudokuPersistence({
    puzzleId,
    puzzleGrid,
    storageKey,
    state: {
      grid,
      notes,
      selectedCell,
      elapsedSeconds,
      penalties,
      errors,
      started,
      paused,
      completed,
      notesEnabled,
      notesMode,
      notesUsed,
      highlightSame,
      checkErrors,
      completedRecord,
      publicScoreSubmitted,
    },
    setters: {
      setGrid,
      setNotes,
      setSelectedCell,
      setElapsedSeconds,
      setPenalties,
      setErrors,
      setStarted,
      setPaused,
      setCompleted,
      setNotesEnabled,
      setNotesMode,
      setNotesUsed,
      setHighlightSame,
      setCheckErrors,
      setCompletedRecord,
      setPublicScoreSubmitted,
      setReplayNoticeOpen,
      setErrorCell,
      setCorrectCell,
      setCompletionModalOpen,
    },
    onHydrated: markHydrated,
  });

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

  useClientLayoutEffect(() => {
    const introWasDismissed = window.localStorage.getItem('akrolabs-sudoku-options-intro-v1') === 'true';
    setShowOptionsIntro(!introWasDismissed);
    setIntroReady(true);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen]);

  useEffect(() => {
    let active = true;
    setHallOfFame([]);
    void loadHallOfFame(puzzleId).then((entries) => {
      if (active) setHallOfFame(entries);
    });
    return () => {
      active = false;
    };
  }, [puzzleId]);

  useGameTimer(started, paused, completed, setElapsedSeconds);

  const { enterValue, clearValue, toggleNotesMode, toggleNotesEnabled, moveSelection } = useSudokuGameplay({
    grid,
    puzzleGrid,
    solution,
    selectedCell,
    paused,
    completed,
    started,
    notesEnabled,
    notesMode,
    checkErrors,
    setGrid,
    setNotes,
    setSelectedCell,
    setStarted,
    setNotesEnabled,
    setNotesUsed,
    setNotesMode,
    setErrors,
    setPenalties,
    setErrorCell,
    setCorrectCell,
    onComplete: completeGame,
  });

  useGameKeyboard({ paused, completed, moveSelection, enterValue, clearValue });

  const beginNewGame = (nextDifficulty?: Difficulty) => {
    const targetDifficulty = nextDifficulty ?? difficulty;
    const nextPuzzleNumber = nextDifficulty && nextDifficulty !== difficulty
      ? DEFAULT_SEED
      : USE_PRODUCTION_CATALOG
        ? puzzleNumber + 1
        : findNextDistinctSeed(targetDifficulty, puzzleNumber, puzzleGrid);
    if (nextDifficulty) setDifficulty(nextDifficulty);
    setPuzzleNumber(nextPuzzleNumber);
  };

  const requestNewGame = (nextDifficulty?: Difficulty) => {
    if (started && !completed) {
      setPendingNewGameDifficulty(nextDifficulty ?? null);
      setConfirmNewGameOpen(true);
      return;
    }

    beginNewGame(nextDifficulty);
  };

  const cancelNewGame = () => {
    setConfirmNewGameOpen(false);
    setPendingNewGameDifficulty(null);
  };

  const confirmNewGame = () => {
    const nextDifficulty = pendingNewGameDifficulty;
    setConfirmNewGameOpen(false);
    setPendingNewGameDifficulty(null);
    beginNewGame(nextDifficulty ?? undefined);
  };

  const resetGame = () => requestNewGame();

  const restartCurrentPuzzle = () => {
    setConfirmRestartOpen(false);
    setReplayNoticeOpen(false);
    setGrid(createInitialGrid(puzzleGrid));
    setNotes(createEmptyNotes());
    setSelectedCell(null);
    setElapsedSeconds(0);
    setPenalties(0);
    setErrors(0);
    setStarted(false);
    setPaused(false);
    setCompleted(false);
    setCompletionModalOpen(false);
    setNotesMode(false);
    setNotesUsed(false);
    setErrorCell(null);
    setCorrectCell(null);
    setCompletedRecord(null);
    setPublicScoreSubmitted(false);
    resetCompletion();
  };

  const requestRestartCurrentPuzzle = () => {
    if (started && !completed) {
      setConfirmRestartOpen(true);
      return;
    }

    restartCurrentPuzzle();
  };

  const selectDifficulty = (nextDifficulty: Difficulty) => {
    if (nextDifficulty === difficulty) return;
    requestNewGame(nextDifficulty);
  };

  const handleMagicLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    setMagicLinkSent(false);
    const result = await sendMagicLink(email.trim());
    if (result.sent) setMagicLinkSent(true);
    setAuthBusy(false);
  };

  const handlePublicScoreSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!completedRecord) return;
    const result = await submitScore(completedRecord);
    if (result.submitted || result.reason === 'already-submitted') {
      setPublicScoreSubmitted(true);
      const entries = await loadHallOfFame(puzzleId);
      setHallOfFame(entries);
    }
  };

  const handleShare = () => {
    void share({
      puzzleId,
      elapsedSeconds: completedRecord?.finalTime ?? elapsedSeconds + penalties,
      difficulty,
      notesUsed: completedRecord?.notesUsed ?? notesUsed,
      highlightSame: completedRecord?.highlightSame ?? highlightSame,
      checkErrors: completedRecord?.checkErrors ?? checkErrors,
    });
  };

  const closeOptionsIntro = () => {
    if (introDontShowAgain) {
      window.localStorage.setItem('akrolabs-sudoku-options-intro-v1', 'true');
    }
    setShowOptionsIntro(false);
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

  return (
    <main className={`app-shell${introReady ? '' : ' app-shell--intro-pending'}`}>
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
        <div className="topbar-tools">
          <div className="topbar-info">
            <div className="topbar-meta">
              <span>GRILLE</span>
              <strong>#{puzzleId}</strong>
              <span className="meta-dot">•</span>
              <span>{difficultyLabel}</span>
            </div>
            <div className="topbar-options" aria-label="Options actives">
              {notesEnabled && <span className="topbar-option">Notes</span>}
              {highlightSame && <span className="topbar-option">Surbrillance</span>}
              {checkErrors && <span className="topbar-option">Vérification</span>}
            </div>
          </div>
          <button
            className="settings-button"
            type="button"
            aria-label="Options"
            title="Options"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((current) => !current)}
          >
            <span aria-hidden="true">⚙</span>
          </button>
        </div>
      </header>

      <div className="game-layout">
        <SudokuBoard
          puzzleId={puzzleId}
          difficultyLabel={difficultyLabel}
          completed={completed}
          completionModalOpen={completionModalOpen}
          onOpenResult={() => setCompletionModalOpen(true)}
          onNewGame={resetGame}
          started={started}
          onRestart={requestRestartCurrentPuzzle}
          elapsedSeconds={elapsedSeconds}
          paused={paused}
          grid={grid}
          puzzleGrid={puzzleGrid}
          selectedCell={selectedCell}
          selectedRow={selectedRow}
          selectedColumn={selectedColumn}
          highlightSame={highlightSame}
          activeNumber={activeNumber}
          errorCell={errorCell}
          correctCell={correctCell}
          notes={notes}
          onSelectCell={(index, isGiven) => {
            if (!paused && !completed) {
              setSelectedCell(index);
              if (!started && !isGiven) setStarted(true);
            }
          }}
          onEnterValue={enterValue}
          onClearValue={clearValue}
          notesEnabled={notesEnabled}
          notesMode={notesMode}
          onToggleNotesMode={toggleNotesMode}
          onTogglePause={() => setPaused((current) => !current)}
        />

        <GameSidebar
          puzzleId={puzzleId}
          hallOfFame={hallOfFame}
          statistics={statistics}
          currentStatistics={currentStatistics}
          averageTime={averageTime}
        />
      </div>

      {settingsOpen && (
        <SettingsDialog
          onClose={() => setSettingsOpen(false)}
          notesEnabled={notesEnabled}
          onToggleNotesEnabled={toggleNotesEnabled}
          highlightSame={highlightSame}
          onToggleHighlightSame={() => setHighlightSame((current) => !current)}
          checkErrors={checkErrors}
          onToggleCheckErrors={() => setCheckErrors((current) => !current)}
          difficulty={difficulty}
          onSelectDifficulty={selectDifficulty}
          session={session}
          onSignOut={() => void signOutFromSupabase()}
          email={email}
          onEmailChange={(value) => {
            setEmail(value);
            setMagicLinkSent(false);
          }}
          onMagicLinkSubmit={handleMagicLinkSubmit}
          authBusy={authBusy}
          magicLinkSent={magicLinkSent}
        />
      )}

      <GameDialogs
        confirmNewGameOpen={confirmNewGameOpen}
        onCancelNewGame={cancelNewGame}
        onConfirmNewGame={confirmNewGame}
        confirmRestartOpen={confirmRestartOpen}
        onCancelRestart={() => setConfirmRestartOpen(false)}
        onConfirmRestart={restartCurrentPuzzle}
        showOptionsIntro={showOptionsIntro}
        introDontShowAgain={introDontShowAgain}
        onIntroDontShowAgainChange={setIntroDontShowAgain}
        onCloseOptionsIntro={closeOptionsIntro}
        replayNoticeOpen={replayNoticeOpen}
        onCloseReplayNotice={() => setReplayNoticeOpen(false)}
        onReplayPuzzle={restartCurrentPuzzle}
      />

      {completed && completionModalOpen && !replayNoticeOpen && (
        <CompletionDialog
          puzzleId={puzzleId}
          elapsedSeconds={elapsedSeconds}
          penalties={penalties}
          errors={errors}
          highlightSame={highlightSame}
          checkErrors={checkErrors}
          showScoreForm={Boolean(completedRecord && !publicScoreSubmitted)}
          publicScoreBusy={publicScoreBusy}
          nickname={nickname}
          onNicknameChange={setNickname}
          onSubmitScore={handlePublicScoreSubmit}
          onShare={() => void handleShare()}
          shareBusy={shareBusy}
          shareCopied={shareCopied}
          onNewGame={resetGame}
          onClose={() => setCompletionModalOpen(false)}
        />
      )}

      <p className="footer-line">AkroLabs · Sudoku</p>
    </main>
  );
}
