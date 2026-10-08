import { ImageResponse } from 'next/og';
import { createCatalogPuzzle, createPuzzle, DIFFICULTY_PROFILES, formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import { formatTime } from '@/lib/time';

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
  const backgroundUrl = new URL('/share-card-background.png', request.url).toString();
  const parsed = parsePuzzleId(searchParams.get('grid') ?? '');
  const difficulty = parsed?.difficulty ?? 'medium';
  const puzzleId = parsed ? formatPuzzleId(parsed.difficulty, parsed.seed) : 'M-0001';
  const elapsedSeconds = readSeconds(searchParams.get('time'));
  const difficultyLabel = DIFFICULTY_PROFILES[difficulty].label;
  const optionTags = getOptionTags(searchParams);
  const puzzle = parsed
    ? process.env.NEXT_PUBLIC_SUDOKU_START_SEED === '1'
      ? createCatalogPuzzle(difficulty, parsed.seed)
      : createPuzzle(difficulty, parsed.seed)
    : createPuzzle('medium', 1);
  const previewCells = puzzle.grid.flat();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          color: '#f8fafc',
          background: '#08080a',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <img
          src={backgroundUrl}
          width="1200"
          height="630"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background: 'linear-gradient(90deg, rgba(8, 8, 10, 0.02) 0%, rgba(8, 8, 10, 0.04) 42%, rgba(8, 8, 10, 0.58) 63%, rgba(8, 8, 10, 0.92) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 326,
            top: 148,
            display: 'flex',
            flexWrap: 'wrap',
            width: 260,
            height: 260,
            padding: 8,
            border: '2px solid rgba(249, 115, 22, 0.78)',
            borderRadius: 18,
            background: 'rgba(8, 8, 10, 0.78)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.28), 0 0 24px rgba(124, 58, 237, 0.24)',
            transform: 'rotate(-3deg)',
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
                borderRight: index % 9 === 8
                  ? '0'
                  : index % 9 === 2 || index % 9 === 5
                    ? '2px solid rgba(249, 115, 22, 0.5)'
                    : '1px solid rgba(248, 250, 252, 0.12)',
                borderBottom: Math.floor(index / 9) === 8
                  ? '0'
                  : Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5
                    ? '2px solid rgba(249, 115, 22, 0.5)'
                    : '1px solid rgba(248, 250, 252, 0.12)',
                color: index % 3 === 0 ? '#fb923c' : '#e2e8f0',
                fontSize: 19,
                fontWeight: 700,
              }}
            >
              {value === 0 ? '' : value}
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '44px 54px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: '#f8fafc', fontSize: 24, fontWeight: 700, letterSpacing: 4 }}>AKROLABS.FR</span>
              <span style={{ color: '#c4b5fd', fontSize: 15, letterSpacing: 5 }}>SUDOKU</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: 520,
                padding: '26px 30px 24px',
                border: '1px solid rgba(196, 181, 253, 0.34)',
                borderRadius: 22,
                background: 'rgba(8, 8, 10, 0.64)',
                boxShadow: '0 18px 44px rgba(0, 0, 0, 0.28)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <span style={{ color: '#fb923c', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
                  GRILLE #{puzzleId}
                </span>
                <span style={{ color: '#c4b5fd', fontSize: 15, letterSpacing: 2 }}>
                  {difficultyLabel.toUpperCase()}
                </span>
              </div>
              <span
                style={{
                  marginTop: 18,
                  color: '#f8fafc',
                  fontSize: 40,
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#c4b5fd', fontSize: 15, letterSpacing: 2 }}>
            <span>BITCOIN · PUZZLES · OPEN-SOURCE</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
