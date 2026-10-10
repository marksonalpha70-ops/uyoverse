import { DailyRewardTier, ExclusiveDecal } from '../types/game';

export const STORAGE_KEY_LAST_CLAIM = 'uyoverse_daily_reward_last_claim';
export const STORAGE_KEY_STREAK = 'uyoverse_daily_reward_streak';
export const STORAGE_KEY_UNLOCKED_DECALS = 'uyoverse_unlocked_decals';

export const EXCLUSIVE_DECALS: ExclusiveDecal[] = [
  {
    id: 'decal_aka_speedster',
    name: 'Aka Road Speedster',
    day: 1,
    description: 'High-contrast twin racing stripes commemorating the arterial speed of Aka Road boulevard.',
    primaryColor: '#1fc16b',
    accentColor: '#f26522',
    pattern: 'stripes',
  },
  {
    id: 'decal_dakkada_wings',
    name: 'Dakkada Falcon Wings',
    day: 2,
    description: 'Aerodynamic falcon wing contours reflecting the rise and aspiration of Akwa Ibom.',
    primaryColor: '#38bdf8',
    accentColor: '#ffffff',
    pattern: 'wings',
  },
  {
    id: 'decal_tropic_thunder',
    name: 'Ibom Tropic Thunder',
    day: 3,
    description: 'Dynamic electric lightning decals inspired by tropical coastal storms across Uyo.',
    primaryColor: '#facc15',
    accentColor: '#f97316',
    pattern: 'lightning',
  },
  {
    id: 'decal_godswill_star',
    name: 'Godswill Stadium Ultra Star',
    day: 4,
    description: 'Geometric celestial star emblems echoing the architecture of the Nest of Champions arena.',
    primaryColor: '#a855f7',
    accentColor: '#38bdf8',
    pattern: 'star',
  },
  {
    id: 'decal_ebibio_crest',
    name: 'Ebibio Royal Crest',
    day: 5,
    description: 'Regal bronze and emerald traditional insignia honoring indigenous heritage and craftsmanship.',
    primaryColor: '#10b981',
    accentColor: '#d97706',
    pattern: 'crest',
  },
  {
    id: 'decal_neon_matrix',
    name: 'Cyber Uyo Neon Matrix',
    day: 6,
    description: 'Cyberpunk digital circuit grid lines that illuminate during nighttime cruising.',
    primaryColor: '#06b6d4',
    accentColor: '#ec4899',
    pattern: 'matrix',
  },
  {
    id: 'decal_ibom_monarch',
    name: 'Grand Akwa Ibom Monarch',
    day: 7,
    description: 'The premier royal championship livery with lustrous 24K gold borders and emerald filigree.',
    primaryColor: '#f59e0b',
    accentColor: '#1fc16b',
    pattern: 'monarch',
  },
];

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  {
    day: 1,
    coins: 1500,
    xp: 150,
    decal: EXCLUSIVE_DECALS[0],
    title: 'First Lap Welcome Bonus',
  },
  {
    day: 2,
    coins: 2500,
    xp: 250,
    decal: EXCLUSIVE_DECALS[1],
    title: 'Dakkada Momentum Bonus',
  },
  {
    day: 3,
    coins: 4000,
    xp: 350,
    decal: EXCLUSIVE_DECALS[2],
    title: 'Tropic Thunder Surge',
  },
  {
    day: 4,
    coins: 5500,
    xp: 450,
    decal: EXCLUSIVE_DECALS[3],
    title: 'Champions League Stride',
  },
  {
    day: 5,
    coins: 7500,
    xp: 600,
    decal: EXCLUSIVE_DECALS[4],
    title: 'Heritage Prestige Payout',
  },
  {
    day: 6,
    coins: 10000,
    xp: 800,
    decal: EXCLUSIVE_DECALS[5],
    title: 'Cyber City Elite Dividend',
  },
  {
    day: 7,
    coins: 15000,
    xp: 1200,
    decal: EXCLUSIVE_DECALS[6],
    title: 'Grand Ibom Royal Jack-pot',
  },
];

/**
 * Returns current date formatted in local 'YYYY-MM-DD'
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if candidateDateStr was exactly one calendar day before targetDateStr
 */
