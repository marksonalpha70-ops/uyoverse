import React from 'react';
import { VehicleModel, VehicleCustomization } from '../types/game';
import { VEHICLE_CATALOG } from '../data/gameData';
import { Wrench, Check, Lock, Coins, Sparkles, X, ShieldAlert } from 'lucide-react';

interface GarageModalProps {
  isOpen: boolean;
  currentModel: VehicleModel;
  customization: VehicleCustomization;
  playerCoins: number;
  unlockedModels: string[];
  onSelectModel: (model: VehicleModel) => void;
  onUpdateCustomization: (c: VehicleCustomization) => void;
  onUnlockVehicle: (model: VehicleModel, cost: number) => void;
  onUpgradeEngine: (stage: number, cost: number) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  currentModel,
  customization,
  playerCoins,
  unlockedModels,
  onSelectModel,
  onUpdateCustomization,
  onUnlockVehicle,
  onUpgradeEngine,
  onClose,
}) => {
  if (!isOpen) return null;

  const colorPalette = [
    { name: 'Uyo Solar Orange', hex: '#f26522' },
    { name: 'Akwa Ibom Forest Green', hex: '#0e4b25' },
    { name: 'Cyber Neon Mint', hex: '#1fc16b' },
    { name: 'Dakkada Obsidian', hex: '#111827' },
    { name: 'Pure Pearl White', hex: '#f8fafc' },
    { name: 'Tropicana Gold', hex: '#f59e0b' },
  ];

  const underglowOptions = [
    { name: 'Off', val: 'none' },
    { name: 'Emerald', val: '#1fc16b' },
    { name: 'Orange', val: '#f26522' },
    { name: 'Electric Cyan', val: '#38bdf8' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#07190e] border border-[#1fc16b] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f26522]/20 text-[#f26522]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Uyoverse Customs & Vehicle Garage
              </h3>
              <p className="text-xs text-slate-400">Select vehicles, apply custom paint wraps, and tune engines</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>₦{playerCoins.toLocaleString()} Ibom Coins</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* 1. Vehicle Fleet Selector */}
          <div className="space-y-3">
            <h4 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1fc16b]" />
              Akwa Ibom Vehicle Fleet
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLE_CATALOG.map((v) => {
                const isSelected = currentModel === v.id;
                const isUnlocked = unlockedModels.includes(v.id);
                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1fc16b]/15 border-[#1fc16b] shadow-lg shadow-[#1fc16b]/20 ring-1 ring-[#1fc16b]'
                        : 'bg-black/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-space px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold">
                          {v.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-orbitron font-bold text-[#1fc16b] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                      </div>
                      <h5 className="font-orbitron font-bold text-white text-xs mt-1">{v.name}</h5>
                      <p className="text-slate-400 text-[11px] leading-tight mt-1 line-clamp-2">{v.description}</p>
                    </div>

                    <div className="space-y-1.5 my-3 pt-2 border-t border-white/5 text-[10px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Top Speed</span>
                        <span className="font-mono text-white font-bold">{v.topSpeedKmh} km/h</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Acceleration</span>
                        <span className="font-mono text-white font-bold">{v.acceleration}/10</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Handling</span>
                        <span className="font-mono text-white font-bold">{v.handling}/10</span>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <button
                          onClick={() => onSelectModel(v.id as VehicleModel)}
                          disabled={isSelected}
                          className={`w-full py-1.5 rounded-xl font-orbitron font-bold text-xs transition-all ${
                            isSelected
                              ? 'bg-[#1fc16b] text-black cursor-default'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isSelected ? 'Equipped' : 'Select'}
                        </button>
                      ) : (
                        <button
                          onClick={() => onUnlockVehicle(v.id as VehicleModel, v.costCoins)}
                          className="w-full py-1.5 rounded-xl bg-[#f26522] hover:bg-[#d94b08] text-white font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                        >
                          <Lock className="w-3 h-3" /> Unlock (₦{v.costCoins.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Paint Shop & Underglow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {/* Exterior Colors */}
            <div className="space-y-3">
              <h4 className="font-orbitron font-bold text-sm text-white">
                Custom Paint Finish
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {colorPalette.map((c) => {
                  const isEquipped = customization.color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      onClick={() => onUpdateCustomization({ ...customization, color: c.hex })}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        isEquipped
                          ? 'border-[#1fc16b] bg-[#1fc16b]/20 text-white ring-1 ring-[#1fc16b]'
                          : 'border-white/10 bg-black/30 hover:border-white/30 text-slate-300'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-[11px] truncate font-space">{c.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Neon Underglow */}
            <div className="space-y-3">
              <h4 className="font-orbitron font-bold text-sm text-white">
                Neon Ground Underglow
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {underglowOptions.map((u) => {
                  const isEquipped = customization.neonUnderglow === u.val;
                  return (
                    <button
                      key={u.val}
                      onClick={() => onUpdateCustomization({ ...customization, neonUnderglow: u.val })}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isEquipped
                          ? 'border-[#1fc16b] bg-[#1fc16b]/20 text-white ring-1 ring-[#1fc16b]'
                          : 'border-white/10 bg-black/30 hover:border-white/30 text-slate-300'
                      }`}
                    >
                      <span>{u.name}</span>
                      {u.val !== 'none' && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.val }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Performance Engine Stages */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="font-orbitron font-bold text-sm text-white">
              Engine Performance Stages
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { stage: 1, name: 'Stock Factory ECU', desc: 'Standard Uyo city calibration.', cost: 0 },
                { stage: 2, name: 'Stage 2 Twin Intake', desc: '+15% Acceleration boost and faster nitro recharge.', cost: 1500 },
                { stage: 3, name: 'Stage 3 Dakkada Turbo', desc: '+30% Top speed, quad-spark plug, maximum torque.', cost: 3500 },
              ].map((s) => {
                const isActive = customization.engineStage === s.stage;
                return (
                  <div
                    key={s.stage}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#1fc16b]/15 border-[#1fc16b] ring-1 ring-[#1fc16b]'
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#1fc16b]">STAGE {s.stage}</span>
                      <h5 className="font-orbitron font-bold text-white text-xs mt-0.5">{s.name}</h5>
                      <p className="text-slate-400 text-[11px] mt-1">{s.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5">
                      {isActive ? (
                        <span className="text-xs font-orbitron font-bold text-[#1fc16b] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> INSTALLED
                        </span>
                      ) : (
                        <button
                          onClick={() => onUpgradeEngine(s.stage, s.cost)}
                          className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs transition-all"
                        >
                          Upgrade (₦{s.cost.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#092213] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-xs shadow-lg transition-all"
          >
            Done / Close Garage
          </button>
        </div>
      </div>
    </div>
  );
};
