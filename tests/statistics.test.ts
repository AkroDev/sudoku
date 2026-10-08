import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCompletedGame, createEmptyStatistics, type CompletedGameRecord } from '../src/lib/statistics';

function completedGame(overrides: Partial<CompletedGameRecord> = {}): CompletedGameRecord {
  return {
    puzzleId: 'M-0001',
    difficulty: 'medium',
    seed: 1,
    rawTime: 90,
    penalties: 15,
    finalTime: 105,
    errors: 1,
    notesUsed: false,
    highlightSame: true,
    checkErrors: true,
    completedAt: 1,
    ...overrides,
  };
}

test('completed games update totals, errors, no-error count, and best time', () => {
  const first = completedGame();
  const second = completedGame({ puzzleId: 'M-0002', finalTime: 80, errors: 0, completedAt: 2 });

  const afterFirst = applyCompletedGame(createEmptyStatistics(), first);
  const afterSecond = applyCompletedGame(afterFirst, second);
  const medium = afterSecond.byDifficulty.medium;

  assert.equal(afterSecond.totalCompleted, 2);
  assert.equal(medium.completed, 2);
  assert.equal(medium.bestTime, 80);
  assert.equal(medium.totalTime, 185);
  assert.equal(medium.errors, 1);
  assert.equal(medium.noErrorGames, 1);
  assert.deepEqual(afterSecond.history, [second, first]);
});

test('personal game history retains only the latest 50 results', () => {
  let statistics = createEmptyStatistics();
  for (let index = 1; index <= 51; index += 1) {
    statistics = applyCompletedGame(statistics, completedGame({
      puzzleId: `M-${String(index).padStart(4, '0')}`,
      completedAt: index,
    }));
  }

  assert.equal(statistics.totalCompleted, 51);
  assert.equal(statistics.history.length, 50);
  assert.equal(statistics.history[0].puzzleId, 'M-0051');
  assert.equal(statistics.history.at(-1)?.puzzleId, 'M-0002');
});
