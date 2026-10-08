import { ImageResponse } from 'next/og';
import { DIFFICULTY_PROFILES, formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import { formatTime } from '@/lib/time';

const PREVIEW_GRID = [
  [4, 7, '', 1, 3, '', 8, 6, 9],
  ['', 2, 1, 6, '', 9, 4, '', 7],
  [8, '', 6, 5, 4, 7, '', 1, 2],
  [7, 6, '', 4, 2, 5, 9, '', 1],
  [9, 1, 3, '', 7, 6, 2, 4, ''],
  [2, '', 4, 3, 9, 1, '', 8, 6],
  [5, 8, 7, 2, '', 4, 6, 9, 3],
  ['', 3, 9, 7, 5, 8, 1, '', 4],
  [1, 4, '', 9, 6, 3, 5, 7, 8],
];

function readSeconds(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null;
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

function getOptionTags(searchParams: URLSearchParams) {
  const tags = [];
  if (searchParams.get('notes') === '1') tags.push('Notes');
  if (searchParams.get('highlight') !== '0') tags.push('Surbrillance');
  if (searchParams.get('check') !== '0') tags.push('Vérification');
  return tags;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bitcoinLogoUrl = new URL('/bitcoin-logo.svg', request.url).toString();
  const parsed = parsePuzzleId(searchParams.get('grid') ?? '');
  const difficulty = parsed?.difficulty ?? 'medium';
  const puzzleId = parsed ? formatPuzzleId(parsed.difficulty, parsed.seed) : 'M-0001';
  const elapsedSeconds = readSeconds(searchParams.get('time'));
  const difficultyLabel = DIFFICULTY_PROFILES[difficulty].label;
  const optionTags = getOptionTags(searchParams);
  const previewCells = PREVIEW_GRID.flat();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          padding: '54px 64px',
          color: '#f8fafc',
          background: '#08080a',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background: 'radial-gradient(circle at 88% 48%, rgba(249, 115, 22, 0.24), transparent 30%), radial-gradient(circle at 12% 100%, rgba(124, 58, 237, 0.25), transparent 38%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 36,
            right: 46,
            width: 560,
            height: 560,
            display: 'flex',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: 280,
            transform: 'rotate(18deg)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  transform: 'rotate(-6deg)',
                  boxShadow: '0 8px 18px rgba(249, 115, 22, 0.22)',
                }}
              >
                <img src={bitcoinLogoUrl} width="52" height="52" alt="" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#f8fafc', fontSize: 24, fontWeight: 700, letterSpacing: 4 }}>AKROLABS</span>
                <span style={{ color: '#a78bfa', fontSize: 15, letterSpacing: 5 }}>SUDOKU</span>
              </div>
            </div>
            <span style={{ color: '#94a3b8', fontSize: 18, letterSpacing: 2 }}>À TOI DE JOUER</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 54 }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 720 }}>
              <span style={{ color: '#fb923c', fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>
                GRILLE #{puzzleId} · {difficultyLabel.toUpperCase()}
              </span>
              <span style={{ marginTop: 18, color: '#f8fafc', fontSize: 46, fontWeight: 700, lineHeight: 1.1 }}>
                {elapsedSeconds === null
                  ? 'Une nouvelle grille t’attend.'
                  : `Je viens de terminer cette grille en ${formatTime(elapsedSeconds)}.`}
              </span>
              <span style={{ marginTop: 20, color: '#c4b5fd', fontSize: 31, fontWeight: 700 }}>
                À toi de jouer !
              </span>
              {optionTags.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                  {optionTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'flex',
                        padding: '8px 14px',
                        border: '1px solid rgba(167, 139, 250, 0.45)',
                        borderRadius: 999,
                        color: '#c4b5fd',
                        fontSize: 16,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                width: 278,
                height: 278,
                flexShrink: 0,
                padding: 9,
                border: '2px solid rgba(249, 115, 22, 0.75)',
                borderRadius: 20,
                background: 'rgba(8, 8, 10, 0.7)',
                transform: 'rotate(7deg)',
              }}
            >
              {previewCells.map((value, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '11.1111%',
                    height: '11.1111%',
                    borderRight: index % 9 === 8 ? '0' : '1px solid rgba(248, 250, 252, 0.12)',
                    borderBottom: Math.floor(index / 9) === 8 ? '0' : '1px solid rgba(248, 250, 252, 0.12)',
                    color: index % 3 === 0 ? '#fb923c' : '#e2e8f0',
                    fontSize: 21,
                    fontWeight: 700,
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: 16, letterSpacing: 2 }}>
            <span>AKROLABS.FR / SUDOKU</span>
            <span>BITCOIN · PUZZLES · OPEN-SOURCE</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
