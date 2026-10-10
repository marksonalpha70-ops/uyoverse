import React from 'react';
import { CollectibleArtifact } from '../types/game';
import { Sparkles, Check, MapPin, X, Award } from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  artifacts: CollectibleArtifact[];
  onTrackArtifact: (artifact: CollectibleArtifact) => void;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  artifacts,
  onTrackArtifact,
  onClose,
}) => {
  if (!isOpen) return null;

  const collectedCount = artifacts.filter((a) => a.collected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#07190e] border border-amber-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Akwa Ibom Heritage Relics
              </h3>
              <p className="text-xs text-slate-400">
                Discover ancient ceremonial artifacts scattered across Uyo landmarks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
              {collectedCount} of {artifacts.length} Discovered
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Artifact List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {artifacts.map((art) => {
            return (
              <div
                key={art.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  art.collected
                    ? 'bg-[#1fc16b]/15 border-[#1fc16b]/50'
                    : 'bg-black/40 border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {art.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-orbitron font-bold text-white text-sm">{art.name}</h4>
                      {art.collected && (
                        <span className="text-[10px] font-bold text-[#1fc16b] flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#1fc16b]/20">
                          <Check className="w-3 h-3" /> Collected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{art.desc}</p>
                    <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                      📜 <span className="italic">{art.culturalLore}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {!art.collected ? (
                    <button
                      onClick={() => onTrackArtifact(art)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Track & Jump
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono font-semibold">+500 XP Earned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#092213] flex justify-between items-center text-xs text-slate-400">
          <span>Find all 5 relics to unlock the Golden Dakkada Trophy decal.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-xs shadow-md transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
