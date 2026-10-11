export interface Landmark {
  id: string;
  name: string;
  tag: 'Civic' | 'Sports' | 'Leisure' | 'Skyline' | 'Education' | 'Nature' | 'Transport';
  desc: string;
  historicalNote: string;
  position: [number, number, number];
  color: string;
  height: number;
}

export type WeatherType = 'clear' | 'golden_hour' | 'night_neon' | 'tropical_rain' | 'harmattan';

export type CameraMode = 'chase' | 'hood' | 'orbit' | 'flyover';

export type VehicleModel = 'taxi' | 'keke' | 'coupe' | 'bus';

export type PlayerMode = 'driving' | 'walking';

export type RadioStation = 'uyo_fm' | 'dakkada_pulse' | 'heritage_fm' | 'atlantic_wave';

export type GraphicsQuality = 'low' | 'medium' | 'ultra';

export type CelebrationEffectMode = 'subtle' | 'off' | 'full';

export type PhotoFilter = 'none' | 'golden' | 'neon' | 'vintage' | 'harmattan';

export interface ExclusiveDecal {
  id: string;
  name: string;
  day: number;
  description: string;
  primaryColor: string;
  accentColor: string;
  pattern: 'stripes' | 'wings' | 'crest' | 'lightning' | 'star' | 'matrix' | 'monarch';
}

export interface DailyRewardTier {
  day: number;
  coins: number;
  xp: number;
  decal: ExclusiveDecal;
  title: string;
}

export interface VehicleCustomization {
  color: string;
  neonUnderglow: string; // 'none' | '#1fc16b' | '#f26522' | '#38bdf8'
  engineStage: number; // 1, 2, 3
  roofLight: boolean;
  decal?: string; // 'none' | decal.id
}

export interface Mission {
  id: string;
  title: string;
  type: 'courier' | 'heritage' | 'sprint' | 'vip';
  targetLandmarkId: string;
  brief: string;
  rewardXP: number;
  rewardCoins: number;
  timeLimitSec: number;
  completed: boolean;
}

export interface CollectibleArtifact {
  id: string;
  name: string;
  landmarkId: string;
  position: [number, number, number];
  desc: string;
  culturalLore: string;
  collected: boolean;
  icon: string;
}

export interface VirtualProperty {
  id: string;
  name: string;
  location: string;
  costCoins: number;
  hourlyYieldCoins: number;
  owned: boolean;
  desc: string;
  category: 'Commercial' | 'Residential' | 'Entertainment' | 'Tech';
}

export interface FoodItem {
  id: string;
  name: string;
  priceCoins: number;
  desc: string;
  buff: string;
  icon: string;
}

export interface VehicleState {
  x: number;
  z: number;
  speed: number;
  rotation: number;
  steering: number;
  isBraking: boolean;
  nitroRemaining: number; // 0 - 100
  isNitroActive: boolean;
  health: number; // 0 - 100
  gear: number;
  model: VehicleModel;
}

export interface AvatarState {
  x: number;
  z: number;
  rotation: number;
  speed: number;
  isWalking: boolean;
  isRunning: boolean;
  isJumping: boolean;
}

export interface OnlineDriver {
  id: string;
  name: string;
  model: VehicleModel;
  x: number;
  z: number;
  rot: number;
  color: string;
  statusMessage?: string;
}

export interface RoadmapPhase {
  id: number;
  phase: string;
  timeframe: string;
  objective: string;
  tag: string;
  iconName: string;
  steps: {
    title: string;
    details: string;
    deliverables: string[];
    technicalStack: string[];
  }[];
}

export type LeaderboardTier = 'legend' | 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';

export interface LeaderboardPlayer {
  id: string;
  rank: number;
  name: string;
  tag: string;
  xp: number;
  tier: LeaderboardTier;
  favoriteVehicle: string;
  district: string;
  title: string;
  isUser?: boolean;
  avatarColor: string;
  missionsCompleted: number;
  badge?: string;
}
