import React from 'react';
import { VirtualProperty } from '../types/game';
import { Building, Coins, Check, Lock, Landmark, Sparkles, X } from 'lucide-react';

interface RealEstateModalProps {
  isOpen: boolean;
  properties: VirtualProperty[];
  playerCoins: number;
  uncollectedRent: number;
  onBuyProperty: (prop: VirtualProperty) => void;
  onCollectRent: () => void;
  onClose: () => void;
}

export const RealEstateModal: React.FC<RealEstateModalProps> = ({
  isOpen,
  properties,
  playerCoins,
  uncollectedRent,
  onBuyProperty,
  onCollectRent,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalHourlyIncome = properties
    .filter((p) => p.owned)
    .reduce((sum, p) => sum + p.hourlyYieldCoins, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#07190e] border border-[#1fc16b] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1fc16b]/20 text-[#1fc16b]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Uyoverse Real Estate & Commercial Land Registry
              </h3>
              <p className="text-xs text-slate-400">Own properties in Uyo to earn passive hourly Ibom Coin dividends</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio Stats Strip */}
        <div className="p-6 pb-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-space font-semibold">Passive Income Rate</span>
            <p className="font-orbitron font-bold text-[#1fc16b] text-xl mt-0.5">
              +₦{totalHourlyIncome.toLocaleString()}/hour
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-space font-semibold">Your Balance</span>
            <p className="font-orbitron font-bold text-amber-400 text-xl mt-0.5">
              ₦{playerCoins.toLocaleString()} Coins
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-space font-semibold">Uncollected Dividends</span>
              <p className="font-orbitron font-bold text-white text-lg mt-0.5">₦{uncollectedRent.toLocaleString()}</p>
            </div>
            <button
              onClick={onCollectRent}
              disabled={uncollectedRent === 0}
              className={`px-3 py-1.5 rounded-xl font-orbitron font-bold text-xs transition-all ${
                uncollectedRent > 0
                  ? 'bg-[#1fc16b] text-black hover:bg-[#19a55a] shadow-lg'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              Collect
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                prop.owned
                  ? 'bg-[#1fc16b]/15 border-[#1fc16b]/60'
                  : 'bg-black/40 border-white/10 hover:border-white/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {prop.category}
                  </span>
                  {prop.owned ? (
                    <span className="text-xs font-orbitron font-bold text-[#1fc16b] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> DEED OWNED
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ₦{prop.costCoins.toLocaleString()}
                    </span>
                  )}
                </div>
                <h4 className="font-orbitron font-bold text-white text-sm">{prop.name}</h4>
                <p className="text-[11px] text-[#f26522] font-semibold mt-0.5">{prop.location}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{prop.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-[#1fc16b] font-bold">
                  Yield: +₦{prop.hourlyYieldCoins}/hr
                </span>
                {!prop.owned ? (
                  <button
                    onClick={() => onBuyProperty(prop)}
                    disabled={playerCoins < prop.costCoins}
                    className={`px-4 py-1.5 rounded-xl font-orbitron font-bold text-xs flex items-center gap-1 transition-all ${
                      playerCoins >= prop.costCoins
                        ? 'bg-[#f26522] hover:bg-[#d94b08] text-white shadow-md'
                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-3 h-3" /> Purchase Deed
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Generating Yield</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
