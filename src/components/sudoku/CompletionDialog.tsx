import type { FormEventHandler } from 'react';
import { PUBLIC_NICKNAME_MAX_LENGTH, PUBLIC_NICKNAME_MIN_LENGTH } from '@/lib/public-score';
import { formatTime } from '@/lib/time';
import { localizedPath, useLocaleText } from '@/i18n';

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
  const { locale, t } = useLocaleText();
  return (
    <div className="modal-backdrop completion-backdrop">
      <section className="panel dialog-panel completion-dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <button
          className="dialog-close-button"
          type="button"
          aria-label={t('Fermer la fenêtre de fin de partie')}
          title={t('Fermer')}
          onClick={onClose}
        >
          ×
        </button>
        <p className="eyebrow">Sudoku #{puzzleId}</p>
        <h2 id="completion-title">{t('Bravo, partie terminée !')}</h2>
        <div className="completion-summary">
          <div className="status-line"><span>{t('Temps')}</span><strong>{formatTime(elapsedSeconds)}</strong></div>
          <div className="status-line"><span>{t('Pénalités')}</span><strong>+{penalties} s</strong></div>
          <div className="status-line"><span>{t('Temps final')}</span><strong>{formatTime(elapsedSeconds + penalties)}</strong></div>
          <div className="status-line"><span>{t('Erreurs')}</span><strong>{errors}</strong></div>
          <div className="status-line"><span>{t('Surbrillance')}</span><strong>{t(highlightSame ? 'activée' : 'désactivée')}</strong></div>
          <div className="status-line"><span>{t('Vérification des erreurs')}</span><strong>{t(checkErrors ? 'activée' : 'désactivée')}</strong></div>
        </div>
        {showScoreForm ? (
          <form className="public-score-form" onSubmit={onSubmitScore}>
            <label className="field-label" htmlFor="sudoku-nickname">{t('Votre pseudo')}</label>
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
              {t('Enregistrer mon score')}
            </button>
            <p className="field-hint">{t('Votre pseudo sera visible dans le Hall of Fame.')}</p>
          </form>
        ) : (
          <a className="action-button action-button--primary completion-hof-link" href={`${localizedPath('/sudoku/hall-of-fame', locale)}?grid=${puzzleId}`}>
            {t('Hall of Fame ↗')}
          </a>
        )}
        <button className="action-button action-button--primary completion-share-button" type="button" onClick={onShare} disabled={shareBusy}>
          {shareCopied ? t('Lien copié !') : t('Partager ma victoire')}
        </button>
        <button className="action-button completion-new-game" type="button" onClick={onNewGame}>
          {t('Nouvelle grille')}
        </button>
      </section>
    </div>
  );
}
