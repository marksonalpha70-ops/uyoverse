import React, { useState } from 'react';
import { UYO_LANDMARKS, COLLECTIBLE_ARTIFACTS } from '../data/gameData';
import { Landmark } from '../types/game';
import {
  MapPin,
  Navigation,
  Compass,
  Sparkles,
  Trophy,
  Info,
  Car,
  Footprints,
  Radio,
  Camera,
  Layers,
  Flame,
  Search,
  Filter,
} from 'lucide-react';

interface CityGuideViewProps {
  onTeleportToLandmark: (landmark: Landmark) => void;
  onOpenLiveSimulation?: (landmarkId: string) => void;
  onStartPlaying: () => void;
}

export const CityGuideView: React.FC<CityGuideViewProps> = ({
  onTeleportToLandmark,
  onOpenLiveSimulation,
  onStartPlaying,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const categories = [
    'All',
    'Civic',
    'Sports',
    'Leisure',
    'Skyline',
    'Education',
    'Culture',
    'Commerce',
    'Healthcare',
    'Religious',
    'Nature',
    'Transport',
    'Residential',
  ];

  const filteredLandmarks = UYO_LANDMARKS.filter((lm) => {
    const matchesTag = selectedTag === 'All' || lm.tag === selectedTag;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      lm.name.toLowerCase().includes(q) ||
      lm.desc.toLowerCase().includes(q) ||
      lm.tag.toLowerCase().includes(q) ||
      lm.historicalNote.toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071d10] via-[#09351d] to-[#05130b] border border-[#1fc16b]/40 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1fc16b]/20 border border-[#1fc16b]/40 text-[#1fc16b] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#1fc16b]" />
            Official Tourism & City Guide • Akwa Ibom State, Nigeria
          </div>
          <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-white tracking-wide">
            WELCOME TO UYOVERSE
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Experience the cultural vibrancy, architectural landmarks, and lush landscapes of Uyo —
            the capital of Akwa Ibom State. Cruise through radial avenues, collect rare indigenous
            relics, invest in city properties, and taste famous local delicacies.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onStartPlaying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1fc16b] to-[#179a55] text-black font-orbitron font-bold text-sm shadow-lg shadow-[#1fc16b]/25 hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Car className="w-4 h-4" />
              Play in 3D Now
            </button>
            {onOpenLiveSimulation && (
              <button
                onClick={() => onOpenLiveSimulation('plaza')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-orbitron font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#1fc16b]" />
                Explore Live Simulation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Game Controls & How To Play Strip */}
      <div className="p-6 rounded-3xl bg-[#081b10] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-orbitron font-bold text-base">
          <Info className="w-5 h-5 text-[#1fc16b]" />
          <h3>How to Play & Controls Guide</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[#1fc16b] font-orbitron font-bold">
              <Car className="w-4 h-4" />
              <span>Drive Controls</span>
            </div>
            <p className="text-slate-300">
              <strong className="text-white">W / ↑</strong> Accelerate • <strong className="text-white">S / ↓</strong> Reverse/Brake • <strong className="text-white">A / D / ← / →</strong> Steer
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-orbitron font-bold">
              <Flame className="w-4 h-4" />
              <span>Nitro Boost</span>
            </div>
            <p className="text-slate-300">
              Hold <strong className="text-white">Shift</strong> for supercharged nitrous oxide acceleration and exhaust flames.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-orbitron font-bold">
              <Footprints className="w-4 h-4" />
              <span>Walk / Drive Switch</span>
            </div>
            <p className="text-slate-300">
              Press <strong className="text-white">E</strong> to exit your vehicle and explore Uyo on foot as a pedestrian.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[#f26522] font-orbitron font-bold">
              <Radio className="w-4 h-4" />
              <span>Camera & Radio</span>
            </div>
            <p className="text-slate-300">
              Press <strong className="text-white">C</strong> to cycle camera angles. Toggle Afrobeats radio in the top HUD.
            </p>
          </div>
        </div>
      </div>

      {/* Landmarks Explorer Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-orbitron font-bold text-xl text-white">Explore Uyo Landmarks & Districts</h3>
            <p className="text-xs text-slate-400">
              Interactive directory of authentic civic, cultural, educational, and commercial destinations across Uyo
            </p>
          </div>
          <span className="text-xs font-mono text-[#1fc16b] bg-[#1fc16b]/10 border border-[#1fc16b]/30 px-3.5 py-1.5 rounded-full shrink-0">
            {filteredLandmarks.length} of {UYO_LANDMARKS.length} Destinations
          </span>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search places by name, district, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#1fc16b]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mask-fade-edges">
            {categories.map((cat) => {
              const isCatActive = selectedTag === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedTag(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-display transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isCatActive
                      ? 'bg-[#1fc16b] text-black font-bold shadow-md shadow-[#1fc16b]/20'
                      : 'bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLandmarks.map((landmark) => (
            <div
              key={landmark.id}
              className="p-5 rounded-2xl bg-[#07170d] border border-white/10 hover:border-[#1fc16b]/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#1fc16b]/15 text-[#1fc16b] border border-[#1fc16b]/30 font-orbitron">
                    {landmark.tag}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#f26522]" />
                    [{landmark.position[0]}, {landmark.position[2]}]
                  </span>
                </div>

                <h4 className="font-orbitron font-bold text-base text-white group-hover:text-[#1fc16b] transition-colors">
                  {landmark.name}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {landmark.desc}
                </p>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-amber-200/90 leading-tight">
                  💡 {landmark.historicalNote}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-space truncate">
                  {landmark.id === 'stadium'
                    ? '⚽ Penalty Minigame'
                    : landmark.id === 'dakkada'
                    ? '🔭 360° Deck'
                    : landmark.id === 'plaza'
                    ? '🍲 Food Kiosk'
                    : '🏛️ Iconic Site'}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenLiveSimulation && (
                    <button
                      onClick={() => onOpenLiveSimulation(landmark.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black font-orbitron font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="View in Live 3D Simulation"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Live Sim
                    </button>
                  )}
                  <button
                    onClick={() => onTeleportToLandmark(landmark)}
                    className="px-3 py-1.5 rounded-xl bg-[#1fc16b]/20 hover:bg-[#1fc16b] text-[#1fc16b] hover:text-black font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Drive Here
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Collectibles Teaser */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#140b05] via-[#241208] to-[#0e0703] border border-[#f26522]/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f26522]" />
            <h3 className="font-orbitron font-bold text-base text-white">
              Indigenous Akwa Ibom Relics & Artifacts
            </h3>
          </div>
          <span className="text-xs font-mono text-[#f26522] bg-[#f26522]/20 border border-[#f26522]/40 px-2.5 py-1 rounded-full">
            {COLLECTIBLE_ARTIFACTS.length} Hidden Relics
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Search the city to recover precious cultural treasures including the Bronze Maiden Mascot at Ibom Plaza,
          the Raffia Heritage Crown at Tropicana, and the Dakkada Innovation Core. Each collected artifact yields
          exclusive Ibom Coins and XP rewards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {COLLECTIBLE_ARTIFACTS.map((artifact) => (
            <div key={artifact.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
              <span className="text-2xl">{artifact.icon}</span>
              <div className="overflow-hidden">
                <h5 className="font-orbitron font-bold text-xs text-white truncate">{artifact.name}</h5>
                <p className="text-[10px] text-slate-400 truncate">{artifact.culturalLore}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
