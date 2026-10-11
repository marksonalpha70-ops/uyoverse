import {
  CameraMode,
  GraphicsQuality,
  VehicleCustomization,
  WeatherType,
} from '../types/game';

export const SAVE_KEY = 'uyoverse_game_save';
export const SAVE_VERSION = 1;

/**
 * Versioned persistent game save schema.
 * Catalog-driven flags (missions / artifacts / properties) are stored as
 * ID arrays and rehydrated against the static catalogs on load, so adding
 * new content never invalidates existing saves.
 */
export interface GameSaveData {
  version: number;
  lastPlayed: string; // ISO timestamp, used for offline rent accrual
  playerXP: number;
  playerCoins: number;
  uncollectedRent: number;
  unlockedModels: string[];
  vehicleModel: string;
  customization: VehicleCustomization;
  graphicsQuality: GraphicsQuality;
  weather: WeatherType;
  cameraMode: CameraMode;
  completedMissionIds: string[];
  collectedArtifactIds: string[];
  ownedPropertyIds: string[];
}

export const DEFAULT_SAVE: GameSaveData = {
  version: SAVE_VERSION,
  lastPlayed: new Date(0).toISOString(),
  playerXP: 450,
  playerCoins: 6500,
  uncollectedRent: 350,
  unlockedModels: ['taxi', 'keke'],
  vehicleModel: 'taxi',
  customization: {
    color: '#f26522',
    neonUnderglow: 'none',
    engineStage: 1,
    roofLight: true,
    decal: 'none',
  },
  graphicsQuality: 'medium',
  weather: 'clear',
  cameraMode: 'chase',
  completedMissionIds: [],
  collectedArtifactIds: [],
  ownedPropertyIds: [],
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

/**
 * Defensive migration/normalization: unknown versions are coerced to the
 * latest schema by merging over defaults and dropping invalid fields.
 */
function normalizeSave(raw: unknown): GameSaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<GameSaveData>;

  return {
    version: SAVE_VERSION,
    lastPlayed: typeof r.lastPlayed === 'string' ? r.lastPlayed : new Date().toISOString(),
    playerXP: isNumber(r.playerXP) ? r.playerXP : DEFAULT_SAVE.playerXP,
    playerCoins: isNumber(r.playerCoins) ? r.playerCoins : DEFAULT_SAVE.playerCoins,
    uncollectedRent: isNumber(r.uncollectedRent) ? r.uncollectedRent : DEFAULT_SAVE.uncollectedRent,
    unlockedModels: isStringArray(r.unlockedModels) ? r.unlockedModels : DEFAULT_SAVE.unlockedModels,
    vehicleModel: typeof r.vehicleModel === 'string' ? r.vehicleModel : DEFAULT_SAVE.vehicleModel,
    customization:
      r.customization && typeof r.customization === 'object'
        ? {
            ...DEFAULT_SAVE.customization,
            color: typeof r.customization.color === 'string' ? r.customization.color : DEFAULT_SAVE.customization.color,
            neonUnderglow:
              typeof r.customization.neonUnderglow === 'string'
                ? r.customization.neonUnderglow
                : DEFAULT_SAVE.customization.neonUnderglow,
            engineStage: isNumber(r.customization.engineStage) ? r.customization.engineStage : 1,
            roofLight: typeof r.customization.roofLight === 'boolean' ? r.customization.roofLight : true,
            decal: typeof r.customization.decal === 'string' ? r.customization.decal : 'none',
          }
        : DEFAULT_SAVE.customization,
    graphicsQuality:
      r.graphicsQuality === 'low' || r.graphicsQuality === 'medium' || r.graphicsQuality === 'ultra'
        ? r.graphicsQuality
        : DEFAULT_SAVE.graphicsQuality,
    weather:
      r.weather === 'clear' ||
      r.weather === 'golden_hour' ||
      r.weather === 'night_neon' ||
      r.weather === 'tropical_rain' ||
      r.weather === 'harmattan'
        ? r.weather
        : DEFAULT_SAVE.weather,
    cameraMode:
      r.cameraMode === 'chase' || r.cameraMode === 'hood' || r.cameraMode === 'orbit' || r.cameraMode === 'flyover'
        ? r.cameraMode
        : DEFAULT_SAVE.cameraMode,
    completedMissionIds: isStringArray(r.completedMissionIds) ? r.completedMissionIds : [],
    collectedArtifactIds: isStringArray(r.collectedArtifactIds) ? r.collectedArtifactIds : [],
    ownedPropertyIds: isStringArray(r.ownedPropertyIds) ? r.ownedPropertyIds : [],
  };
}

/** Loads and validates the persistent save. Returns null on first launch or corrupt data. */
export function loadGameSave(): GameSaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return normalizeSave(JSON.parse(raw));
  } catch (err) {
    console.warn('Uyoverse: failed to load game save, starting fresh.', err);
    return null;
  }
}

/** Writes the save payload (version + timestamp stamped automatically). */
export function saveGameSave(data: Omit<GameSaveData, 'version' | 'lastPlayed'>): boolean {
  try {
    const payload: GameSaveData = {
      ...data,
      version: SAVE_VERSION,
      lastPlayed: new Date().toISOString(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    // Storage may be unavailable (private mode / quota). Fail silently, game stays playable.
    console.warn('Uyoverse: failed to persist game save.', err);
    return false;
  }
}

/** Wipes all durable progress (daily-reward streak & decals are managed separately). */
export function clearGameSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore restricted environments.
  }
}

/**
 * Passive rental income accrued while the game was closed.
 * Uses the real hourly yield of owned properties, capped at `capHours`
 * (default 24h) so a long absence can't dwarf active play earnings.
 */
export function computeOfflineRent(lastPlayedISO: string, totalHourlyYield: number, capHours = 24): number {
  if (totalHourlyYield <= 0) return 0;
  const lastPlayed = Date.parse(lastPlayedISO);
  if (!Number.isFinite(lastPlayed)) return 0;
  const elapsedHours = Math.min(Math.max((Date.now() - lastPlayed) / 3_600_000, 0), capHours);
  return Math.round(totalHourlyYield * elapsedHours);
}
