import { useEffect } from 'react';

type GameKeyboardOptions = {
  paused: boolean;
  completed: boolean;
  moveSelection: (rowDelta: number, columnDelta: number) => void;
  enterValue: (value: number) => void;
  clearValue: () => void;
};

export function useGameKeyboard({ paused, completed, moveSelection, enterValue, clearValue }: GameKeyboardOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (paused || completed) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const deltas: Record<string, [number, number]> = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
        };
        moveSelection(...deltas[event.key]);
      } else if (/^[1-9]$/.test(event.key)) {
        enterValue(Number(event.key));
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        clearValue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paused, completed, moveSelection, enterValue, clearValue]);
}
