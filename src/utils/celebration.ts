import confetti from 'canvas-confetti';
import { CelebrationEffectMode } from '../types/game';

// Track current celebration mode globally with persistent preference
let currentCelebrationMode: CelebrationEffectMode = 'subtle';

export const setCelebrationMode = (mode: CelebrationEffectMode) => {
  currentCelebrationMode = mode;
  try {
    localStorage.setItem('uyoverse_celebration_mode', mode);
  } catch {
    // Storage access may be restricted in some iframes
  }
};

export const getCelebrationMode = (): CelebrationEffectMode => {
  try {
    const saved = localStorage.getItem('uyoverse_celebration_mode') as CelebrationEffectMode | null;
    if (saved && (saved === 'subtle' || saved === 'off' || saved === 'full')) {
      currentCelebrationMode = saved;
      return saved;
    }
  } catch {
    // Fallback to default
  }
  return currentCelebrationMode;
};

/**
 * Fires a refined, non-disruptive celebration effect.
 * Instead of flooding the center of the driving screen with huge flakes,
 * it gently drops delicate micro-sparkles from the top perimeter,
 * keeping the road and HUD completely clear.
 */
export const triggerCelebration = (
  type: 'mission' | 'relic' | 'goal' = 'mission',
  customMode?: CelebrationEffectMode
) => {
  const mode = customMode || getCelebrationMode();

  // If user turned celebrations off, do nothing
  if (mode === 'off') return;

  const isSubtle = mode === 'subtle';

  if (type === 'mission') {
    // Refined subtle twin accent flutter from top corners
    const particleCount = isSubtle ? 18 : 36;
    const colors = ['#1fc16b', '#f26522', '#facc15', '#ffffff'];

    // Left top accent
    confetti({
      particleCount,
      angle: 60,
      spread: isSubtle ? 40 : 55,
      origin: { x: 0.05, y: 0.08 },
      startVelocity: isSubtle ? 18 : 25,
      gravity: 1.1,
      scalar: isSubtle ? 0.6 : 0.8,
      ticks: isSubtle ? 90 : 130,
      colors,
      disableForReducedMotion: true,
    });

    // Right top accent
    confetti({
      particleCount,
      angle: 120,
      spread: isSubtle ? 40 : 55,
      origin: { x: 0.95, y: 0.08 },
      startVelocity: isSubtle ? 18 : 25,
      gravity: 1.1,
      scalar: isSubtle ? 0.6 : 0.8,
      ticks: isSubtle ? 90 : 130,
      colors,
      disableForReducedMotion: true,
    });
  } else if (type === 'relic') {
    // Delicate cyan & gold shimmer along the top
    confetti({
      particleCount: isSubtle ? 20 : 35,
      spread: isSubtle ? 45 : 60,
      origin: { x: 0.5, y: 0.08 },
      startVelocity: isSubtle ? 16 : 22,
      gravity: 1.2,
      scalar: isSubtle ? 0.55 : 0.75,
      ticks: isSubtle ? 80 : 110,
      colors: ['#38bdf8', '#1fc16b', '#facc15'],
      disableForReducedMotion: true,
    });
  } else if (type === 'goal') {
    // Quick celebratory flutter for the stadium goal
    confetti({
      particleCount: isSubtle ? 25 : 45,
      spread: isSubtle ? 50 : 65,
      origin: { x: 0.5, y: 0.2 },
      startVelocity: isSubtle ? 20 : 28,
      gravity: 1.15,
      scalar: isSubtle ? 0.6 : 0.85,
      ticks: isSubtle ? 95 : 140,
      colors: ['#1fc16b', '#ffffff', '#f26522'],
      disableForReducedMotion: true,
    });
  }
};
