import React, { useState, useEffect } from 'react';
import {
  CameraMode,
  Landmark,
  Mission,
  VehicleState,
  WeatherType,
  PlayerMode,
  RadioStation,
  CollectibleArtifact,
  AvatarState,
} from '../types/game';
import { UYO_LANDMARKS } from '../data/gameData';
import { soundEngine } from '../utils/AudioSynthesizer';
import {
  Volume2,
  VolumeX,
  Radio,
  Compass,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Footprints,
  Car,
  Flame,
  Wrench,
  Sparkles,
  Camera,
  Trophy,
  Building2,
  Utensils,
  Landmark as LandmarkIcon,
  Shield,
  Gift,
  Disc3,
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  Target,
  Navigation,
} from 'lucide-react';

interface GameHUDProps {
  vehicleState: VehicleState;
  avatarState: AvatarState;
  playerMode: PlayerMode;
  weather: WeatherType;
  cameraMode: CameraMode;
  activeMission: Mission | null;
  missions?: Mission[];
  onSelectMission?: (m: Mission) => void;
  selectedLandmark: Landmark | null;
  artifacts: CollectibleArtifact[];
  onWeatherChange: (w: WeatherType) => void;
  onCameraChange: (c: CameraMode) => void;
  onPlayerModeChange: (m: PlayerMode) => void;
  onOpenGarage: () => void;
  onOpenDailyRewards?: () => void;
  hasDailyRewardReady?: boolean;
  onOpenLeaderboard?: () => void;
  onOpenQuests: () => void;
  onOpenShootout: () => void;
  onOpenObservatory: () => void;
  onOpenFoodKiosk: () => void;
  onOpenRealEstate: () => void;
  onOpenPhotoMode: () => void;
  onCloseLandmark: () => void;
  onTeleportToLandmark?: (lm: Landmark) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  vehicleState,
  avatarState,
  playerMode,
  weather,
  cameraMode,
  activeMission,
  missions = [],
  onSelectMission,
  selectedLandmark,
  artifacts,
  onWeatherChange,
  onCameraChange,
  onPlayerModeChange,
  onOpenGarage,
  onOpenDailyRewards,
  hasDailyRewardReady,
  onOpenLeaderboard,
  onOpenQuests,
  onOpenShootout,
  onOpenObservatory,
  onOpenFoodKiosk,
  onOpenRealEstate,
  onOpenPhotoMode,
  onCloseLandmark,
  onTeleportToLandmark,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuteActive());
  const [isRadioOn, setIsRadioOn] = useState(soundEngine.isRadioOn());
  const [currentStation, setCurrentStation] = useState<RadioStation>('uyo_fm');
  const [stationInfo, setStationInfo] = useState(soundEngine.getStationInfo());
  const [isRadioDrawerOpen, setIsRadioDrawerOpen] = useState(false);
  const [radioVolume, setRadioVolume] = useState(soundEngine.getRadioVolume());
  const [visualizerBars, setVisualizerBars] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
  const [djAnnouncement, setDjAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    const unsub = soundEngine.registerDJListener((msg) => {
      setDjAnnouncement(msg);
      const timer = setTimeout(() => {
        setDjAnnouncement((prev) => (prev === msg ? null : prev));
      }, 6500);
      return () => clearTimeout(timer);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isRadioOn || isMuted) {
      setVisualizerBars([0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05]);
      return;
    }
    const interval = setInterval(() => {
      setVisualizerBars([...soundEngine.getVisualizerData()]);
    }, 90);
    return () => clearInterval(interval);
  }, [isRadioOn, isMuted]);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleRadio = () => {
    const radioPlaying = soundEngine.toggleRadio();
    setIsRadioOn(radioPlaying);
    setStationInfo(soundEngine.getStationInfo());
  };

  const handleSelectStation = (station: RadioStation) => {
    setCurrentStation(station);
    soundEngine.setStation(station);
    setStationInfo(soundEngine.getStationInfo());
  };

  const handleStationCycle = () => {
    const stations: RadioStation[] = ['uyo_fm', 'dakkada_pulse', 'heritage_fm', 'atlantic_wave'];
    const nextIdx = (stations.indexOf(currentStation) + 1) % stations.length;
    handleSelectStation(stations[nextIdx]);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setRadioVolume(vol);
    soundEngine.setRadioVolume(vol);
  };

  const radarScale = 0.35;
  const radarSize = 130;
  const radarCenterX = radarSize / 2;
  const radarCenterY = radarSize / 2;

  const currentX = playerMode === 'walking' ? avatarState.x : vehicleState.x;
  const currentZ = playerMode === 'walking' ? avatarState.z : vehicleState.z;
  const currentRot = playerMode === 'walking' ? avatarState.rotation : vehicleState.rotation;

  const playerRadarX = radarCenterX + currentX * radarScale * 0.55;
  const playerRadarY = radarCenterY + currentZ * radarScale * 0.55;

  const collectedCount = artifacts.filter((a) => a.collected).length;

  // Real-time distance to target landmark
  const targetLandmark = UYO_LANDMARKS.find((lm) => lm.id === activeMission?.targetLandmarkId);
  const distanceToTarget = targetLandmark
    ? Math.round(Math.hypot(currentX - targetLandmark.position[0], currentZ - targetLandmark.position[2]))
    : null;

  const displaySpeed = playerMode === 'walking' ? avatarState.speed : vehicleState.speed;
  const isSpeedHigh = displaySpeed > 80;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-2.5 sm:p-4 select-none">
      {/* SECONDARY ACTION ROW: Scrollable Tray with Fade-Edge Masks (Part B) */}
      <div className="w-full relative">
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar mask-fade-edges">
          {/* Time & Weather Grouped Selector */}
          <div className="flex items-center rounded-full bg-[#0a1a10]/85 backdrop-blur-md border border-white/10 p-1 shrink-0 gap-1">
            <span className="text-[10px] font-mono text-[#9db8a8] px-1.5 uppercase font-semibold">Time</span>
            <button
              onClick={() => onWeatherChange('clear')}
              className={`px-2.5 py-1 rounded-full text-xs font-display transition-all cursor-pointer ${
                weather === 'clear'
                  ? 'bg-[#22c55e] text-black font-bold shadow-sm'
                  : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
              }`}
              title="Midday Noon"
              aria-label="Midday Weather"
            >
              <Sun className="w-3.5 h-3.5 inline mr-1" />
              Midday
            </button>
            <button
              onClick={() => onWeatherChange('golden_hour')}
              className={`px-2.5 py-1 rounded-full text-xs font-display transition-all cursor-pointer ${
                weather === 'golden_hour'
                  ? 'bg-[#22c55e] text-black font-bold shadow-sm'
                  : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
              }`}
              title="Sunset Golden Hour"
              aria-label="Sunset Weather"
            >
              Sunset
            </button>
            <button
              onClick={() => onWeatherChange('night_neon')}
              className={`px-2.5 py-1 rounded-full text-xs font-display transition-all cursor-pointer ${
                weather === 'night_neon'
                  ? 'bg-[#22c55e] text-black font-bold shadow-sm'
                  : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
              }`}
              title="Neon Night"
              aria-label="Night Weather"
            >
              <Moon className="w-3.5 h-3.5 inline mr-1" />
              Night
            </button>

            {/* Subtle Group Divider */}
            <div className="w-[1px] h-4 bg-white/15 mx-0.5" />
            <span className="text-[10px] font-mono text-[#9db8a8] px-1.5 uppercase font-semibold">Sky</span>

            <button
              onClick={() => onWeatherChange('tropical_rain')}
              className={`px-2.5 py-1 rounded-full text-xs font-display transition-all cursor-pointer ${
                weather === 'tropical_rain'
                  ? 'bg-[#22c55e] text-black font-bold shadow-sm'
                  : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
              }`}
              title="Tropical Rain"
              aria-label="Tropical Rain Weather"
            >
              <CloudRain className="w-3.5 h-3.5 inline mr-1" />
              Rain
            </button>
            <button
              onClick={() => onWeatherChange('harmattan')}
              className={`px-2.5 py-1 rounded-full text-xs font-display transition-all cursor-pointer ${
                weather === 'harmattan'
                  ? 'bg-[#22c55e] text-black font-bold shadow-sm'
                  : 'text-[#9db8a8] hover:text-white hover:bg-white/5'
              }`}
              title="Harmattan Haze"
              aria-label="Harmattan Weather"
            >
              <Wind className="w-3.5 h-3.5 inline mr-1" />
              Haze
            </button>
          </div>

          {/* Action Pills: Clean neutral outline, active is colored (Part A & B) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Walk / Drive Mode Toggle */}
            <button
              onClick={() => onPlayerModeChange(playerMode === 'driving' ? 'walking' : 'driving')}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                playerMode === 'walking'
                  ? 'bg-[#22c55e] text-black border-[#22c55e] font-bold shadow-sm'
                  : 'bg-[#0a1a10]/80 border-white/10 text-slate-200 hover:border-white/20 hover:text-white'
              }`}
              title="Toggle Driving / Walking Mode (HotKey: E)"
              aria-label="Toggle Walk Drive Mode"
            >
              {playerMode === 'walking' ? (
                <>
                  <Car className="w-3.5 h-3.5" />
                  <span>Drive <span className="hidden md:inline">(E)</span></span>
                </>
              ) : (
                <>
                  <Footprints className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Walk <span className="hidden md:inline">(E)</span></span>
                </>
              )}
            </button>

            {/* Garage */}
            <button
              onClick={onOpenGarage}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Vehicle Customization Garage & Repairs"
              aria-label="Open Garage"
            >
              <Wrench className="w-3.5 h-3.5 text-[#ff6a1a]" />
              <span>Garage</span>
            </button>

            {/* Legends */}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
                title="Uyo Legends Leaderboard & Lore"
                aria-label="Open Uyo Legends"
              >
                <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>Legends</span>
              </button>
            )}

            {/* Shootout */}
            <button
              onClick={onOpenShootout}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Nest of Champions Penalty Shootout"
              aria-label="Open Penalty Shootout"
            >
              <Target className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Shootout</span>
            </button>

            {/* Deck */}
            <button
              onClick={onOpenObservatory}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Dakkada 21st Floor Deck & Relic Cards"
              aria-label="Open Sky Deck"
            >
              <Building2 className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Deck</span>
            </button>

            {/* Food */}
            <button
              onClick={onOpenFoodKiosk}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Akwa Ibom Food Kiosk"
              aria-label="Open Food Kiosk"
            >
              <Utensils className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>Food</span>
            </button>

            {/* Estate */}
            <button
              onClick={onOpenRealEstate}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Real Estate Property Deeds"
              aria-label="Open Real Estate"
            >
              <LandmarkIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Estate</span>
            </button>

            {/* Photo */}
            <button
              onClick={onOpenPhotoMode}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Cinematic Photo Mode"
              aria-label="Open Photo Mode"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
              <span>Photo</span>
            </button>

            {/* 0/5 Relics Counter */}
            <button
              onClick={onOpenQuests}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 bg-[#0a1a10]/80 border border-white/10 text-slate-200 hover:border-white/20 hover:text-white transition-all cursor-pointer"
              title="Cultural Relics Challenge: Discover all 5"
              aria-label="Open Relics Challenge"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>Relics {collectedCount}/{artifacts.length}</span>
            </button>

            {/* Radio Pill */}
            <div className="flex items-center rounded-full bg-[#0a1a10]/85 border border-white/10 p-0.5 gap-0.5">
              <button
                onClick={handleToggleRadio}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isRadioOn
                    ? 'bg-[#22c55e] text-black font-bold shadow-sm'
                    : 'text-[#9db8a8] hover:text-white'
                }`}
                title="Toggle Afrobeats Radio"
                aria-label="Toggle Radio"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isRadioOn ? 'Radio ON' : 'Radio'}</span>
              </button>

              {isRadioOn && (
                <button
                  onClick={() => setIsRadioDrawerOpen(!isRadioDrawerOpen)}
                  className="p-1.5 rounded-full text-[#22c55e] hover:bg-white/10 transition-colors"
                  title="Open Radio Tuner"
                  aria-label="Open Radio Tuner"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={handleToggleMute}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Mute / Unmute Audio"
                aria-label="Toggle Mute"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#22c55e]" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* On-Air DJ Announcement Broadcast Banner */}
      {djAnnouncement && (
        <div className="pointer-events-auto self-center bg-[#0a1a10]/95 backdrop-blur-md border border-[#22c55e]/50 rounded-2xl px-4 py-2 text-xs text-white shadow-2xl flex items-center gap-2.5 max-w-lg w-full animate-in fade-in slide-in-from-top-3 mt-1 z-20">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff6a1a] animate-ping shrink-0" />
          <span className="font-display font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 shrink-0">
            ON AIR
          </span>
          <p className="text-slate-100 font-medium text-xs leading-tight line-clamp-2">
            {djAnnouncement}
          </p>
        </div>
      )}

      {/* Radio Tuner Drawer (Expandable) */}
      {isRadioOn && isRadioDrawerOpen && (
        <div className="pointer-events-auto self-center bg-[#0a1a10]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl mt-1.5 max-w-xl w-full animate-in fade-in zoom-in-95 z-30">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-[#22c55e] animate-spin" />
              <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                Uyo FM Radio Tuner
              </h4>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-[#9db8a8] font-mono">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={radioVolume}
                onChange={handleVolumeChange}
                className="w-20 accent-[#22c55e] cursor-pointer"
                aria-label="Radio Volume Slider"
              />
              <button
                onClick={() => setIsRadioDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {soundEngine.getAllStations().map(({ id, meta }) => {
              const isSelected = currentStation === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSelectStation(id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#22c55e]/20 border-[#22c55e] text-white shadow-md ring-1 ring-[#22c55e]'
                      : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-xs text-white">{meta.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white/10 text-slate-200">
                      {meta.frequency}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#9db8a8] truncate">{meta.genre}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Landmark Drawer */}
      {selectedLandmark && (
        <div className="pointer-events-auto self-center max-w-md w-full bg-[#0a1a10]/95 backdrop-blur-lg border border-[#22c55e]/50 rounded-2xl p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40">
                {selectedLandmark.tag}
              </span>
              <h3 className="font-display font-bold text-white text-lg mt-1">{selectedLandmark.name}</h3>
            </div>
            <button
              onClick={onCloseLandmark}
              className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10"
              aria-label="Close landmark info"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed mb-2">{selectedLandmark.desc}</p>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#ff6a1a] font-medium">
            💡 {selectedLandmark.historicalNote}
          </div>
        </div>
      )}

      {/* BOTTOM HUD STRIP: Speedometer, Objective Card with JOB Selector, Radar (Part B) */}
      <div className="flex items-end justify-between gap-3 sm:gap-4 w-full">
        {/* 1. SPEEDOMETER & TELEMETRY (Speed largest element, 44-52px, tabular-nums) */}
        <div className="pointer-events-auto bg-[#0a1a10]/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-2xl flex flex-col gap-2 min-w-[210px] sm:min-w-[230px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#22c55e] font-bold">
                {playerMode === 'walking' ? 'PEDESTRIAN' : vehicleState.model.toUpperCase()}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight tabular-nums">
                  {displaySpeed}
                </span>
                <span className="text-xs font-bold text-[#9db8a8] font-mono">KM/H</span>
              </div>
            </div>

            {/* Speed Circular Fill Gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke={isSpeedHigh ? '#ff6a1a' : '#22c55e'}
                  strokeWidth="4"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (Math.min(140, displaySpeed) / 140) * 113}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>
              <Compass className="w-4 h-4 text-[#9db8a8] absolute" />
            </div>
          </div>

          {/* Durability / Health Bar with Rounded Ends & Pulse under 25% */}
          <div className="space-y-1 pt-1.5 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#22c55e] font-bold flex items-center gap-1 font-mono">
                <Shield className="w-3 h-3" /> CHASSIS DURABILITY
              </span>
              <span className="font-mono text-white tabular-nums">{vehicleState.health}%</span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  vehicleState.health < 25
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-[#22c55e]'
                }`}
                style={{ width: `${vehicleState.health}%` }}
              />
            </div>
          </div>

          {/* Nitro Gauge with Gradient Fill & Pulse on Active */}
          {playerMode === 'driving' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#38bdf8] font-bold flex items-center gap-1 font-mono">
                  <Flame className="w-3 h-3" /> NITRO BOOST (SHIFT)
                </span>
                <span className="font-mono text-white tabular-nums">{vehicleState.nitroRemaining}%</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    vehicleState.isNitroActive
                      ? 'bg-gradient-to-r from-sky-400 to-[#ff6a1a] animate-pulse'
                      : 'bg-gradient-to-r from-sky-500 to-[#38bdf8]'
                  }`}
                  style={{ width: `${vehicleState.nitroRemaining}%` }}
                />
              </div>
            </div>
          )}

          {playerMode === 'walking' && (
            <div className="text-[10px] text-[#9db8a8] flex items-center gap-2 border-t border-white/10 pt-1 font-mono">
              <span>Shift: Sprint</span>
              <span>•</span>
              <span>Space: Jump</span>
            </div>
          )}
        </div>

        {/* 2. OBJECTIVE CARD WITH INTEGRATED JOB SELECTOR (Part B item 4) */}
        {activeMission && (
          <div className="pointer-events-auto hidden sm:flex flex-col max-w-sm w-full bg-[#0a1a10]/95 backdrop-blur-md border border-white/10 border-l-4 border-l-[#ff6a1a] rounded-2xl p-3.5 shadow-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-[#ff6a1a] tracking-wider flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#ff6a1a] animate-ping shrink-0" />
                OBJECTIVE ({activeMission.type.toUpperCase()})
              </span>
              <span className="text-xs font-bold text-[#fbbf24] font-mono tabular-nums">
                +₦{activeMission.rewardCoins.toLocaleString()}
              </span>
            </div>

            <div>
              <h4 className="font-display font-bold text-white text-xs sm:text-sm truncate">
                {activeMission.title}
              </h4>
              <p className="text-[#9db8a8] text-xs leading-snug line-clamp-2 mt-0.5">
                {activeMission.brief}
              </p>
            </div>

            {/* Distance to target and progress line */}
            {distanceToTarget !== null && (
              <div className="space-y-1 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] text-[#9db8a8] font-mono">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#ff6a1a]" /> Distance to Landmark:
                  </span>
                  <span className="text-white font-bold tabular-nums">{distanceToTarget} m</span>
                </div>
                <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff6a1a] rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, Math.min(100, 100 - (distanceToTarget / 600) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Integrated Job Dropdown matching the objective card */}
            {missions.length > 0 && onSelectMission && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-[#9db8a8] font-bold">Select:</span>
                <select
                  value={activeMission.id}
                  onChange={(e) => {
                    const m = missions.find((x) => x.id === e.target.value);
                    if (m) onSelectMission(m);
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-display focus:outline-none focus:border-[#22c55e] cursor-pointer"
                  aria-label="Select Current Objective Job"
                >
                  {missions.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#0a1a10] text-white">
                      {m.title} {m.completed ? '✓' : `(+₦${m.rewardCoins.toLocaleString()})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* 3. MINIMAP RADAR with Cardinal Marker (N), Faint Sweep, & Glow Ring (Part B item 5) */}
        <div className="pointer-events-auto relative w-[130px] h-[130px] rounded-full bg-[#050e08]/90 border border-white/15 ring-2 ring-[#22c55e]/30 shadow-[0_0_24px_rgba(34,197,94,0.15)] backdrop-blur-md overflow-hidden flex items-center justify-center shrink-0">
          <div className="absolute inset-2 rounded-full border border-[#22c55e]/15" />
          <div className="absolute inset-8 rounded-full border border-[#22c55e]/15" />
          <div className="absolute w-full h-[1px] bg-[#22c55e]/15" />
          <div className="absolute h-full w-[1px] bg-[#22c55e]/15" />

          {/* North Cardinal Marker */}
          <div className="absolute top-1 font-mono text-[9px] font-bold text-[#fbbf24] z-10">
            N
          </div>

          {/* Faint Sweeping Scanline */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34, 197, 94, 0.22) 360deg)',
              animation: 'spin 4s linear infinite',
            }}
          />

          {/* Ibom Plaza center node */}
          <div
            className="absolute w-2 h-2 rounded-full bg-[#22c55e] ring-2 ring-[#22c55e]/40"
            style={{ left: radarCenterX - 4, top: radarCenterY - 4 }}
            title="Ibom Plaza (City Center)"
          />

          {/* Landmark dots */}
          {UYO_LANDMARKS.map((lm) => {
            const lx = radarCenterX + lm.position[0] * radarScale * 0.55;
            const ly = radarCenterY + lm.position[2] * radarScale * 0.55;
            if (Math.hypot(lx - radarCenterX, ly - radarCenterY) > radarSize / 2 - 6) return null;
            const isTarget = activeMission && activeMission.targetLandmarkId === lm.id;
            return (
              <div
                key={lm.id}
                className={`absolute rounded-full transition-transform ${
                  isTarget
                    ? 'w-3 h-3 bg-[#ff6a1a] ring-4 ring-[#ff6a1a]/40 animate-bounce z-10'
                    : 'w-1.5 h-1.5 bg-sky-400'
                }`}
                style={{ left: lx - (isTarget ? 6 : 3), top: ly - (isTarget ? 6 : 3) }}
                title={lm.name}
              />
            );
          })}

          {/* Player pointer */}
          <div
            className="absolute w-3.5 h-3.5 text-[#ff6a1a] drop-shadow-md z-20"
            style={{
              left: Math.min(radarSize - 10, Math.max(10, playerRadarX - 7)),
              top: Math.min(radarSize - 10, Math.max(10, playerRadarY - 7)),
              transform: `rotate(${currentRot}rad)`,
            }}
          >
            ▲
          </div>

          <span className="absolute bottom-1 text-[8px] font-mono text-[#9db8a8] uppercase font-semibold">
            RADAR
          </span>
        </div>
      </div>
    </div>
  );
};
