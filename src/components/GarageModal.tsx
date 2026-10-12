import React from 'react';
import { VehicleModel, VehicleCustomization } from '../types/game';
import { VEHICLE_CATALOG } from '../data/gameData';
import { Wrench, Check, Lock, Coins, Sparkles, X, Shield, Flame, Gauge } from 'lucide-react';
import { EXCLUSIVE_DECALS } from '../utils/dailyReward';

interface GarageModalProps {
  isOpen: boolean;
  currentModel: VehicleModel;
  customization: VehicleCustomization;
  playerCoins: number;
  unlockedModels: string[];
  unlockedDecals?: string[];
  vehicleHealth?: number;
  onSelectModel: (model: VehicleModel) => void;
  onUpdateCustomization: (c: VehicleCustomization) => void;
  onUnlockVehicle: (model: VehicleModel, cost: number) => void;
  onUpgradeEngine: (stage: number, cost: number) => void;
  onRepairVehicle?: () => void;
  onOpenDailyRewards?: () => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  currentModel,
  customization,
  playerCoins,
  unlockedModels,
  unlockedDecals = ['none'],
  vehicleHealth = 100,
  onSelectModel,
  onUpdateCustomization,
  onUnlockVehicle,
  onUpgradeEngine,
  onRepairVehicle,
  onOpenDailyRewards,
  onClose,
}) => {
  if (!isOpen) return null;

  const colorPalette = [
    { name: 'Uyo Solar Orange', hex: '#ff6a1a' },
    { name: 'Akwa Ibom Forest Green', hex: '#0e4b25' },
    { name: 'Cyber Neon Mint', hex: '#22c55e' },
    { name: 'Dakkada Obsidian', hex: '#111827' },
    { name: 'Pure Pearl White', hex: '#f8fafc' },
    { name: 'Tropicana Gold', hex: '#fbbf24' },
  ];

  const underglowOptions = [
    { name: 'Off', val: 'none' },
    { name: 'Emerald', val: '#22c55e' },
    { name: 'Orange', val: '#ff6a1a' },
    { name: 'Electric Cyan', val: '#38bdf8' },
  ];

  const repairCost = Math.round((100 - vehicleHealth) * 12);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0a1a10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#10261a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#ff6a1a]/20 text-[#ff6a1a]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Uyoverse Customs & Tuning Garage
              </h3>
              <p className="text-xs text-[#9db8a8]">Inspect vehicle stats, repair chassis, and apply performance wraps</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-[#fbbf24] font-mono text-xs font-bold tabular-nums">
              <Coins className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>₦{playerCoins.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close garage"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Workshop Chassis Repair Banner */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm text-white">Chassis Integrity</h4>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      vehicleHealth < 40
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                    }`}
                  >
                    {vehicleHealth}%
                  </span>
                </div>
                <p className="text-xs text-[#9db8a8] mt-0.5">
                  {vehicleHealth === 100
                    ? 'Chassis in showroom condition.'
                    : `Workshop mechanics can overhaul damage for ₦${repairCost.toLocaleString()} Ibom Coins.`}
                </p>
              </div>
            </div>

            {onRepairVehicle && vehicleHealth < 100 && (
              <button
                onClick={onRepairVehicle}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-display font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                Overhaul & Repair (₦{repairCost})
              </button>
            )}
          </div>

          {/* 1. Vehicle Fleet & Stats Comparison */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22c55e]" />
              Akwa Ibom Vehicle Fleet & Stats
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {VEHICLE_CATALOG.map((v) => {
                const isSelected = currentModel === v.id;
                const isUnlocked = unlockedModels.includes(v.id);
                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-lg shadow-[#22c55e]/10 ring-1 ring-[#22c55e]'
                        : isUnlocked
                        ? 'bg-black/40 border-white/10 hover:border-white/20'
                        : 'bg-black/60 border-white/5 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {v.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-display font-bold text-[#22c55e] flex items-center gap-1">
                            <Check className="w-3 h-3" /> EQUIPPED
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>

                      <h5 className="font-display font-bold text-white text-sm">{v.name}</h5>
                      <p className="text-xs text-[#9db8a8] mt-1 line-clamp-2">{v.description}</p>

                      {/* Stat Bars (Part C) */}
                      <div className="my-3 space-y-1.5 pt-2 border-t border-white/5 text-[10px]">
                        <div>
                          <div className="flex justify-between text-[#9db8a8] mb-0.5">
                            <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-[#22c55e]" /> Top Speed</span>
                            <span className="font-mono text-white">{v.topSpeedKmh} km/h</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#22c55e] rounded-full" style={{ width: `${(v.topSpeedKmh / 220) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#9db8a8] mb-0.5">
                            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-sky-400" /> Armor / Weight</span>
                            <span className="font-mono text-white">{v.handling}</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-400 rounded-full" style={{ width: v.id === 'bus' ? '90%' : v.id === 'coupe' ? '70%' : '50%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#9db8a8] mb-0.5">
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff6a1a]" /> Acceleration</span>
                            <span className="font-mono text-white">{v.acceleration}</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ff6a1a] rounded-full" style={{ width: v.id === 'coupe' ? '95%' : v.id === 'taxi' ? '65%' : '45%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      {isUnlocked ? (
                        <button
                          onClick={() => onSelectModel(v.id as VehicleModel)}
                          disabled={isSelected}
                          className={`w-full py-2 rounded-full text-xs font-display font-bold transition-all ${
                            isSelected
                              ? 'bg-[#22c55e] text-black cursor-default'
                              : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                          }`}
                        >
                          {isSelected ? 'Currently Driving' : 'Select Vehicle'}
                        </button>
                      ) : (
                        <button
                          onClick={() => onUnlockVehicle(v.id as VehicleModel, v.costCoins)}
                          className="w-full py-2 rounded-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black text-xs font-display font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          Unlock for ₦{v.costCoins.toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Paint Wrap & Underglow */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h4 className="font-display font-bold text-sm text-white">Color Wraps & Neon Underglow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#9db8a8] block mb-2">Exterior High-Gloss Paint:</span>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => onUpdateCustomization({ ...customization, color: c.hex })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        customization.color === c.hex ? 'border-white scale-110 ring-2 ring-[#22c55e]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      aria-label={`Color ${c.name}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-[#9db8a8] block mb-2">Neon Ground Glow:</span>
                <div className="flex flex-wrap gap-2">
                  {underglowOptions.map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => onUpdateCustomization({ ...customization, neonUnderglow: opt.val })}
                      className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold border transition-all cursor-pointer ${
                        customization.neonUnderglow === opt.val
                          ? 'bg-[#22c55e]/20 border-[#22c55e] text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Engine Stages */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-white">Engine Performance Tuning</h4>
              <span className="text-xs font-mono text-[#22c55e]">Stage {customization.engineStage} Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { stage: 1, name: 'Stock Tarmac Tune', cost: 0, boost: '+0% Speed' },
                { stage: 2, name: 'Turbo Sport ECU', cost: 3500, boost: '+15% Speed' },
                { stage: 3, name: 'Dakkada Apex V8', cost: 8500, boost: '+30% Speed' },
              ].map((s) => {
                const isCurrent = customization.engineStage === s.stage;
                return (
                  <div key={s.stage} className="p-3 rounded-2xl border border-white/10 bg-black/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-display font-bold">
                      <span className="text-white">{s.name}</span>
                      <span className="text-[#22c55e]">{s.boost}</span>
                    </div>
                    {isCurrent ? (
                      <div className="text-[11px] font-mono text-[#22c55e] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Installed
                      </div>
                    ) : (
                      <button
                        onClick={() => onUpgradeEngine(s.stage, s.cost)}
                        disabled={playerCoins < s.cost}
                        className="w-full py-1.5 rounded-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black text-xs font-display font-bold cursor-pointer disabled:opacity-40"
                      >
                        Tune for ₦{s.cost.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#10261a] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-display font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            Done / Close Garage
          </button>
        </div>
      </div>
    </div>
  );
};
