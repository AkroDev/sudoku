import assert from 'node:assert/strict';
import test from 'node:test';
import { buildShareImagePath, buildSharePagePath, getShareText, type ShareDetails } from '../src/lib/share';

const details: ShareDetails = {
  puzzleId: 'M-0001',
  elapsedSeconds: 267,
  difficulty: 'medium',
  notesUsed: false,
  highlightSame: true,
  checkErrors: true,
};

test('share links keep the selected language and translate the message', () => {
  assert.equal(buildSharePagePath(details, 'fr'), '/sudoku/M-0001?share=1&time=267');
  assert.equal(buildSharePagePath(details, 'en'), '/en/sudoku/M-0001?share=1&time=267');
  assert.equal(getShareText(details, 'fr'), 'Je viens de terminer la grille #M-0001 en 04:27. À toi de jouer !');
  assert.equal(getShareText(details, 'en'), 'I just completed puzzle #M-0001 in 04:27. Your turn!');
});

test('share-card images receive the selected language', () => {
  assert.equal(buildShareImagePath(details, 'fr'), '/api/og?time=267&grid=M-0001');
  assert.equal(buildShareImagePath(details, 'en'), '/api/og?time=267&grid=M-0001&lang=en');
});
