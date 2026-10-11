'use client';

import type { FormEventHandler } from 'react';
import type { Session } from '@supabase/supabase-js';
import { DIFFICULTY_ORDER, DIFFICULTY_PROFILES, type Difficulty } from '@/lib/sudoku';
import { useLocaleText } from '@/i18n';

type SettingsDialogProps = {
  onClose: () => void;
  notesEnabled: boolean;
  onToggleNotesEnabled: () => void;
  highlightSame: boolean;
  onToggleHighlightSame: () => void;
  checkErrors: boolean;
  onToggleCheckErrors: () => void;
  difficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  session: Session | null;
  onSignOut: () => void;
  email: string;
  onEmailChange: (value: string) => void;
  onMagicLinkSubmit: FormEventHandler<HTMLFormElement>;
  authBusy: boolean;
  magicLinkSent: boolean;
};

export default function SettingsDialog({
  onClose,
  notesEnabled,
  onToggleNotesEnabled,
  highlightSame,
  onToggleHighlightSame,
  checkErrors,
  onToggleCheckErrors,
  difficulty,
  onSelectDifficulty,
  session,
  onSignOut,
  email,
  onEmailChange,
  onMagicLinkSubmit,
  authBusy,
  magicLinkSent,
}: SettingsDialogProps) {
  const { t } = useLocaleText();
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="panel dialog-panel settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{t('Options')}</p>
            <h2 id="settings-title">{t('Options')}</h2>
          </div>
          <button className="settings-button" type="button" aria-label={t('Options')} title={t('Options')} onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="settings-sections">
          <section className="settings-section">
            <p className="panel-title">{t('Options')}</p>
            <div className="control-list">
              <div className="control-row">
                <span>{t('Notes')}</span>
                <button className="toggle-button" type="button" aria-pressed={notesEnabled} onClick={onToggleNotesEnabled}>
                  {notesEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="control-row">
                <span>{t('Surbrillance')}</span>
                <button className="toggle-button" type="button" aria-pressed={highlightSame} onClick={onToggleHighlightSame}>
                  {highlightSame ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="control-row">
                <span>{t('Vérification des erreurs')}</span>
                <button className="toggle-button" type="button" aria-pressed={checkErrors} onClick={onToggleCheckErrors}>
                  {checkErrors ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <p className="panel-title">{t('Difficulté')}</p>
            <div className="difficulty-row">
              {DIFFICULTY_ORDER.map((option) => (
                <button
                  className="difficulty-button"
                  key={option}
                  type="button"
                  aria-pressed={option === difficulty}
                  onClick={() => onSelectDifficulty(option)}
                >
                  {t(DIFFICULTY_PROFILES[option].label)}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section auth-panel" aria-label={t('Se connecter pour synchroniser mes statistiques')}>
            {session?.user ? (
              <div className="auth-user">
                <span className="auth-email">{session.user.email}</span>
                <button className="action-button" type="button" onClick={onSignOut}>
                  {t('Se déconnecter')}
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={onMagicLinkSubmit}>
                <label className="field-label" htmlFor="sudoku-email">{t('Adresse e-mail')}</label>
                <input
                  className="auth-input"
                  id="sudoku-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  required
                />
                <button className="action-button action-button--primary" type="submit" disabled={authBusy}>
                  {t('Se connecter pour synchroniser mes statistiques')}
                </button>
                {magicLinkSent && (
                  <p className="auth-status" role="status">{t('Lien envoyé. Consultez votre boîte mail.')}</p>
                )}
              </form>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
