import React from 'react';
import { FoodItem } from '../types/game';
import { FOOD_CATALOG } from '../data/gameData';
import { soundEngine } from '../utils/AudioSynthesizer';
import { Utensils, Coins, Sparkles, X, Heart, ShieldCheck } from 'lucide-react';

interface FoodKioskModalProps {
  isOpen: boolean;
  playerCoins: number;
  onEatFood: (food: FoodItem) => void;
  onClose: () => void;
}

export const FoodKioskModal: React.FC<FoodKioskModalProps> = ({
  isOpen,
  playerCoins,
  onEatFood,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleOrder = (food: FoodItem) => {
    if (playerCoins >= food.priceCoins) {
      soundEngine.playArtifactChime();
      onEatFood(food);
    } else {
      alert(`Need ₦${(food.priceCoins - playerCoins).toLocaleString()} more Ibom Coins! Complete jobs to earn cash.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#07190e] border border-[#f26522] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f26522]/20 text-[#f26522]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                Akwa Ibom Culinary Spot (Mama Ekaette Kiosk)
              </h3>
              <p className="text-xs text-slate-400">Authentic Calabar & Uyo Delicacies • Health & Vehicle Boosts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-black/50 text-amber-300 font-mono text-xs font-bold border border-amber-500/40 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              ₦{playerCoins.toLocaleString()}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Food Menu Items */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {FOOD_CATALOG.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-[#f26522]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-orbitron font-bold text-white text-sm">{f.name}</h4>
                    <span className="text-xs font-mono font-bold text-amber-400">₦{f.priceCoins}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{f.desc}</p>
                  <p className="text-[11px] text-[#1fc16b] font-medium mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {f.buff}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOrder(f)}
                disabled={playerCoins < f.priceCoins}
                className={`px-4 py-2 rounded-xl font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all self-end sm:self-center flex-shrink-0 ${
                  playerCoins >= f.priceCoins
                    ? 'bg-[#f26522] hover:bg-[#d94b08] text-white shadow-md'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                Eat & Boost (₦{f.priceCoins})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
