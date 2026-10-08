import { useEffect, type Dispatch, type SetStateAction } from 'react';

export function useGameTimer(
  started: boolean,
  paused: boolean,
  completed: boolean,
  setElapsedSeconds: Dispatch<SetStateAction<number>>,
) {
  useEffect(() => {
    if (!started || paused || completed) return;
    const timer = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, paused, completed, setElapsedSeconds]);
}