export function isConsecutiveDay(previousDateStr: string, currentDateStr: string): boolean {
  try {
    const prev = new Date(`${previousDateStr}T00:00:00`);
    const curr = new Date(`${currentDateStr}T00:00:00`);
    const diffMs = curr.getTime() - prev.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    // Account for potential daylight saving offset (23 to 25 hours)
    return diffMs >= 20 * 60 * 60 * 1000 && diffMs <= 28 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export interface DailyRewardStatus {
  canClaim: boolean;
  currentStreakDay: number; // 1 to 7
  lastClaimDate: string | null;
  todayDate: string;
  nextTier: DailyRewardTier;
  allTiers: DailyRewardTier[];
  unlockedDecalIds: string[];
}

export function getDailyRewardStatus(): DailyRewardStatus {
  const todayStr = getLocalDateString();
  let lastClaimDate: string | null = null;
  let savedStreak = 1;

  try {
    lastClaimDate = localStorage.getItem(STORAGE_KEY_LAST_CLAIM);
    const rawStreak = localStorage.getItem(STORAGE_KEY_STREAK);
    if (rawStreak) {
      savedStreak = parseInt(rawStreak, 10) || 1;
    }
  } catch {
    // LocalStorage fallback for sandbox or restricted environments
  }

  const unlockedDecalIds = getUnlockedDecalIds();

  // If user never claimed before:
  if (!lastClaimDate) {
    const day = 1;
    return {
      canClaim: true,
      currentStreakDay: day,
      lastClaimDate: null,
      todayDate: todayStr,
      nextTier: DAILY_REWARD_TIERS[day - 1],
      allTiers: DAILY_REWARD_TIERS,
      unlockedDecalIds,
    };
  }

  // If already claimed today:
  if (lastClaimDate === todayStr) {
    const day = Math.min(Math.max(savedStreak, 1), 7);
    return {
      canClaim: false,
      currentStreakDay: day,
      lastClaimDate,
      todayDate: todayStr,
      nextTier: DAILY_REWARD_TIERS[day - 1],
      allTiers: DAILY_REWARD_TIERS,
      unlockedDecalIds,
    };
  }

  // If user is claiming on a subsequent day:
  let effectiveStreak = 1;
  if (isConsecutiveDay(lastClaimDate, todayStr)) {
    // Consecutive day bonus: advance streak (loops back to 1 after day 7)
    effectiveStreak = savedStreak >= 7 ? 1 : savedStreak + 1;
  } else {
    // Missed a day or more: reset streak to 1
    effectiveStreak = 1;
  }

  return {
    canClaim: true,
    currentStreakDay: effectiveStreak,
    lastClaimDate,
    todayDate: todayStr,
    nextTier: DAILY_REWARD_TIERS[effectiveStreak - 1],
    allTiers: DAILY_REWARD_TIERS,
    unlockedDecalIds,
  };
}

export function claimDailyReward(): {
  success: boolean;
  tier: DailyRewardTier;
  streakDay: number;
  newUnlockedDecals: string[];
} {
  const status = getDailyRewardStatus();
  if (!status.canClaim) {
    return {
      success: false,
      tier: status.nextTier,
      streakDay: status.currentStreakDay,
      newUnlockedDecals: status.unlockedDecalIds,
    };
  }

  const streakDay = status.currentStreakDay;
  const claimedTier = status.nextTier;
  const todayStr = status.todayDate;

  // Persist last claim date and streak
  try {
    localStorage.setItem(STORAGE_KEY_LAST_CLAIM, todayStr);
    localStorage.setItem(STORAGE_KEY_STREAK, streakDay.toString());
  } catch (err) {
    console.warn('Failed to save daily reward claim date to localStorage:', err);
  }

  // Unlock the exclusive decal for today
  const unlocked = unlockDecal(claimedTier.decal.id);

  return {
    success: true,
    tier: claimedTier,
    streakDay,
    newUnlockedDecals: unlocked,
  };
}

export function getUnlockedDecalIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNLOCKED_DECALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(['none', ...parsed]));
      }
    }
  } catch {
    // Fallback
  }
  return ['none'];
}

export function unlockDecal(decalId: string): string[] {
  const existing = getUnlockedDecalIds();
  if (!existing.includes(decalId)) {
    existing.push(decalId);
    try {
      localStorage.setItem(STORAGE_KEY_UNLOCKED_DECALS, JSON.stringify(existing));
    } catch {
      // Fallback
    }
  }
  return existing;
}

export function getDecalById(decalId: string): ExclusiveDecal | undefined {
  return EXCLUSIVE_DECALS.find((d) => d.id === decalId);
}
