import React, { useState } from 'react';
import { FoodItem } from '../types/game';
import { FOOD_CATALOG } from '../data/gameData';
import { soundEngine } from '../utils/AudioSynthesizer';
import { Utensils, Coins, Sparkles, X, AlertCircle } from 'lucide-react';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOrder = (food: FoodItem) => {
    if (playerCoins >= food.priceCoins) {
      setErrorMessage(null);
      soundEngine.playArtifactChime();
      onEatFood(food);
    } else {
      setErrorMessage(
        `Insufficient funds: need ₦${(food.priceCoins - playerCoins).toLocaleString()} more Ibom Coins.`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0a1a10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#10261a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#ff6a1a]/20 text-[#ff6a1a]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Akwa Ibom Culinary Spot (Mama Ekaette Kiosk)
              </h3>
              <p className="text-xs text-[#9db8a8]">Authentic Uyo Delicacies • Instantly Restores Durability & Boost</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-black/50 text-[#fbbf24] font-mono text-xs font-bold border border-white/10 flex items-center gap-1.5 tabular-nums">
              <Coins className="w-3.5 h-3.5 text-[#fbbf24]" />
              ₦{playerCoins.toLocaleString()}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close food kiosk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error notice if insufficient funds */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2 text-xs text-amber-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Food Menu Items */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-3.5">
          {FOOD_CATALOG.map((f) => {
            const canAfford = playerCoins >= f.priceCoins;
            return (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-white text-sm">{f.name}</h4>
                      <span className="text-xs font-mono font-bold text-[#fbbf24] tabular-nums">
                        ₦{f.priceCoins.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#9db8a8] mt-0.5">{f.desc}</p>
                    <p className="text-[11px] text-[#22c55e] font-medium mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> {f.buff}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(f)}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded-full font-display font-bold text-xs flex items-center gap-1.5 transition-all self-end sm:self-center shrink-0 cursor-pointer ${
                    canAfford
                      ? 'bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-md'
                      : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Eat & Boost (₦{f.priceCoins})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
