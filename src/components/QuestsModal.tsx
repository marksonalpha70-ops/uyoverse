import React from 'react';
import { CollectibleArtifact } from '../types/game';
import { Sparkles, Check, MapPin, X, Award, Gift, Trophy } from 'lucide-react';

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
  const isAllCollected = collectedCount === artifacts.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a1a10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#10261a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#fbbf24]/20 text-[#fbbf24]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Akwa Ibom Heritage Relics Challenge
              </h3>
              <p className="text-xs text-[#9db8a8]">
                Locate and retrieve 5 sacred cultural relics scattered across Uyo landmarks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#fbbf24]/15 text-[#fbbf24] font-mono text-xs font-bold border border-[#fbbf24]/30 tabular-nums">
              {collectedCount} of {artifacts.length} Discovered
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close relics challenge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Completion Grand Reward Banner */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#10261a] to-[#0a1a10] border border-[#22c55e]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center text-[#fbbf24] shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                <span>Grand Challenge Reward</span>
                <span className="text-[#fbbf24] font-mono">+₦10,000 Coins & Golden Crest</span>
              </h4>
              <p className="text-[11px] text-[#9db8a8] mt-0.5">
                Collect all 5 relics to claim the Master Historian badge and custom vehicle decal.
              </p>
            </div>
          </div>
          {isAllCollected && (
            <span className="px-3 py-1 rounded-full bg-[#22c55e] text-black font-display font-bold text-xs flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Challenge Complete!
            </span>
          )}
        </div>

        {/* Artifact List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
          {artifacts.map((art) => (
            <div
              key={art.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                art.collected
                  ? 'bg-[#22c55e]/15 border-[#22c55e]/40 shadow-sm'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                  {art.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-white text-sm">{art.name}</h4>
                    {art.collected && (
                      <span className="text-[10px] font-bold text-[#22c55e] flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#22c55e]/20">
                        <Check className="w-3 h-3" /> Collected (+₦1,500)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9db8a8] mt-0.5 leading-relaxed">{art.desc}</p>
                  <p className="text-[11px] text-[#fbbf24]/90 font-medium mt-1">
                    📜 <span className="italic">{art.culturalLore}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!art.collected ? (
                  <button
                    onClick={() => {
                      onTrackArtifact(art);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Track on Radar
                  </button>
                ) : (
                  <span className="text-xs text-[#22c55e] font-mono font-semibold">+500 XP Earned</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#10261a] flex justify-between items-center text-xs text-[#9db8a8]">
          <span>Track relics on your mini-map radar to pinpoint coordinates.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
