import { useEffect, useRef } from 'react';
import { GameSaveData, SAVE_KEY, SAVE_VERSION } from '../utils/gameSave';

/**
 * Debounced autosave hook for the persistent game state.
 * Writes the provided snapshot to localStorage ~500ms after any change,
 * coalescing rapid updates (coin ticks, rent accrual, customization drags)
 * into a single write per burst.
 */
export function useGameSave(data: Omit<GameSaveData, 'version' | 'lastPlayed'>): void {
  // Keep the latest snapshot reachable from the debounced callback
  // without re-arming the timer on every render.
  const dataRef = useRef(data);
  dataRef.current = data;

  // Stable content signature drives the save effect (arrays/objects are
  // recreated each render, so identity can't be used as a dependency).
  const signature = JSON.stringify(data);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const payload: GameSaveData = {
          ...dataRef.current,
          version: SAVE_VERSION,
          lastPlayed: new Date().toISOString(),
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      } catch (err) {
        // Private mode / quota exceeded: game stays playable, progress just won't persist.
        console.warn('Uyoverse: autosave failed.', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [signature]);
}
