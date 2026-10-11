'use client';

import { useLocaleText } from '@/i18n';

type GameDialogsProps = {
  confirmNewGameOpen: boolean;
  onCancelNewGame: () => void;
  onConfirmNewGame: () => void;
  confirmRestartOpen: boolean;
  onCancelRestart: () => void;
  onConfirmRestart: () => void;
  showOptionsIntro: boolean;
  introDontShowAgain: boolean;
  onIntroDontShowAgainChange: (checked: boolean) => void;
  onCloseOptionsIntro: () => void;
  replayNoticeOpen: boolean;
  onCloseReplayNotice: () => void;
  onReplayPuzzle: () => void;
};

export default function GameDialogs({
  confirmNewGameOpen,
  onCancelNewGame,
  onConfirmNewGame,
  confirmRestartOpen,
  onCancelRestart,
  onConfirmRestart,
  showOptionsIntro,
  introDontShowAgain,
  onIntroDontShowAgainChange,
  onCloseOptionsIntro,
  replayNoticeOpen,
  onCloseReplayNotice,
  onReplayPuzzle,
}: GameDialogsProps) {
  const { t } = useLocaleText();
  return (
    <>
      {confirmNewGameOpen && (
        <div className="modal-backdrop">
          <section className="panel dialog-panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="new-game-title">
            <p className="eyebrow">{t('Nouvelle grille')}</p>
            <h2 id="new-game-title">{t('On change de grille ?')}</h2>
            <p className="dialog-copy">{t('La progression actuelle ne sera pas conservée.')}</p>
            <div className="dialog-actions">
              <button className="action-button" type="button" onClick={onCancelNewGame}>
                {t('Rester sur cette grille')}
              </button>
              <button className="action-button action-button--primary" type="button" onClick={onConfirmNewGame}>
                {t('Oui, nouvelle grille')}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmRestartOpen && (
        <div className="modal-backdrop">
          <section className="panel dialog-panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="restart-title">
            <h2 id="restart-title">{t('On remet les compteurs à zéro ?')}</h2>
            <p className="dialog-copy">{t('La grille actuelle sera conservée, mais votre progression sera effacée.')}</p>
            <div className="dialog-actions">
              <button className="action-button" type="button" onClick={onCancelRestart}>
                {t('Continuer')}
              </button>
              <button className="action-button action-button--primary" type="button" onClick={onConfirmRestart}>
                {t('Recommencer')}
              </button>
            </div>
          </section>
        </div>
      )}

      {showOptionsIntro && (
        <div className="modal-backdrop intro-backdrop">
          <section className="panel dialog-panel intro-dialog" role="dialog" aria-modal="true" aria-labelledby="intro-title">
            <div className="intro-visual" aria-hidden="true">
              <div className="intro-mini-grid">
                <span /><span className="intro-cell--orange" /><span />
                <span className="intro-cell--violet" /><span className="intro-cell--glow" /><span />
                <span /><span /><span className="intro-cell--orange" />
              </div>
              <span className="intro-visual-mark">✦</span>
              <span className="intro-orbit intro-orbit--one" />
              <span className="intro-orbit intro-orbit--two" />
            </div>
            <p className="eyebrow">AkroLabs · {t('Sudoku')}</p>
            <h2 id="intro-title">{t('Bienvenue dans le Sudoku AkroLabs')}</h2>
            <p className="dialog-copy">{t('Faites travailler vos neurones à votre rythme. Difficulté, aides et statistiques se cachent sous la roue dentée.')}</p>
            <label className="checkbox-row">
              <input type="checkbox" checked={introDontShowAgain} onChange={(event) => onIntroDontShowAgainChange(event.target.checked)} />
              <span>{t('J’ai compris, on peut cacher cette fenêtre.')}</span>
            </label>
            <button className="action-button action-button--primary intro-cta" type="button" onClick={onCloseOptionsIntro}>
              {t('C’est parti')}
            </button>
          </section>
        </div>
      )}

      {replayNoticeOpen && (
        <div className="modal-backdrop">
          <section className="panel dialog-panel replay-dialog" role="dialog" aria-modal="true" aria-labelledby="replay-title">
            <p className="eyebrow">Hall of Fame</p>
            <h2 id="replay-title">{t('Cette grille a déjà été jouée')}</h2>
            <p className="dialog-copy">{t('Vous pouvez la recommencer et modifier les options si vous le souhaitez. Votre nouveau score ne sera pas ajouté au Hall of Fame.')}</p>
            <div className="dialog-actions">
              <button className="action-button" type="button" onClick={onCloseReplayNotice}>
                {t('Rester sur le résultat')}
              </button>
              <button className="action-button action-button--primary" type="button" onClick={onReplayPuzzle}>
                {t('Rejouer la grille')}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
