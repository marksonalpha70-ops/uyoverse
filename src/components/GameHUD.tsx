import React, { useState } from 'react';
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
  Eye,
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
} from 'lucide-react';

interface GameHUDProps {
  vehicleState: VehicleState;
  avatarState: AvatarState;
  playerMode: PlayerMode;
  weather: WeatherType;
  cameraMode: CameraMode;
  activeMission: Mission | null;
  selectedLandmark: Landmark | null;
  artifacts: CollectibleArtifact[];
  onWeatherChange: (w: WeatherType) => void;
  onCameraChange: (c: CameraMode) => void;
  onPlayerModeChange: (m: PlayerMode) => void;
  onOpenGarage: () => void;
  onOpenQuests: () => void;
  onOpenShootout: () => void;
  onOpenObservatory: () => void;
  onOpenFoodKiosk: () => void;
  onOpenRealEstate: () => void;
  onOpenPhotoMode: () => void;
  onCloseLandmark: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  vehicleState,
  avatarState,
  playerMode,
  weather,
  cameraMode,
  activeMission,
  selectedLandmark,
  artifacts,
  onWeatherChange,
  onCameraChange,
  onPlayerModeChange,
  onOpenGarage,
  onOpenQuests,
  onOpenShootout,
  onOpenObservatory,
  onOpenFoodKiosk,
  onOpenRealEstate,
  onOpenPhotoMode,
  onCloseLandmark,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuteActive());
  const [isRadioOn, setIsRadioOn] = useState(soundEngine.isRadioOn());
  const [currentStation, setCurrentStation] = useState<RadioStation>('uyo_fm');
  const [stationInfo, setStationInfo] = useState(soundEngine.getStationInfo());

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleRadio = () => {
    const radioPlaying = soundEngine.toggleRadio();
    setIsRadioOn(radioPlaying);
    setStationInfo(soundEngine.getStationInfo());
  };

  const handleStationCycle = () => {
    const stations: RadioStation[] = ['uyo_fm', 'dakkada_pulse', 'heritage_fm'];
    const nextIdx = (stations.indexOf(currentStation) + 1) % stations.length;
    const nextStation = stations[nextIdx];
    setCurrentStation(nextStation);
    soundEngine.setStation(nextStation);
    setStationInfo(soundEngine.getStationInfo());
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

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Bar: Weather, Camera, Drive/Walk Toggle, Quick Hotspots, Radio */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
        {/* Left: Weather and Time selector */}
        <div className="pointer-events-auto flex items-center bg-[#061109]/85 backdrop-blur-md border border-[#1fc16b]/30 rounded-2xl p-1 shadow-xl gap-1">
          <button
            onClick={() => onWeatherChange('clear')}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              weather === 'clear'
                ? 'bg-[#1fc16b] text-black font-semibold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Sunny Noon"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Midday</span>
          </button>
          <button
            onClick={() => onWeatherChange('golden_hour')}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              weather === 'golden_hour'
                ? 'bg-[#f26522] text-white font-semibold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Sunset Golden Hour"
          >
            <Sun className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">Sunset</span>
          </button>
          <button
            onClick={() => onWeatherChange('night_neon')}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              weather === 'night_neon'
                ? 'bg-[#38bdf8] text-black font-semibold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Neon Night"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Night</span>
          </button>
          <button
            onClick={() => onWeatherChange('tropical_rain')}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              weather === 'tropical_rain'
                ? 'bg-[#60a5fa] text-black font-semibold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Tropical Rainstorm"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rain</span>
          </button>
          <button
            onClick={() => onWeatherChange('harmattan')}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              weather === 'harmattan'
                ? 'bg-[#d97706] text-white font-semibold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Harmattan Haze"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Haze</span>
          </button>
        </div>

        {/* Center: Drive/Walk Toggle & Hotspots */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => onPlayerModeChange(playerMode === 'driving' ? 'walking' : 'driving')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1.5 border shadow-xl transition-all ${
              playerMode === 'walking'
                ? 'bg-[#1fc16b] text-black border-[#1fc16b]'
                : 'bg-[#06140b]/90 text-white border-[#1fc16b]/40 hover:bg-[#1fc16b]/20'
            }`}
            title="Press 'E' to exit/enter vehicle"
          >
            {playerMode === 'walking' ? (
              <>
                <Car className="w-3.5 h-3.5" />
                <span>Drive (E)</span>
              </>
            ) : (
              <>
                <Footprints className="w-3.5 h-3.5 text-[#1fc16b]" />
                <span>Walk (E)</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenGarage}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-white border border-[#f26522]/50 hover:bg-[#f26522]/20 shadow-xl transition-all"
            title="Tuning Garage"
          >
            <Wrench className="w-3.5 h-3.5 text-[#f26522]" />
            <span className="hidden sm:inline">Garage</span>
          </button>

          {/* Interactive Hotspot Buttons */}
          <button
            onClick={onOpenShootout}
            className="px-2.5 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20 shadow-xl transition-all"
            title="Nest of Champions Shootout"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Shootout</span>
          </button>

          <button
            onClick={onOpenObservatory}
            className="px-2.5 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-sky-300 border border-sky-500/40 hover:bg-sky-500/20 shadow-xl transition-all"
            title="Dakkada Sky Observatory"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Deck</span>
          </button>

          <button
            onClick={onOpenFoodKiosk}
            className="px-2.5 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-xl transition-all"
            title="Akwa Ibom Food Kiosk"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Food</span>
          </button>

          <button
            onClick={onOpenRealEstate}
            className="px-2.5 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-purple-300 border border-purple-500/40 hover:bg-purple-500/20 shadow-xl transition-all"
            title="Property Deeds"
          >
            <LandmarkIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Estate</span>
          </button>

          <button
            onClick={onOpenPhotoMode}
            className="px-2.5 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-white border border-white/20 hover:bg-white/10 shadow-xl transition-all"
            title="Cinematic Photo Mode"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            <span className="hidden md:inline">Photo</span>
          </button>

          <button
            onClick={onOpenQuests}
            className="px-2.5 py-1.5 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-1 bg-[#06140b]/90 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-xl transition-all"
            title="Cultural Relics"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{collectedCount}/{artifacts.length}</span>
          </button>
        </div>

        {/* Right: Audio and Radio */}
        <div className="pointer-events-auto flex items-center bg-[#061109]/85 backdrop-blur-md border border-[#1fc16b]/30 rounded-2xl p-1 shadow-xl gap-1">
          <button
            onClick={handleToggleRadio}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isRadioOn
                ? 'bg-gradient-to-r from-[#f26522] to-[#1fc16b] text-white font-bold animate-pulse'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Afrobeats Radio"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRadioOn ? 'Radio ON' : 'Radio'}</span>
          </button>
          {isRadioOn && (
            <button
              onClick={handleStationCycle}
              className="px-2 py-1 rounded-xl text-[10px] font-mono bg-black/60 text-[#1fc16b] hover:bg-white/10"
              title="Change Station"
            >
              Tune ⟳
            </button>
          )}
          <button
            onClick={handleToggleMute}
            className="p-1 sm:p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#1fc16b]" />}
          </button>
        </div>
      </div>

      {/* Radio Station Now Playing Bar */}
      {isRadioOn && (
        <div className="pointer-events-auto self-center bg-black/75 backdrop-blur-md border border-[#1fc16b]/40 rounded-xl px-3 py-1 text-[11px] flex items-center gap-2 shadow-lg mt-1">
          <span className="w-2 h-2 rounded-full bg-[#1fc16b] animate-ping" />
          <span className="font-orbitron font-bold text-white">{stationInfo.name}:</span>
          <span className="text-[#f26522] truncate max-w-xs">{stationInfo.currentTrack}</span>
        </div>
      )}

      {/* Selected Landmark Drawer */}
      {selectedLandmark && (
        <div className="pointer-events-auto self-center max-w-md w-full bg-[#07170d]/95 backdrop-blur-lg border border-[#1fc16b] rounded-2xl p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1fc16b]/20 text-[#1fc16b] border border-[#1fc16b]/40">
                {selectedLandmark.tag}
              </span>
              <h3 className="font-orbitron font-bold text-white text-lg mt-1">{selectedLandmark.name}</h3>
            </div>
            <button
              onClick={onCloseLandmark}
              className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed mb-2">{selectedLandmark.desc}</p>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#f26522] font-medium">
            💡 {selectedLandmark.historicalNote}
          </div>
        </div>
      )}

      {/* Bottom Bar: Telemetry, Speedometer / Walker Stats, Radar */}
      <div className="flex items-end justify-between gap-3 sm:gap-4 w-full">
        {/* Speedometer, Durability & Nitro Telemetry */}
        <div className="pointer-events-auto bg-[#061109]/90 backdrop-blur-md border border-[#1fc16b]/40 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 min-w-[210px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-space tracking-widest text-[#1fc16b]/80 font-bold">
                {playerMode === 'walking' ? 'PEDESTRIAN' : vehicleState.model.toUpperCase()}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {playerMode === 'walking' ? avatarState.speed : vehicleState.speed}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-space">KM/H</span>
              </div>
            </div>
            {/* Speed circular arc */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="22" cy="22" r="16" fill="none" stroke="#132a1c" strokeWidth="3.5" />
                <circle
                  cx="22"
                  cy="22"
                  r="16"
                  fill="none"
                  stroke={vehicleState.speed > 80 ? '#f26522' : '#1fc16b'}
                  strokeWidth="3.5"
                  strokeDasharray={100}
                  strokeDashoffset={100 - (Math.min(130, vehicleState.speed) / 130) * 100}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>
              <Compass className="w-3.5 h-3.5 text-slate-400 absolute" />
            </div>
          </div>

          {/* Durability / Health Bar */}
          <div className="space-y-1 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> CHASSIS DURABILITY
              </span>
              <span className="font-mono text-white">{vehicleState.health}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  vehicleState.health < 40 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                }`}
                style={{ width: `${vehicleState.health}%` }}
              />
            </div>
          </div>

          {/* Nitro gauge (driving) */}
          {playerMode === 'driving' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> NITRO BOOST (SHIFT)
                </span>
                <span className="font-mono text-white">{vehicleState.nitroRemaining}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    vehicleState.isNitroActive
                      ? 'bg-gradient-to-r from-sky-400 to-[#f26522] animate-pulse'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${vehicleState.nitroRemaining}%` }}
                />
              </div>
            </div>
          )}

          {playerMode === 'walking' && (
            <div className="text-[10px] text-slate-300 flex items-center gap-2 border-t border-white/10 pt-1">
              <span>Shift: Sprint</span>
              <span>•</span>
              <span>Space: Jump</span>
            </div>
          )}
        </div>

        {/* Center: Mission Card */}
        {activeMission && (
          <div className="pointer-events-auto hidden sm:flex flex-col max-w-xs bg-[#061109]/90 backdrop-blur-md border border-[#f26522]/50 rounded-2xl p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-[#f26522] tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f26522] animate-ping" />
                OBJECTIVE ({activeMission.type.toUpperCase()})
              </span>
              <span className="text-[10px] font-bold text-[#1fc16b] font-mono">
                +₦{activeMission.rewardCoins}
              </span>
            </div>
            <h4 className="font-orbitron font-bold text-white text-xs truncate">{activeMission.title}</h4>
            <p className="text-slate-300 text-[11px] leading-tight line-clamp-2 mt-0.5">{activeMission.brief}</p>
          </div>
        )}

        {/* Right: Circular Minimap Radar */}
        <div className="pointer-events-auto relative w-[130px] h-[130px] rounded-full bg-[#050e08]/90 border-2 border-[#1fc16b]/60 shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center">
          <div className="absolute inset-2 rounded-full border border-[#1fc16b]/20" />
          <div className="absolute inset-8 rounded-full border border-[#1fc16b]/20" />
          <div className="absolute w-full h-[1px] bg-[#1fc16b]/20" />
          <div className="absolute h-full w-[1px] bg-[#1fc16b]/20" />

          {/* Sweeping scanline */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(31, 193, 107, 0.25) 360deg)',
              animation: 'spin 4s linear infinite',
            }}
          />

          {/* Ibom Plaza center node */}
          <div
            className="absolute w-2 h-2 rounded-full bg-[#1fc16b] ring-2 ring-[#1fc16b]/40"
            style={{ left: radarCenterX - 4, top: radarCenterY - 4 }}
            title="Ibom Plaza (Center)"
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
                    ? 'w-3 h-3 bg-[#f26522] ring-4 ring-[#f26522]/40 animate-bounce'
                    : 'w-1.5 h-1.5 bg-sky-400'
                }`}
                style={{ left: lx - (isTarget ? 6 : 3), top: ly - (isTarget ? 6 : 3) }}
                title={lm.name}
              />
            );
          })}

          {/* Player pointer */}
          <div
            className="absolute w-3.5 h-3.5 text-[#f26522] drop-shadow-md z-10"
            style={{
              left: Math.min(radarSize - 10, Math.max(10, playerRadarX - 7)),
              top: Math.min(radarSize - 10, Math.max(10, playerRadarY - 7)),
              transform: `rotate(${currentRot}rad)`,
            }}
          >
            ▲
          </div>

          <span className="absolute bottom-1 text-[8px] font-space text-slate-400 uppercase font-semibold">
            RADAR
          </span>
        </div>
      </div>
    </div>
  );
};
