import { LeaderboardPlayer, LeaderboardTier } from '../types/game';

export const STORAGE_KEY_PLAYER_HANDLE = 'uyoverse_player_handle';

export const getTierFromXP = (xp: number): LeaderboardTier => {
  if (xp >= 5000) return 'legend';
  if (xp >= 3000) return 'diamond';
  if (xp >= 1800) return 'platinum';
  if (xp >= 1000) return 'gold';
  if (xp >= 400) return 'silver';
  return 'bronze';
};

export const getTierDetails = (tier: LeaderboardTier) => {
  switch (tier) {
    case 'legend':
      return {
        label: 'Legend of Uyo',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-400/60',
        glow: 'shadow-amber-500/20',
        minXP: 5000,
        badge: '👑',
      };
    case 'diamond':
      return {
        label: 'Diamond Driver',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-400/60',
        glow: 'shadow-cyan-500/20',
        minXP: 3000,
        badge: '💎',
      };
    case 'platinum':
      return {
        label: 'Platinum Cruiser',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-400/60',
        glow: 'shadow-emerald-500/20',
        minXP: 1800,
        badge: '🏆',
      };
    case 'gold':
      return {
        label: 'Gold Racer',
        color: 'text-yellow-300',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-400/50',
        glow: 'shadow-yellow-500/10',
        minXP: 1000,
        badge: '🥇',
      };
    case 'silver':
      return {
        label: 'Silver Navigator',
        color: 'text-slate-300',
        bgColor: 'bg-slate-400/20',
        borderColor: 'border-slate-400/50',
        glow: '',
        minXP: 400,
        badge: '🥈',
      };
    case 'bronze':
    default:
      return {
        label: 'Bronze Rookie',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        glow: '',
        minXP: 0,
        badge: '🥉',
      };
  }
};

export const BASE_COMMUNITY_PLAYERS: Omit<LeaderboardPlayer, 'rank' | 'tier'>[] = [
  {
    id: 'legend-1',
    name: 'Bassey_Drift_Pro',
    tag: '@bassey_drift',
    xp: 6250,
    favoriteVehicle: 'Akwa Star Sports Coupe',
    district: 'Ibom Plaza Fountain Ring',
    title: 'Grandmaster of Aka Road',
    avatarColor: '#f26522',
    missionsCompleted: 48,
    badge: '👑',
  },
  {
    id: 'legend-2',
    name: 'Edidiong_Apex',
    tag: '@edidiong_apex',
    xp: 5420,
    favoriteVehicle: 'Executive Dakkada Cyber-SUV',
    district: 'Wellington Bassey Way',
    title: 'The Governor’s Chauffeur',
    avatarColor: '#1fc16b',
    missionsCompleted: 42,
    badge: '⚡',
  },
  {
    id: 'legend-3',
    name: 'Queen_Of_Ikot_Ekpene',
    tag: '@ikot_queen',
    xp: 4890,
    favoriteVehicle: 'Ibom Yellow Keke NAPEP',
    district: 'Itam Peace Junction',
    title: 'Empress of Tricycles',
    avatarColor: '#eab308',
    missionsCompleted: 39,
    badge: '🌟',
  },
  {
    id: 'legend-4',
    name: 'Ibom_Speedster',
    tag: '@ibom_speed',
    xp: 4150,
    favoriteVehicle: 'Akwa Star Sports Coupe',
    district: 'Godswill Akpabio Stadium',
    title: 'Nest of Champions Falcon',
    avatarColor: '#38bdf8',
    missionsCompleted: 35,
    badge: '🦅',
  },
  {
    id: 'legend-5',
    name: 'Mfoniso_Viper',
    tag: '@mfon_viper',
    xp: 3600,
    favoriteVehicle: 'Uyo Metropolitan City Bus',
    district: 'Nwaniba Boulevard',
    title: 'Boulevard Convoy Leader',
    avatarColor: '#ec4899',
    missionsCompleted: 31,
    badge: '🔥',
  },
  {
    id: 'legend-6',
    name: 'UyoKekeQueen',
    tag: '@uyo_keke_q',
    xp: 3120,
    favoriteVehicle: 'Ibom Yellow Keke NAPEP',
    district: 'UniUyo Town Campus Gate',
    title: 'Campus Transit Ace',
    avatarColor: '#a855f7',
    missionsCompleted: 28,
    badge: '🎓',
  },
  {
    id: 'legend-7',
    name: 'Aniefiok_Turbo',
    tag: '@aniefiok_t',
    xp: 2680,
    favoriteVehicle: 'Aka Road Commercial Taxi',
    district: 'Tropicana Entertainment Mall',
    title: 'Cinema Strip Sprinter',
    avatarColor: '#10b981',
    missionsCompleted: 24,
    badge: '🚀',
  },
  {
    id: 'legend-8',
    name: 'Emeka_RingRoad_Ghost',
    tag: '@emeka_ghost',
    xp: 2210,
    favoriteVehicle: 'Akwa Star Sports Coupe',
    district: 'Ring Road 3 Highway',
    title: 'Midnight Ghost Racer',
    avatarColor: '#6366f1',
    missionsCompleted: 20,
    badge: '👻',
  },
  {
    id: 'legend-9',
    name: 'Ette_Afang_Cruiser',
    tag: '@ette_afang',
    xp: 1840,
    favoriteVehicle: 'Aka Road Commercial Taxi',
    district: 'Ekiti Street Food Alley',
    title: 'Gastronomy Express Pioneer',
    avatarColor: '#f97316',
    missionsCompleted: 17,
    badge: '🍲',
  },
  {
    id: 'legend-10',
    name: 'Champion_Ini',
    tag: '@champion_ini',
    xp: 1490,
    favoriteVehicle: 'Executive Dakkada Cyber-SUV',
    district: 'Dakkada Global Towers',
    title: 'High-Altitude Cruiser',
    avatarColor: '#06b6d4',
    missionsCompleted: 15,
    badge: '🏢',
  },
  {
    id: 'legend-11',
    name: 'Usoro_GhostRider',
    tag: '@usoro_rider',
    xp: 1180,
    favoriteVehicle: 'Akwa Star Sports Coupe',
    district: 'Oron Road Flyover',
    title: 'Flyover Drifter',
    avatarColor: '#84cc16',
    missionsCompleted: 12,
    badge: '🏎️',
  },
  {
    id: 'legend-12',
    name: 'Imaobong_Drift',
    tag: '@ima_drift',
    xp: 880,
    favoriteVehicle: 'Ibom Yellow Keke NAPEP',
    district: 'Brooks Street Corner',
    title: 'Agile Maneuver Specialist',
    avatarColor: '#f43f5e',
    missionsCompleted: 9,
    badge: '✨',
  },
  {
    id: 'legend-13',
    name: 'Kufre_Cruiser',
    tag: '@kufre_c',
    xp: 620,
    favoriteVehicle: 'Aka Road Commercial Taxi',
    district: 'Four Lanes Boulevard',
    title: 'Smooth Asphalt Cruiser',
    avatarColor: '#e11d48',
    missionsCompleted: 7,
    badge: '🛣️',
  },
  {
    id: 'legend-14',
    name: 'Nsikan_Apex',
    tag: '@nsikan_apex',
    xp: 450,
    favoriteVehicle: 'Uyo Metropolitan City Bus',
    district: 'Abak Road Roundabout',
    title: 'Roundabout Navigator',
    avatarColor: '#14b8a6',
    missionsCompleted: 5,
    badge: '🎯',
  },
  {
    id: 'legend-15',
    name: 'Victor_Rookie_Ace',
    tag: '@victor_ace',
    xp: 220,
    favoriteVehicle: 'Aka Road Commercial Taxi',
    district: 'Plaza Underpass',
    title: 'Rising Street Cadet',
    avatarColor: '#8b5cf6',
    missionsCompleted: 3,
    badge: '🔰',
  },
];

