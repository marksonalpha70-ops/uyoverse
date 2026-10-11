/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { CommunityLobbyView } from './components/CommunityLobbyView';
import { CityGuideView } from './components/CityGuideView';
import { GameSettingsModal } from './components/GameSettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GarageModal } from './components/GarageModal';
import { QuestsModal } from './components/QuestsModal';
import { PenaltyShootoutModal } from './components/PenaltyShootoutModal';
import { DakkadaObservatoryModal } from './components/DakkadaObservatoryModal';
import { FoodKioskModal } from './components/FoodKioskModal';
import { RealEstateModal } from './components/RealEstateModal';
import { PhotoModeModal } from './components/PhotoModeModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { UyoverseLogo } from './components/UyoverseLogo';
import {
  CameraMode,
  Landmark,
  Mission,
  VehicleState,
  WeatherType,
  VehicleModel,
  PlayerMode,
  VehicleCustomization,
  CollectibleArtifact,
  AvatarState,
  VirtualProperty,
  FoodItem,
  GraphicsQuality,
  CelebrationEffectMode,
} from './types/game';
import { getCelebrationMode, setCelebrationMode } from './utils/celebration';
import { loadGameSave, clearGameSave, computeOfflineRent } from './utils/gameSave';
import { useGameSave } from './hooks/useGameSave';
import { getDailyRewardStatus, getUnlockedDecalIds, getDecalById } from './utils/dailyReward';
import { getTierFromXP, getTierDetails } from './utils/leaderboard';
import {
  GAME_MISSIONS,
  UYO_LANDMARKS,
  COLLECTIBLE_ARTIFACTS,
  PROPERTIES_CATALOG,
} from './data/gameData';
import {
  Gamepad2,
  Users,
  Compass,
  Coins,
  Trophy,
  Navigation,
  Settings,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  Info,
  Gift,
  Sparkles,
} from 'lucide-react';

type NavTab = 'gameplay' | 'community' | 'guide';

interface InGameToast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning';
}

// Custom hook for buttery-smooth number count-up animation on money / XP changes
function useCountUp(target: number, duration: number = 550) {
  const [current, setCurrent] = useState(target);
  const startRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = current;
    startTimeRef.current = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startRef.current + (target - startRef.current) * easeProgress);
      setCurrent(val);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return current;
}

