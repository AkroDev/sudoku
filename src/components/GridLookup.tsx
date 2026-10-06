'use client';

import { useState, type FormEvent } from 'react';
import { parsePuzzleId } from '@/lib/sudoku';

type GridLookupProps = {
  initialGrid: string | null;
};

export default function GridLookup({ initialGrid }: GridLookupProps) {
  const [value, setValue] = useState(initialGrid ?? '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedGrid = value.trim().toUpperCase();
    if (!parsePuzzleId(normalizedGrid)) return;
    window.location.assign(`/sudoku/${normalizedGrid}`);
  };

  return (
    <form className="grid-lookup" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="grid-lookup-input">Quelle grille voulez-vous jouer ?</label>
      <div className="grid-lookup-row">
        <input
          className="auth-input"
          id="grid-lookup-input"
          name="grid"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          placeholder="M-1927"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
        <button className="action-button action-button--primary" type="submit">
          Ouvrir la grille
        </button>
      </div>
    </form>
  );
}