export const getPlayerHandle = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYER_HANDLE);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    console.warn('Could not read player handle from localStorage', e);
  }
  return 'You (Ibom Driver)';
};

export const setPlayerHandle = (name: string): string => {
  const sanitized = name.trim().slice(0, 24) || 'You (Ibom Driver)';
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_HANDLE, sanitized);
  } catch (e) {
    console.warn('Could not save player handle to localStorage', e);
  }
  return sanitized;
};

export interface LeaderboardResult {
  leaderboard: LeaderboardPlayer[];
  userRank: number;
  userEntry: LeaderboardPlayer;
  nextLegend: LeaderboardPlayer | null;
  xpToNextRank: number;
  totalPlayers: number;
}

export const getUyoLegendsLeaderboard = (
  playerXP: number,
  playerName?: string
): LeaderboardResult => {
  const currentHandle = playerName || getPlayerHandle();
  const userTier = getTierFromXP(playerXP);

  const userEntryBase: Omit<LeaderboardPlayer, 'rank'> = {
    id: 'user-current-player',
    name: currentHandle,
    tag: `@${currentHandle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    xp: playerXP,
    tier: userTier,
    favoriteVehicle: 'Akwa Star Sports Coupe',
    district: 'Ibom Plaza & Aka Road',
    title: getTierDetails(userTier).label,
    isUser: true,
    avatarColor: '#1fc16b',
    missionsCompleted: Math.max(1, Math.floor(playerXP / 80)),
    badge: getTierDetails(userTier).badge,
  };

  // Merge community players and user
  const combined = [
    ...BASE_COMMUNITY_PLAYERS.map((p) => ({
      ...p,
      tier: getTierFromXP(p.xp),
      isUser: false,
    })),
    userEntryBase,
  ];

  // Sort descending by XP
  combined.sort((a, b) => b.xp - a.xp);

  // Assign ranks
  const ranked: LeaderboardPlayer[] = combined.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  const userIndex = ranked.findIndex((p) => p.isUser);
  const userRank = userIndex >= 0 ? userIndex + 1 : ranked.length;
  const userEntry = ranked[userIndex >= 0 ? userIndex : ranked.length - 1];

  const nextLegend = userIndex > 0 ? ranked[userIndex - 1] : null;
  const xpToNextRank = nextLegend ? Math.max(1, nextLegend.xp - userEntry.xp) : 0;

  return {
    leaderboard: ranked,
    userRank,
    userEntry,
    nextLegend,
    xpToNextRank,
    totalPlayers: ranked.length,
  };
};