export default function App() {
  // Persistent save: hydrated once per launch, autosaved via useGameSave below
  const [savedGame] = useState(() => loadGameSave());

  // Loading Screen state (Part D)
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(20);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const loadingTips = [
    "Tip: Explore Ibom Plaza to discover rare cultural artifacts.",
    "Tip: Use the JOB dropdown in your objective card to switch courier routes.",
    "Tip: Press 'E' to toggle between walking and driving across Uyo.",
    "Tip: Tune into Radio Uyo 101.1 FM for authentic Afro-Fusion driving grooves.",
    "Tip: Acquire commercial real estate to collect hourly dividend yields.",
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 2200);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoading(false), 280);
          return 100;
        }
        return prev + 25;
      });
    }, 180);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<NavTab>('gameplay');
  const [weather, setWeather] = useState<WeatherType>(savedGame?.weather ?? 'clear');
  const [cameraMode, setCameraMode] = useState<CameraMode>(savedGame?.cameraMode ?? 'chase');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('driving');
  const [unlockedModels, setUnlockedModels] = useState<string[]>(savedGame?.unlockedModels ?? ['taxi', 'keke']);
  const [vehicleModel, setVehicleModel] = useState<VehicleModel>(() => {
    const saved = savedGame?.vehicleModel as VehicleModel | undefined;
    return saved && (savedGame?.unlockedModels ?? []).includes(saved) ? saved : 'taxi';
  });
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(savedGame?.graphicsQuality ?? 'medium');
  const [celebrationMode, setCelebrationModeState] = useState<CelebrationEffectMode>(() => getCelebrationMode());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toasts, setToasts] = useState<InGameToast[]>([]);

  const handleSetCelebrationMode = (mode: CelebrationEffectMode) => {
    setCelebrationModeState(mode);
    setCelebrationMode(mode);
    showToast(
      mode === 'off'
        ? 'Celebration effects turned off (Clean HUD)'
        : mode === 'subtle'
        ? 'Celebrations set to Subtle Sparkles (Minimalist)'
        : 'Celebrations set to Festive',
      'info'
    );
  };

  const [customization, setCustomization] = useState<VehicleCustomization>(
    savedGame?.customization ?? {
      color: '#ff6a1a',
      neonUnderglow: 'none',
      engineStage: 1,
      roofLight: true,
      decal: 'none',
    }
  );

  const [missions, setMissions] = useState<Mission[]>(() =>
    GAME_MISSIONS.map((m) => ({ ...m, completed: savedGame?.completedMissionIds.includes(m.id) ?? false }))
  );
  const [activeMission, setActiveMission] = useState<Mission | null>(
    () => missions.find((m) => !m.completed) ?? missions[0]
  );
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [artifacts, setArtifacts] = useState<CollectibleArtifact[]>(() =>
    COLLECTIBLE_ARTIFACTS.map((a) => ({ ...a, collected: savedGame?.collectedArtifactIds.includes(a.id) ?? false }))
  );
  const [properties, setProperties] = useState<VirtualProperty[]>(() =>
    PROPERTIES_CATALOG.map((p) => ({ ...p, owned: savedGame?.ownedPropertyIds.includes(p.id) ?? false }))
  );

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isShootoutOpen, setIsShootoutOpen] = useState(false);
  const [isObservatoryOpen, setIsObservatoryOpen] = useState(false);
  const [isFoodKioskOpen, setIsFoodKioskOpen] = useState(false);
  const [isRealEstateOpen, setIsRealEstateOpen] = useState(false);
  const [isPhotoModeOpen, setIsPhotoModeOpen] = useState(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Daily login reward system & unlocked decals
  const [dailyRewardStatus, setDailyRewardStatus] = useState(() => getDailyRewardStatus());
  const [unlockedDecals, setUnlockedDecals] = useState<string[]>(() => getUnlockedDecalIds());

  // Economy & progression (restored from persistent save)
  const [playerXP, setPlayerXP] = useState(savedGame?.playerXP ?? 450);
  const [playerCoins, setPlayerCoins] = useState(savedGame?.playerCoins ?? 6500);

  // Smooth animated count-up numbers
  const animatedCoins = useCountUp(playerCoins);
  const animatedXP = useCountUp(playerXP);

  // Rank name & progress
  const currentTier = getTierFromXP(playerXP);
  const tierDetails = getTierDetails(currentTier);
  const nextTierXP = currentTier === 'bronze' ? 400 : currentTier === 'silver' ? 1000 : currentTier === 'gold' ? 1800 : currentTier === 'platinum' ? 3000 : 5000;
  const xpProgressPercent = Math.min(100, Math.round((playerXP / nextTierXP) * 100));

  // Rental income accrued while the game was closed (capped at 24h), added once at launch
  const [offlineRentEarned] = useState(() => {
    if (!savedGame) return 0;
    const hourlyYield = PROPERTIES_CATALOG.filter((p) => savedGame.ownedPropertyIds.includes(p.id)).reduce(
      (sum, p) => sum + p.hourlyYieldCoins,
      0
    );
    return computeOfflineRent(savedGame.lastPlayed, hourlyYield);
  });
  const [uncollectedRent, setUncollectedRent] = useState((savedGame?.uncollectedRent ?? 350) + offlineRentEarned);

  const [vehicleState, setVehicleState] = useState<VehicleState>({
    x: 0,
    z: 75,
    speed: 0,
    rotation: 0,
    steering: 0,
    isBraking: false,
    nitroRemaining: 100,
    isNitroActive: false,
    health: 100,
    gear: 1,
    model: 'taxi',
  });

  const [avatarState, setAvatarState] = useState<AvatarState>({
    x: 2,
    z: 78,
    rotation: 0,
    speed: 0,
    isWalking: false,
    isRunning: false,
    isJumping: false,
  });

  // Toast notification helper with aria-live support
  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newToast: InGameToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev.slice(-2), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  };

  // Welcome-back notification for offline rental earnings
  const offlineToastShown = useRef(false);
  useEffect(() => {
    if (offlineRentEarned > 0 && !offlineToastShown.current) {
      offlineToastShown.current = true;
      showToast(
        `🌙 Welcome back! Your properties earned ₦${offlineRentEarned.toLocaleString()} in rent while you were away.`,
        'info'
      );
    }
  }, [offlineRentEarned]);

  // Passive property income accumulator
  useEffect(() => {
    const timer = setInterval(() => {
      const activeProperties = properties.filter((p) => p.owned);
      const totalYield = activeProperties.reduce((sum, p) => sum + p.hourlyYieldCoins, 0);
      if (totalYield > 0) {
        const tickIncome = Math.max(1, Math.round(totalYield / 60));
        setUncollectedRent((r) => r + tickIncome);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [properties]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetProgress = () => {
    clearGameSave();
    window.location.reload();
  };

  const handleResetVehicle = () => {
    setVehicleState((prev) => ({
      ...prev,
      x: 0,
      z: 75,
      speed: 0,
      rotation: 0,
      steering: 0,
      isBraking: false,
      health: 100,
      nitroRemaining: 100,
    }));
    setAvatarState((prev) => ({
      ...prev,
      x: 2,
      z: 78,
      speed: 0,
      rotation: 0,
    }));
    showToast('Vehicle position reset to Aka Road boulevard approaching Ibom Plaza!', 'info');
  };

  // Workshop chassis repair
  const handleRepairVehicle = () => {
    const repairCost = Math.round((100 - vehicleState.health) * 12);
    if (repairCost <= 0) {
      showToast('Chassis is already in factory condition (100%)!', 'info');
      return;
    }
    if (playerCoins >= repairCost) {
      setPlayerCoins((c) => c - repairCost);
      setVehicleState((prev) => ({ ...prev, health: 100 }));
      showToast(`🔧 Chassis fully restored to 100% durability (-₦${repairCost.toLocaleString()})!`, 'success');
    } else {
      showToast(`Need ₦${(repairCost - playerCoins).toLocaleString()} more Ibom Coins for workshop repairs!`, 'warning');
    }
  };

  // Daily Check-in check on first launch
  useEffect(() => {
    const status = getDailyRewardStatus();
    setDailyRewardStatus(status);
    if (status.canClaim) {
      setIsDailyRewardOpen(true);
      showToast(
        `🎁 Daily Check-in: Day ${status.currentStreakDay} reward ready! Extra Ibom Coins & exclusive wraps available.`,
        'info'
      );
    }
  }, []);

  const handleClaimDailyReward = (rewardCoins: number, rewardXP: number, decalId: string) => {
    setPlayerCoins((c) => c + rewardCoins);
    setPlayerXP((xp) => xp + rewardXP);
    const updatedDecals = getUnlockedDecalIds();
    setUnlockedDecals(updatedDecals);
    const newStatus = getDailyRewardStatus();
    setDailyRewardStatus(newStatus);
    const decal = getDecalById(decalId);
    showToast(
      `🎉 Daily Reward Claimed! +₦${rewardCoins.toLocaleString()} Ibom Coins & Unlocked "${decal ? decal.name : 'Exclusive'}" Wrap!`,
      'success'
    );
  };

  const handleMissionComplete = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
    const m = missions.find((x) => x.id === missionId);
    if (m && !m.completed) {
      setPlayerXP((xp) => xp + m.rewardXP);
      setPlayerCoins((c) => c + m.rewardCoins);
      showToast(`🏆 Mission Completed! +₦${m.rewardCoins.toLocaleString()} & +${m.rewardXP} XP`, 'success');
    }
  };

  const handleCollectArtifact = (artifactId: string) => {
    setArtifacts((prev) =>
      prev.map((a) => (a.id === artifactId ? { ...a, collected: true } : a))
    );
    const art = artifacts.find((a) => a.id === artifactId);
    setPlayerXP((xp) => xp + 500);
    setPlayerCoins((c) => c + 1500);
    showToast(`✨ Relic Discovered: ${art ? art.name : 'Akwa Ibom Artifact'} (+₦1,500)!`, 'success');
  };

  const handleUnlockVehicle = (model: VehicleModel, cost: number) => {
    if (playerCoins >= cost) {
      setPlayerCoins((c) => c - cost);
      setUnlockedModels((prev) => [...prev, model]);
      setVehicleModel(model);
      showToast(`🎉 Congratulations! You unlocked the ${model.toUpperCase()}!`, 'success');
    } else {
      showToast(`Need ₦${(cost - playerCoins).toLocaleString()} more Ibom Coins! Complete jobs to earn fares.`, 'warning');
    }
  };

  const handleUpgradeEngine = (stage: number, cost: number) => {
    if (playerCoins >= cost) {
      setPlayerCoins((c) => c - cost);
      setCustomization((prev) => ({ ...prev, engineStage: stage }));
      showToast(`⚡ Engine tuned to Stage ${stage}! Top speed & acceleration upgraded.`, 'success');
    } else {
      showToast(`Need ₦${(cost - playerCoins).toLocaleString()} more Ibom Coins for this engine stage!`, 'warning');
    }
  };

  const handleBuyProperty = (prop: VirtualProperty) => {
    if (playerCoins >= prop.costCoins) {
      setPlayerCoins((c) => c - prop.costCoins);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, owned: true } : p))
      );
      setPlayerXP((xp) => xp + 800);
      showToast(`🏢 Property Acquired: ${prop.name}! Hourly yield added.`, 'success');
    } else {
      showToast(`Need ₦${(prop.costCoins - playerCoins).toLocaleString()} more Ibom Coins to acquire title deed!`, 'warning');
    }
  };

  const handleCollectRent = () => {
    if (uncollectedRent > 0) {
      setPlayerCoins((c) => c + uncollectedRent);
      showToast(`💰 Collected ₦${uncollectedRent.toLocaleString()} in property rental yields!`, 'success');
      setUncollectedRent(0);
    }
  };

  const handleEatFood = (food: FoodItem) => {
    setPlayerCoins((c) => c - food.priceCoins);
    setVehicleState((prev) => ({
      ...prev,
      health: 100,
      nitroRemaining: 100,
    }));
    showToast(`🍲 Savored ${food.name}! Vehicle durability & boost restored to 100%!`, 'success');
    setIsFoodKioskOpen(false);
  };

  const handleWinShootout = (rewardXP: number, rewardCoins: number) => {
    setPlayerXP((xp) => xp + rewardXP);
    setPlayerCoins((c) => c + rewardCoins);
    showToast(`⚽ GOAL! Match won: +₦${rewardCoins.toLocaleString()} and +${rewardXP} XP!`, 'success');
  };

  const handleTeleportToLandmark = (lm: Landmark) => {
    setVehicleState((prev) => ({
      ...prev,
      x: lm.position[0],
      z: lm.position[2] + 25,
      speed: 0,
      rotation: 0,
    }));
    setAvatarState((prev) => ({
      ...prev,
      x: lm.position[0] + 2,
      z: lm.position[2] + 28,
      speed: 0,
    }));
    setSelectedLandmark(lm);
    showToast(`📍 Teleported to ${lm.name}!`, 'info');
  };

  const handleTrackArtifact = (art: CollectibleArtifact) => {
    setVehicleState((prev) => ({
      ...prev,
      x: art.position[0] - 8,
      z: art.position[2] + 8,
      speed: 0,
    }));
    showToast(`🔍 Tracking coordinates for ${art.name}!`, 'info');
  };

  const handleJumpToDriver = (x: number, z: number) => {
    setVehicleState((prev) => ({
      ...prev,
      x: x + 8,
      z: z + 8,
      speed: 0,
    }));
    setActiveTab('gameplay');
    showToast('🚀 Jumped to convoy coordinates!', 'info');
  };

  // Debounced autosave of durable progression state
  useGameSave({
    playerXP,
    playerCoins,
    uncollectedRent,
    unlockedModels,
    vehicleModel,
    customization,
    graphicsQuality,
    weather,
    cameraMode,
    completedMissionIds: missions.filter((m) => m.completed).map((m) => m.id),
    collectedArtifactIds: artifacts.filter((a) => a.collected).map((a) => a.id),
    ownedPropertyIds: properties.filter((p) => p.owned).map((p) => p.id),
  });

  return (
    <div className="min-h-screen bg-[#050e08] text-[#eaf5ee] flex flex-col font-body selection:bg-[#22c55e] selection:text-black">
      {/* BRANDED LOADING SCREEN (Part D) */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#050e08] flex flex-col items-center justify-center p-6 text-center animate-out fade-out duration-300">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <UyoverseLogo variant="badge" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-[#9db8a8]">
                <span>INITIALIZING ENGINE</span>
                <span className="text-[#22c55e] font-bold">{loadingProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#22c55e] to-[#38bdf8] rounded-full transition-all duration-200"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-[#9db8a8] font-mono italic animate-pulse">
              {loadingTips[currentTipIndex]}
            </p>
          </div>
        </div>
      )}

      {/* COMPACT PRIMARY TOP BAR (Part B item 1) */}
      <header className="sticky top-0 z-40 bg-[#0a1a10]/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          onClick={() => setActiveTab('gameplay')}
        >
          <UyoverseLogo variant="badge" />
        </div>

        {/* Center Primary Nav Tabs */}
        <nav className="hidden md:flex items-center rounded-full bg-black/40 border border-white/10 p-1 gap-1">
          <button
            onClick={() => setActiveTab('gameplay')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-all cursor-pointer ${
              activeTab === 'gameplay'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            3D Game
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Multiplayer Shard
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4" />
            City Guide
          </button>
        </nav>

        {/* Right Action Controls: Currency, XP/Rank, Quiet PWA, Fullscreen, Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* In-Game Economy Balance with Count-Up */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-[#fbbf24] font-mono text-xs font-bold tabular-nums shadow-sm">
            <Coins className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>₦{animatedCoins.toLocaleString()}</span>
          </div>

          {/* Driver XP & Actual Rank Chip (Part B item 7) */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 hover:bg-white/5 border border-white/10 text-xs transition-all cursor-pointer group shadow-sm"
            title="View Global Uyo Legends Leaderboard & Your Rank"
            aria-label="Open Uyo Legends Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span className="font-display font-bold text-white text-[11px] truncate max-w-[90px]">
              {tierDetails.label}
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] text-[#9db8a8]">
              <span className="tabular-nums">{animatedXP}</span>
              <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#22c55e] rounded-full"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Quiet Outlined PWA Install Button (Part B item 1) */}
          <PWAInstallButton />

          {/* Fullscreen Toggle (44x44 target, tooltip, aria-label) */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#22c55e]" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Game Settings (44x44 target, tooltip, aria-label) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
            title="Game Settings"
            aria-label="Game Settings"
          >
            <Settings className="w-4 h-4 text-[#22c55e]" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex bg-[#0a1a10] border-b border-white/10 px-3 py-1.5 gap-2 text-xs font-display justify-around">
        <button
          onClick={() => setActiveTab('gameplay')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-1 justify-center transition-all ${
            activeTab === 'gameplay' ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-300'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Game
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-1 justify-center transition-all ${
            activeTab === 'community' ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Lobby
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-1 justify-center transition-all ${
            activeTab === 'guide' ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Guide
        </button>
      </div>

      {/* Floating In-Game Toast Notifications with aria-live */}
      <div
        className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl backdrop-blur-lg border shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-[#0a1a10]/95 border-[#22c55e] text-white'
                : toast.type === 'warning'
                ? 'bg-[#1a0f08]/95 border-[#ff6a1a] text-white'
                : 'bg-[#08151c]/95 border-sky-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-[#ff6a1a] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <p className="text-xs font-medium leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === 'gameplay' && (
          <div className="flex-1 flex flex-col relative min-h-[calc(100vh-65px)]">
            {/* Playable 3D Canvas with HUD */}
            <div className="relative flex-1 w-full min-h-[520px]">
              <GameCanvas
                weather={weather}
                cameraMode={cameraMode}
                playerMode={playerMode}
                vehicleModel={vehicleModel}
                customization={customization}
                activeMission={activeMission}
                artifacts={artifacts}
                onMissionComplete={handleMissionComplete}
                onLandmarkSelect={setSelectedLandmark}
                onVehicleUpdate={setVehicleState}
                onAvatarUpdate={setAvatarState}
                onCameraModeChange={setCameraMode}
                onPlayerModeChange={setPlayerMode}
                onCollectArtifact={handleCollectArtifact}
              />
              <GameHUD
                vehicleState={vehicleState}
                avatarState={avatarState}
                playerMode={playerMode}
                weather={weather}
                cameraMode={cameraMode}
                activeMission={activeMission}
                missions={missions}
                onSelectMission={setActiveMission}
                selectedLandmark={selectedLandmark}
                artifacts={artifacts}
                onWeatherChange={setWeather}
                onCameraChange={setCameraMode}
                onPlayerModeChange={setPlayerMode}
                onOpenGarage={() => setIsGarageOpen(true)}
                onOpenDailyRewards={() => setIsDailyRewardOpen(true)}
                hasDailyRewardReady={dailyRewardStatus.canClaim}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onOpenQuests={() => setIsQuestsOpen(true)}
                onOpenShootout={() => setIsShootoutOpen(true)}
                onOpenObservatory={() => setIsObservatoryOpen(true)}
                onOpenFoodKiosk={() => setIsFoodKioskOpen(true)}
                onOpenRealEstate={() => setIsRealEstateOpen(true)}
                onOpenPhotoMode={() => setIsPhotoModeOpen(true)}
                onCloseLandmark={() => setSelectedLandmark(null)}
                onTeleportToLandmark={handleTeleportToLandmark}
              />
            </div>

            {/* Quick Jump Strip: Landmark chips horizontally scrollable with edge fades (Part B item 6) */}
            <div className="bg-[#0a1a10] border-t border-white/10 p-2.5 sm:p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full py-0.5 no-scrollbar mask-fade-edges">
                <span className="text-[10px] font-display font-bold uppercase text-[#22c55e] tracking-wider flex items-center gap-1 whitespace-nowrap mr-1 shrink-0">
                  <Navigation className="w-3 h-3" /> Quick Jump:
                </span>
                {UYO_LANDMARKS.map((lm) => {
                  const isActive = selectedLandmark?.id === lm.id;
                  return (
                    <button
                      key={lm.id}
                      onClick={() => handleTeleportToLandmark(lm)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-display transition-all whitespace-nowrap cursor-pointer shrink-0 truncate max-w-[170px] ${
                        isActive
                          ? 'bg-[#22c55e] text-black font-bold border-[#22c55e] shadow-sm'
                          : 'bg-black/40 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white'
                      }`}
                      title={lm.name}
                    >
                      {lm.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
            <CommunityLobbyView
              playerXP={playerXP}
              playerCoins={playerCoins}
              onJumpToDriver={handleJumpToDriver}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
            <CityGuideView
              onTeleportToLandmark={handleTeleportToLandmark}
              onStartPlaying={() => setActiveTab('gameplay')}
            />
          </div>
        )}
      </main>

      {/* Global Offline PWA Indicator */}
      <OfflineIndicator />

      {/* Production Game Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        graphicsQuality={graphicsQuality}
        celebrationMode={celebrationMode}
        onSetGraphicsQuality={setGraphicsQuality}
        onSetCelebrationMode={handleSetCelebrationMode}
        onResetVehicle={handleResetVehicle}
        onResetProgress={handleResetProgress}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Modals Suite */}
      <GarageModal
        isOpen={isGarageOpen}
        currentModel={vehicleModel}
        customization={customization}
        playerCoins={playerCoins}
        unlockedModels={unlockedModels}
        unlockedDecals={unlockedDecals}
        vehicleHealth={vehicleState.health}
        onSelectModel={setVehicleModel}
        onUpdateCustomization={setCustomization}
        onUnlockVehicle={handleUnlockVehicle}
        onUpgradeEngine={handleUpgradeEngine}
        onRepairVehicle={handleRepairVehicle}
        onOpenDailyRewards={() => {
          setIsGarageOpen(false);
          setIsDailyRewardOpen(true);
        }}
        onClose={() => setIsGarageOpen(false)}
      />

      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        status={dailyRewardStatus}
        playerCoins={playerCoins}
        onClaimSuccess={handleClaimDailyReward}
        onOpenGarage={() => {
          setIsDailyRewardOpen(false);
          setIsGarageOpen(true);
        }}
        onClose={() => setIsDailyRewardOpen(false)}
      />

      <QuestsModal
        isOpen={isQuestsOpen}
        artifacts={artifacts}
        onTrackArtifact={handleTrackArtifact}
        onClose={() => setIsQuestsOpen(false)}
      />

      <PenaltyShootoutModal
        isOpen={isShootoutOpen}
        onWinReward={handleWinShootout}
        onClose={() => setIsShootoutOpen(false)}
      />

      <DakkadaObservatoryModal
        isOpen={isObservatoryOpen}
        artifacts={artifacts}
        properties={properties}
        unlockedModels={unlockedModels}
        onClose={() => setIsObservatoryOpen(false)}
      />

      <FoodKioskModal
        isOpen={isFoodKioskOpen}
        playerCoins={playerCoins}
        onEatFood={handleEatFood}
        onClose={() => setIsFoodKioskOpen(false)}
      />

      <RealEstateModal
        isOpen={isRealEstateOpen}
        properties={properties}
        playerCoins={playerCoins}
        uncollectedRent={uncollectedRent}
        onBuyProperty={handleBuyProperty}
        onCollectRent={handleCollectRent}
        onClose={() => setIsRealEstateOpen(false)}
      />

      <PhotoModeModal
        isOpen={isPhotoModeOpen}
        vehicleState={vehicleState}
        onClose={() => setIsPhotoModeOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        playerXP={playerXP}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
