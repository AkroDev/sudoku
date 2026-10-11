import type { CSSProperties } from 'react';
import { formatTime } from '@/lib/time';
import { useLocaleText } from '@/i18n';
import type { Grid, NotesGrid } from './types';

type SudokuBoardProps = {
  puzzleId: string;
  difficultyLabel: string;
  completed: boolean;
  completionModalOpen: boolean;
  onOpenResult: () => void;
  onNewGame: () => void;
  started: boolean;
  onRestart: () => void;
  elapsedSeconds: number;
  paused: boolean;
  grid: Grid;
  puzzleGrid: number[][];
  solutionGrid: number[][];
  selectedCell: number | null;
  selectedRow: number | null;
  selectedColumn: number | null;
  highlightSame: boolean;
  checkErrors: boolean;
  activeNumber: number | null;
  errorCell: number | null;
  correctCell: number | null;
  notes: NotesGrid;
  penaltyNoticeId: number;
  onSelectCell: (index: number, isGiven: boolean) => void;
  onEnterValue: (value: number) => void;
  onClearValue: () => void;
  notesEnabled: boolean;
  notesMode: boolean;
  onToggleNotesMode: () => void;
  onTogglePause: () => void;
};

function isSameUnit(row: number, column: number, selectedRow: number, selectedColumn: number) {
  const sameRow = row === selectedRow;
  const sameColumn = column === selectedColumn;
  const sameBlock = Math.floor(row / 3) === Math.floor(selectedRow / 3)
    && Math.floor(column / 3) === Math.floor(selectedColumn / 3);
  return sameRow || sameColumn || sameBlock;
}

function NumberPad({
  className,
  onEnterValue,
  onClearValue,
  paused = false,
  style,
}: {
  className: string;
  onEnterValue: (value: number) => void;
  onClearValue: () => void;
  paused?: boolean;
  style?: CSSProperties;
}) {
  const { t } = useLocaleText();
  return (
    <div className={`number-pad-wrap ${className}`} style={style}>
      <div className="number-pad" aria-label={t('Saisie des chiffres')}>
        {Array.from({ length: 9 }, (_, index) => (
          <button className="number-button" key={index + 1} type="button" onClick={() => onEnterValue(index + 1)}>
            {index + 1}
          </button>
        ))}
        <button className="number-button number-button--clear" type="button" aria-label={t('Effacer')} onClick={onClearValue}>
          ×
        </button>
      </div>
      {paused && (
        <div className="number-pad-overlay" aria-hidden="true">
          <span>{t('Pause')}</span>
        </div>
      )}
    </div>
  );
}

export default function SudokuBoard({
  puzzleId,
  difficultyLabel,
  completed,
  completionModalOpen,
  onOpenResult,
  onNewGame,
  started,
  onRestart,
  elapsedSeconds,
  paused,
  grid,
  puzzleGrid,
  solutionGrid,
  selectedCell,
  selectedRow,
  selectedColumn,
  highlightSame,
  checkErrors,
  activeNumber,
  errorCell,
  correctCell,
  notes,
  penaltyNoticeId,
  onSelectCell,
  onEnterValue,
  onClearValue,
  notesEnabled,
  notesMode,
  onToggleNotesMode,
  onTogglePause,
}: SudokuBoardProps) {
  const { t } = useLocaleText();
  const mobileNumberPadVisible = !paused && !completed
    && selectedRow !== null && selectedColumn !== null
    && puzzleGrid[selectedRow][selectedColumn] === 0;
  const mobileNumberPadStyle: CSSProperties = {
    top: `clamp(0px, calc(${((selectedRow ?? 0) * 100) / 9}% - 68px), calc(100% - 148px))`,
    left: selectedColumn !== null && selectedColumn < 4 ? '55%' : '3%',
  };

  return (
    <section className="panel board-panel" aria-label={t('Grille Sudoku')}>
      <div className="board-heading">
        <div>
          <p className="eyebrow">{t('Sudoku')}</p>
          <h1>#{puzzleId}</h1>
        </div>
        <div className="board-heading-action">
          {completed && !completionModalOpen && (
            <button className="action-button board-result-button" type="button" onClick={onOpenResult}>
              {t('Voir mon résultat')}
            </button>
          )}
          <button className="action-button board-new-game" type="button" onClick={onNewGame}>
            {t('Nouvelle grille')}
          </button>
          {started && !completed && (
            <button className="action-button board-restart" type="button" onClick={onRestart}>
              {t('Recommencer')}
            </button>
          )}
        </div>
        <div className="timer" aria-label={t('Chronomètre')}>{formatTime(elapsedSeconds)}</div>
      </div>

      <div className={`board-wrap${paused ? ' board-wrap--paused' : ''}`}>
        <div className="sudoku-grid" role="grid" aria-label={t('Grille 9 par 9')}>
          {grid.map((row, rowIndex) => row.map((value, columnIndex) => {
            const index = rowIndex * 9 + columnIndex;
            const isGiven = puzzleGrid[rowIndex][columnIndex] !== 0;
            const isIncorrect = checkErrors && !isGiven && value !== null && value !== solutionGrid[rowIndex][columnIndex];
            const isSelected = selectedCell === index;
            const isRelated = highlightSame && selectedRow !== null && selectedColumn !== null
              && isSameUnit(rowIndex, columnIndex, selectedRow, selectedColumn);
            const isSame = highlightSame && activeNumber !== null && value === activeNumber;
            const classes = [
              'cell',
              isGiven ? 'cell--given' : 'cell--user',
              isRelated ? 'cell--related' : '',
              isSame ? 'cell--same' : '',
              isSelected ? 'cell--selected' : '',
              isIncorrect ? 'cell--incorrect' : '',
              errorCell === index ? 'cell--error' : '',
              correctCell === index ? 'cell--correct' : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                className={classes}
                key={index}
                type="button"
                role="gridcell"
                aria-label={t('Case {{number}}', { number: index + 1 })}
                aria-selected={isSelected}
                onClick={() => onSelectCell(index, isGiven)}
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

        {mobileNumberPadVisible && (
          <NumberPad
            className="number-pad-wrap--mobile"
            onEnterValue={onEnterValue}
            onClearValue={onClearValue}
            style={mobileNumberPadStyle}
          />
        )}

        {penaltyNoticeId > 0 && (
          <div key={penaltyNoticeId} className="penalty-toast" role="status" aria-live="polite">
            {t('Oups ! +15 s sur le chrono')}
          </div>
        )}

        {paused && (
          <div className="board-overlay">
            <span className="pause-bitcoin" aria-hidden="true">
              <img className="pause-bitcoin-logo" src="/bitcoin-logo.svg" alt="" />
            </span>
          </div>
        )}
      </div>

      <NumberPad
        className="number-pad-wrap--desktop"
        onEnterValue={onEnterValue}
        onClearValue={onClearValue}
        paused={paused}
      />

      <div className="board-actions">
        {notesEnabled && (
          <button
            className={`action-button notes-mode-button${notesMode ? ' action-button--primary' : ''}`}
            type="button"
            aria-pressed={notesMode}
            onClick={onToggleNotesMode}
          >
            {t('Notes : ')}{notesMode ? 'ON' : 'OFF'}
          </button>
        )}
        <button className="action-button action-button--primary" type="button" onClick={onTogglePause}>
            {paused ? t('Reprendre') : t('Pause')}
        </button>
      </div>
    </section>
  );
}
