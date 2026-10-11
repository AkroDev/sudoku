'use client';

import { useState, type FormEvent } from 'react';
import { formatPuzzleId, parsePuzzleId } from '@/lib/sudoku';
import { localizedPath, useLocaleText } from '@/i18n';

type GridLookupProps = {
  initialGrid: string | null;
};

export default function GridLookup({ initialGrid }: GridLookupProps) {
  const { locale, t } = useLocaleText();
  const [value, setValue] = useState(initialGrid ?? '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedGrid = value.trim().toUpperCase();
    const parsed = parsePuzzleId(normalizedGrid);
    if (!parsed) return;
    window.location.assign(localizedPath(`/sudoku/${formatPuzzleId(parsed.difficulty, parsed.seed)}`, locale));
  };

  return (
    <form className="grid-lookup" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="grid-lookup-input">{t('Quelle grille voulez-vous jouer ?')}</label>
      <div className="grid-lookup-row">
        <input
          className="auth-input"
          id="grid-lookup-input"
          name="grid"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          placeholder="M-0001"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
        <button className="action-button action-button--primary" type="submit">
          {t('Ouvrir la grille')}
        </button>
      </div>
    </form>
  );
}
