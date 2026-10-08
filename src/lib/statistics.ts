import type { Difficulty } from './sudoku';

export type CompletedGameRecord = {
  puzzleId: string;
  difficulty: Difficulty;
  seed: number;
  rawTime: number;
  penalties: number;
  finalTime: number;
  errors: number;
  notesUsed: boolean;
  highlightSame: boolean;
  checkErrors: boolean;
  completedAt: number;
};

export type DifficultyStatistics = {
  completed: number;
  bestTime: number | null;
  totalTime: number;
  errors: number;
  noErrorGames: number;
};

export type PersonalStatistics = {
  totalCompleted: number;
  byDifficulty: Record<Difficulty, DifficultyStatistics>;
  history: CompletedGameRecord[];
};

const STORAGE_KEY = 'akrolabs-sudoku-statistics-v1';
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

function createDifficultyStatistics(): DifficultyStatistics {
  return {
    completed: 0,
    bestTime: null,
    totalTime: 0,
    errors: 0,
    noErrorGames: 0,
  };
}

export function createEmptyStatistics(): PersonalStatistics {
  return {
    totalCompleted: 0,
    byDifficulty: {
      easy: createDifficultyStatistics(),
      medium: createDifficultyStatistics(),
      hard: createDifficultyStatistics(),
      expert: createDifficultyStatistics(),
    },
    history: [],
  };
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTIES.includes(value as Difficulty);
}

function normalizeStatistics(value: unknown): PersonalStatistics {
  const empty = createEmptyStatistics();
  if (!value || typeof value !== 'object') return empty;
  const stored = value as Partial<PersonalStatistics>;
  const byDifficulty = { ...empty.byDifficulty };

  for (const difficulty of DIFFICULTIES) {
    const candidate = stored.byDifficulty?.[difficulty];
    if (!candidate) continue;
    byDifficulty[difficulty] = {
      completed: Number(candidate.completed) || 0,
      bestTime: typeof candidate.bestTime === 'number' ? candidate.bestTime : null,
      totalTime: Number(candidate.totalTime) || 0,
      errors: Number(candidate.errors) || 0,
      noErrorGames: Number(candidate.noErrorGames) || 0,
    };
  }

  const history = Array.isArray(stored.history)
    ? stored.history.filter((record): record is CompletedGameRecord => (
      Boolean(record)
      && typeof record === 'object'
      && typeof record.puzzleId === 'string'
      && isDifficulty(record.difficulty)
      && typeof record.finalTime === 'number'
    )).slice(0, 50)
    : [];

  return {
    totalCompleted: Number(stored.totalCompleted) || 0,
    byDifficulty,
    history,
  };
}

export function loadStatistics(): PersonalStatistics {
  if (typeof window === 'undefined') return createEmptyStatistics();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return createEmptyStatistics();
  try {
    return normalizeStatistics(JSON.parse(stored));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createEmptyStatistics();
  }
}

function saveStatistics(statistics: PersonalStatistics) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statistics));
}

export function applyCompletedGame(current: PersonalStatistics, record: CompletedGameRecord) {
  const difficulty = current.byDifficulty[record.difficulty];
  const nextDifficulty: DifficultyStatistics = {
    completed: difficulty.completed + 1,
    bestTime: difficulty.bestTime === null ? record.finalTime : Math.min(difficulty.bestTime, record.finalTime),
    totalTime: difficulty.totalTime + record.finalTime,
    errors: difficulty.errors + record.errors,
    noErrorGames: difficulty.noErrorGames + (record.errors === 0 ? 1 : 0),
  };
  const next: PersonalStatistics = {
    totalCompleted: current.totalCompleted + 1,
    byDifficulty: { ...current.byDifficulty, [record.difficulty]: nextDifficulty },
    history: [record, ...current.history].slice(0, 50),
  };
  return next;
}

export function recordCompletedGame(record: CompletedGameRecord) {
  const next = applyCompletedGame(loadStatistics(), record);
  saveStatistics(next);
  return next;
}
