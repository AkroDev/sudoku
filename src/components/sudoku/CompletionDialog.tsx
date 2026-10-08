import type { FormEventHandler } from 'react';
import { PUBLIC_NICKNAME_MAX_LENGTH, PUBLIC_NICKNAME_MIN_LENGTH } from '@/lib/public-score';
import { formatTime } from '@/lib/time';

type CompletionDialogProps = {
  puzzleId: string;
  elapsedSeconds: number;
  penalties: number;
  errors: number;
  highlightSame: boolean;
  checkErrors: boolean;
  showScoreForm: boolean;
  publicScoreBusy: boolean;
  nickname: string;
  onNicknameChange: (value: string) => void;
  onSubmitScore: FormEventHandler<HTMLFormElement>;
  onShare: () => void;
  shareBusy: boolean;
  shareCopied: boolean;
  onNewGame: () => void;
  onClose: () => void;
};

export default function CompletionDialog({
  puzzleId,
  elapsedSeconds,
  penalties,
  errors,
  highlightSame,
  checkErrors,
  showScoreForm,
  publicScoreBusy,
  nickname,
  onNicknameChange,
  onSubmitScore,
  onShare,
  shareBusy,
  shareCopied,
  onNewGame,
  onClose,
}: CompletionDialogProps) {
  return (
    <div className="modal-backdrop completion-backdrop">
      <section className="panel dialog-panel completion-dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <button
          className="dialog-close-button"
          type="button"
          aria-label="Fermer la fenêtre de fin de partie"
          title="Fermer"
          onClick={onClose}
        >
          ×
        </button>
        <p className="eyebrow">Sudoku #{puzzleId}</p>
        <h2 id="completion-title">Bravo, partie terminée !</h2>
        <div className="completion-summary">
          <div className="status-line"><span>Temps</span><strong>{formatTime(elapsedSeconds)}</strong></div>
          <div className="status-line"><span>Pénalités</span><strong>+{penalties} s</strong></div>
          <div className="status-line"><span>Temps final</span><strong>{formatTime(elapsedSeconds + penalties)}</strong></div>
          <div className="status-line"><span>Erreurs</span><strong>{errors}</strong></div>
          <div className="status-line"><span>Surbrillance</span><strong>{highlightSame ? 'activée' : 'désactivée'}</strong></div>
          <div className="status-line"><span>Vérification des erreurs</span><strong>{checkErrors ? 'activée' : 'désactivée'}</strong></div>
        </div>
        {showScoreForm ? (
          <form className="public-score-form" onSubmit={onSubmitScore}>
            <label className="field-label" htmlFor="sudoku-nickname">Votre pseudo</label>
            <input
              className="auth-input"
              id="sudoku-nickname"
              type="text"
              autoComplete="nickname"
              minLength={PUBLIC_NICKNAME_MIN_LENGTH}
              maxLength={PUBLIC_NICKNAME_MAX_LENGTH}
              value={nickname}
              onChange={(event) => onNicknameChange(event.target.value)}
              required
            />
            <button className="action-button action-button--primary" type="submit" disabled={publicScoreBusy}>
              Enregistrer mon score
            </button>
            <p className="field-hint">Votre pseudo sera visible dans le Hall of Fame.</p>
          </form>
        ) : (
          <a className="action-button action-button--primary completion-hof-link" href={`/sudoku/hall-of-fame?grid=${puzzleId}`}>
            Hall of Fame ↗
          </a>
        )}
        <button className="action-button action-button--primary completion-share-button" type="button" onClick={onShare} disabled={shareBusy}>
          {shareCopied ? 'Lien copié !' : 'Partager ma victoire'}
        </button>
        <button className="action-button completion-new-game" type="button" onClick={onNewGame}>
          Nouvelle grille
        </button>
      </section>
    </div>
  );
}
