import React, { useState, useEffect } from 'react';
import { Building2, Eye, Compass, X, Sparkles, Lock, Check, Layers, Award } from 'lucide-react';
import { CollectibleArtifact, VirtualProperty } from '../types/game';

interface DakkadaObservatoryModalProps {
  isOpen: boolean;
  artifacts?: CollectibleArtifact[];
  properties?: VirtualProperty[];
  unlockedModels?: string[];
  onClose: () => void;
}

export const DakkadaObservatoryModal: React.FC<DakkadaObservatoryModalProps> = ({
  isOpen,
  artifacts = [],
  properties = [],
  unlockedModels = ['taxi'],
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'panorama'>('cards');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isElevatorMoving, setIsElevatorMoving] = useState(true);
  const [viewpoint, setViewpoint] = useState<'plaza' | 'stadium' | 'airport' | 'ring'>('plaza');

  useEffect(() => {
    if (isOpen) {
      setCurrentFloor(1);
      setIsElevatorMoving(true);
      const timer = setInterval(() => {
        setCurrentFloor((f) => {
          if (f >= 21) {
            clearInterval(timer);
            setIsElevatorMoving(false);
            return 21;
          }
          return f + 1;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const views = {
    plaza: {
      name: 'West Panorama: Ibom Plaza Central Hub',
      desc: 'Looking down into the heartbeat of Uyo where all 7 major arterial avenues radiate out from the monumental colonnade and stepped water fountains.',
      altitude: '92 Meters Above Street Level',
      coords: '5.0377° N, 7.9128° E',
    },
    stadium: {
      name: 'North-West Panorama: Nest of Champions',
      desc: 'Gazing across to the luminous bowl of Godswill Akpabio International Stadium with its 4 towering floodlight masts and natural turf pitch.',
      altitude: '92 Meters Above Street Level',
      coords: '5.0125° N, 7.8930° E',
    },
    airport: {
      name: 'South-East Panorama: Victor Attah Airport Link',
      desc: 'The sweeping Oron Road corridor leading to the MRO aviation hub and gateway of Ibom Air connecting Akwa Ibom to the world.',
      altitude: '92 Meters Above Street Level',
      coords: '4.8722° N, 8.0877° E',
    },
    ring: {
      name: 'Panoramic Skyline: The Ring Road Expressway',
      desc: 'The outer arterial beltway encircling Uyo capital, dotted with solar streetlights, modern commercial towers, and lush green palm groves.',
      altitude: '92 Meters Above Street Level',
      coords: '360° Radial Survey',
    },
  };

  // Build 8-slot collectible card deck
  const deckCards = [
    {
      id: 'card-1',
      title: 'Bronze Leopard of Ikot Ekpene',
      category: 'Cultural Relic',
      isUnlocked: artifacts.find((a) => a.id === 'art_1')?.collected ?? false,
      icon: '🐆',
      desc: 'Discovered along the colonnades of Ibom Plaza fountain.',
      rarity: 'Legendary',
    },
    {
      id: 'card-2',
      title: 'Ceremonial Palmwine Horn',
      category: 'Cultural Relic',
      isUnlocked: artifacts.find((a) => a.id === 'art_2')?.collected ?? false,
      icon: '🏺',
      desc: 'Uncovered near the VIP ramp of Nest of Champions Stadium.',
      rarity: 'Rare',
    },
    {
      id: 'card-3',
      title: 'Raffia Royal Scepter',
      category: 'Cultural Relic',
      isUnlocked: artifacts.find((a) => a.id === 'art_3')?.collected ?? false,
      icon: '🪄',
      desc: 'Found near the Dakkada Tower Smart Boulevard.',
      rarity: 'Epic',
    },
    {
      id: 'card-4',
      title: 'Traditional Ekpe Mask',
      category: 'Cultural Relic',
      isUnlocked: artifacts.find((a) => a.id === 'art_4')?.collected ?? false,
      icon: '🎭',
      desc: 'Retrieved from Ibom Tropicana leisure grounds.',
      rarity: 'Legendary',
    },
    {
      id: 'card-5',
      title: 'Ancestral Bell of Unity',
      category: 'Cultural Relic',
      isUnlocked: artifacts.find((a) => a.id === 'art_5')?.collected ?? false,
      icon: '🔔',
      desc: 'Located at Unity Park botanical gardens.',
      rarity: 'Rare',
    },
    {
      id: 'card-6',
      title: 'Executive Pilot Key: Dakkada Coupe',
      category: 'Vehicle License',
      isUnlocked: unlockedModels.includes('coupe'),
      icon: '🏎️',
      desc: 'Unlocked by purchasing the Dakkada GT Turbo Coupe.',
      rarity: 'Epic',
    },
    {
      id: 'card-7',
      title: 'Title Deed: Dakkada Commercial Suite',
      category: 'Real Estate Deed',
      isUnlocked: properties.find((p) => p.id === 'prop_dakkada')?.owned ?? false,
      icon: '🏢',
      desc: 'Awarded upon acquiring commercial title deeds at Dakkada Tower.',
      rarity: 'Epic',
    },
    {
      id: 'card-8',
      title: 'Trophy Deed: Ibom Tropicana Plaza',
      category: 'Real Estate Deed',
      isUnlocked: properties.find((p) => p.id === 'prop_tropicana')?.owned ?? false,
      icon: '🎪',
      desc: 'Earned by acquiring title deeds for Ibom Tropicana.',
      rarity: 'Legendary',
    },
  ];

  const unlockedCount = deckCards.filter((c) => c.isUnlocked).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0a1a10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#10261a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Dakkada 21st Floor Deck & Relic Cards
              </h3>
              <p className="text-xs text-[#9db8a8]">
                Collectible cards deck of earned achievements and 360° observatory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View switcher tabs */}
            <div className="flex rounded-full bg-black/50 p-1 border border-white/10 text-xs font-display">
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-[#22c55e] text-black font-bold'
                    : 'text-[#9db8a8] hover:text-white'
                }`}
              >
                Cards Deck ({unlockedCount}/8)
              </button>
              <button
                onClick={() => setActiveTab('panorama')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'panorama'
                    ? 'bg-[#22c55e] text-black font-bold'
                    : 'text-[#9db8a8] hover:text-white'
                }`}
              >
                360° Sky Deck
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close observatory deck"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'cards' ? (
            /* Collectible Cards Deck */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#22c55e]" />
                    Earned Item Cards & Deck Slots
                  </h4>
                  <p className="text-xs text-[#9db8a8]">
                    Collect artifacts, unlock vehicles, and acquire deeds in Uyo to complete your card deck.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] font-mono text-xs font-bold border border-[#22c55e]/40">
                  {unlockedCount} of 8 Cards Unlocked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {deckCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[190px] ${
                      card.isUnlocked
                        ? 'bg-gradient-to-b from-[#10261a] to-[#0a1a10] border-[#22c55e]/40 shadow-lg shadow-[#22c55e]/10'
                        : 'bg-black/50 border-white/5 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {card.category}
                        </span>
                        {card.isUnlocked ? (
                          <span className="text-[10px] font-display font-bold text-[#22c55e] flex items-center gap-1">
                            <Check className="w-3 h-3" /> UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> LOCKED
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl mb-2">
                        {card.isUnlocked ? card.icon : '🔒'}
                      </div>

                      <h5 className="font-display font-bold text-white text-xs leading-snug">
                        {card.title}
                      </h5>
                      <p className="text-[11px] text-[#9db8a8] mt-1 leading-relaxed">
                        {card.isUnlocked ? card.desc : 'Slot locked. Explore landmarks and complete objectives.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{card.rarity}</span>
                      {card.isUnlocked && (
                        <span className="text-[#fbbf24] font-bold flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 360 Observatory Panorama */
            <div className="space-y-6">
              {/* Elevator status */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isElevatorMoving ? 'bg-amber-400 animate-ping' : 'bg-[#22c55e]'
                    }`}
                  />
                  <span className="font-display font-bold text-sm text-white">
                    {isElevatorMoving ? 'Smart Elevator Ascending...' : 'Observation Deck Reached: 21st Floor'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-xs text-slate-400">FLOOR</span>
                  <span className="font-display font-black text-2xl text-sky-400 tabular-nums">
                    {currentFloor}
                  </span>
                  <span className="text-xs text-slate-400">/ 21</span>
                </div>
              </div>

              {/* Viewpoint Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['plaza', 'stadium', 'airport', 'ring'] as const).map((vp) => (
                  <button
                    key={vp}
                    onClick={() => setViewpoint(vp)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      viewpoint === vp
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-display font-bold block uppercase">{vp}</span>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                      {vp === 'plaza' ? 'Ibom Plaza' : vp === 'stadium' ? 'Nest of Champions' : vp === 'airport' ? 'Airport Link' : 'Ring Road'}
                    </span>
                  </button>
                ))}
              </div>

              {/* View Details Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-white text-base">{views[viewpoint].name}</h4>
                  <span className="text-xs font-mono text-sky-400">{views[viewpoint].coords}</span>
                </div>
                <p className="text-xs text-[#9db8a8] leading-relaxed">{views[viewpoint].desc}</p>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] font-mono text-slate-300">
                  🔭 Survey Altitude: {views[viewpoint].altitude}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
