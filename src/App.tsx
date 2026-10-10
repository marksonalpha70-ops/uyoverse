/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { getDailyRewardStatus, getUnlockedDecalIds, getDecalById } from './utils/dailyReward';
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
} from 'lucide-react';

type NavTab = 'gameplay' | 'community' | 'guide';

interface InGameToast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('gameplay');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('driving');
  const [vehicleModel, setVehicleModel] = useState<VehicleModel>('taxi');
  const [unlockedModels, setUnlockedModels] = useState<string[]>(['taxi', 'keke']);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('medium');
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

  const [customization, setCustomization] = useState<VehicleCustomization>({
    color: '#f26522',
    neonUnderglow: 'none',
    engineStage: 1,
    roofLight: true,
    decal: 'none',
  });

  const [missions, setMissions] = useState<Mission[]>(GAME_MISSIONS);
  const [activeMission, setActiveMission] = useState<Mission | null>(GAME_MISSIONS[0]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [artifacts, setArtifacts] = useState<CollectibleArtifact[]>(COLLECTIBLE_ARTIFACTS);
  const [properties, setProperties] = useState<VirtualProperty[]>(PROPERTIES_CATALOG);

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

  // Economy & progression
  const [playerXP, setPlayerXP] = useState(450);
  const [playerCoins, setPlayerCoins] = useState(6500);
  const [uncollectedRent, setUncollectedRent] = useState(350);

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

  // Toast notification helper
  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newToast: InGameToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev.slice(-2), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  };

  // Passive property income accumulator
  useEffect(() => {
    const timer = setInterval(() => {
      const ownedIncome = properties
        .filter((p) => p.owned)
        .reduce((sum, p) => sum + p.hourlyYieldCoins, 0);
      if (ownedIncome > 0) {
        setUncollectedRent((r) => r + Math.round(ownedIncome / 120));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [properties]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
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

  // Check for daily login reward on first launch each day
  useEffect(() => {
    const status = getDailyRewardStatus();
    setDailyRewardStatus(status);
    if (status.canClaim) {
      // Auto-open daily reward modal on first launch of the game each day
      setIsDailyRewardOpen(true);
      showToast(
        `🎁 Daily Check-in: Day ${status.currentStreakDay} reward ready! Extra Ibom Coins & exclusive decals available.`,
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
      `🎉 Daily Reward Claimed! +₦${rewardCoins.toLocaleString()} Ibom Coins & Unlocked "${decal ? decal.name : 'Exclusive'}" Decal!`,
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
      showToast(`Need ₦${(prop.costCoins - playerCoins).toLocaleString()} more Ibom Coins to acquire this title deed!`, 'warning');
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

  const handleTeleportToLandmark = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
    setActiveTab('gameplay');
    setVehicleState((prev) => ({
      ...prev,
      x: landmark.position[0],
      z: landmark.position[2] + 12,
      speed: 0,
    }));
    setAvatarState((prev) => ({
      ...prev,
      x: landmark.position[0] + 2,
      z: landmark.position[2] + 12,
    }));

    if (landmark.id === 'stadium') {
      setIsShootoutOpen(true);
    } else if (landmark.id === 'dakkada') {
      setIsObservatoryOpen(true);
    } else if (landmark.id === 'plaza') {
      setIsFoodKioskOpen(true);
    }
  };

  const handleTrackArtifact = (artifact: CollectibleArtifact) => {
    setIsQuestsOpen(false);
    setActiveTab('gameplay');
    setVehicleState((prev) => ({
      ...prev,
      x: artifact.position[0],
      z: artifact.position[2] + 12,
      speed: 0,
    }));
    setAvatarState((prev) => ({
      ...prev,
      x: artifact.position[0] + 2,
      z: artifact.position[2] + 12,
    }));
    showToast(`📍 Tracking waypoint set to ${artifact.name}`, 'info');
  };

  const handleJumpToDriver = (x: number, z: number) => {
    setActiveTab('gameplay');
    setVehicleState((prev) => ({
      ...prev,
      x,
      z: z + 8,
      speed: 0,
    }));
    showToast('🚀 Jumped to convoy coordinates!', 'info');
  };

  return (
    <div className="min-h-screen bg-[#040c07] text-white flex flex-col font-sans selection:bg-[#1fc16b] selection:text-black">
      {/* Top Production Game Bar */}
      <header className="sticky top-0 z-40 bg-[#06140b]/90 backdrop-blur-md border-b border-[#1fc16b]/30 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('gameplay')}>
          <UyoverseLogo variant="badge" />
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center bg-black/50 border border-white/10 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('gameplay')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all ${
              activeTab === 'gameplay'
                ? 'bg-[#1fc16b] text-black shadow-lg shadow-[#1fc16b]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            3D Game
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all ${
              activeTab === 'community'
                ? 'bg-[#1fc16b] text-black shadow-lg shadow-[#1fc16b]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Multiplayer Shard
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-[#1fc16b] text-black shadow-lg shadow-[#1fc16b]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4" />
            City Guide
          </button>
        </nav>

        {/* Right Action Controls: Economy, XP, Settings, Fullscreen, PWA */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Daily Reward Bonus Button */}
          <button
            onClick={() => setIsDailyRewardOpen(true)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-orbitron font-bold transition-all cursor-pointer ${
              dailyRewardStatus.canClaim
                ? 'bg-gradient-to-r from-amber-500/25 to-emerald-500/25 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 animate-pulse'
                : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Daily Uyo Login Bonus"
            aria-label="Open Daily Login Rewards"
          >
            <Gift className={`w-3.5 h-3.5 ${dailyRewardStatus.canClaim ? 'text-amber-400' : 'text-[#1fc16b]'}`} />
            <span className="hidden md:inline">Daily Bonus</span>
            {dailyRewardStatus.canClaim && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-black" />
            )}
          </button>

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* In-Game Economy Balance */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#092213] border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>₦{playerCoins.toLocaleString()}</span>
          </div>

          {/* Driver XP & Global Rank Button */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0e301d] hover:bg-[#144428] border border-[#1fc16b]/40 hover:border-[#1fc16b] text-xs transition-all cursor-pointer group shadow-sm"
            title="View Global Uyo Legends Leaderboard & Your Rank"
            aria-label="Open Uyo Legends Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-orbitron font-bold text-white">{playerXP} XP</span>
            <span className="text-[10px] text-amber-300 font-mono font-bold px-1 py-0.2 rounded bg-black/40 border border-amber-400/30">
              Rank
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#1fc16b]" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Game Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
            title="Game Settings"
            aria-label="Game Settings"
          >
            <Settings className="w-4 h-4 text-[#1fc16b]" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex bg-[#07190e] border-b border-white/10 px-3 py-1.5 gap-2 text-xs font-orbitron justify-around">
        <button
          onClick={() => setActiveTab('gameplay')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-1 justify-center transition-all ${
            activeTab === 'gameplay' ? 'bg-[#1fc16b] text-black font-bold' : 'text-slate-300'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Game
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-1 justify-center transition-all ${
            activeTab === 'community' ? 'bg-[#1fc16b] text-black font-bold' : 'text-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Lobby
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-1 justify-center transition-all ${
            activeTab === 'guide' ? 'bg-[#1fc16b] text-black font-bold' : 'text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Guide
        </button>
      </div>

      {/* Floating In-Game Toast Notifications */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl backdrop-blur-lg border shadow-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-[#082213]/95 border-[#1fc16b] text-white'
                : toast.type === 'warning'
                ? 'bg-[#291307]/95 border-[#f26522] text-white'
                : 'bg-[#06141c]/95 border-sky-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1fc16b] shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-[#f26522] shrink-0" />
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
              />
            </div>

            {/* Quick Strip: Landmark Jumps & Mission Objectives */}
            <div className="bg-[#06140b] border-t border-[#1fc16b]/30 p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-0.5">
                <span className="text-[10px] font-orbitron font-bold uppercase text-[#1fc16b] tracking-wider flex items-center gap-1 whitespace-nowrap mr-1">
                  <Navigation className="w-3 h-3" /> Quick Jump:
                </span>
                {UYO_LANDMARKS.slice(0, 6).map((lm) => (
                  <button
                    key={lm.id}
                    onClick={() => handleTeleportToLandmark(lm)}
                    className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#1fc16b]/20 border border-white/10 hover:border-[#1fc16b]/40 text-[11px] font-space text-slate-200 hover:text-white transition-all whitespace-nowrap"
                  >
                    {lm.name}
                  </button>
                ))}
              </div>

              {/* Missions quick selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-orbitron uppercase text-[#f26522] font-bold whitespace-nowrap">
                  Job:
                </span>
                <select
                  value={activeMission?.id || ''}
                  onChange={(e) => {
                    const found = missions.find((m) => m.id === e.target.value);
                    if (found) setActiveMission(found);
                  }}
                  className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#1fc16b]"
                >
                  {missions.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#06140b] text-white">
                      {m.title} {m.completed ? '✓ (Completed)' : `(+₦${m.rewardCoins})`}
                    </option>
                  ))}
                </select>
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
        onSelectModel={setVehicleModel}
        onUpdateCustomization={setCustomization}
        onUnlockVehicle={handleUnlockVehicle}
        onUpgradeEngine={handleUpgradeEngine}
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
