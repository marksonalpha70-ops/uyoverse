import React from 'react';
import {
  Gift,
  Coins,
  Trophy,
  Check,
  Lock,
  Sparkles,
  X,
  Flame,
  ArrowRight,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import {
  DAILY_REWARD_TIERS,
  DailyRewardStatus,
  claimDailyReward,
  getDecalById,
} from '../utils/dailyReward';
import { soundEngine } from '../utils/AudioSynthesizer';
import { triggerCelebration } from '../utils/celebration';

interface DailyRewardModalProps {
  isOpen: boolean;
  status: DailyRewardStatus;
  playerCoins: number;
  onClaimSuccess: (claimedCoins: number, claimedXp: number, decalId: string) => void;
  onOpenGarage?: () => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  status,
  playerCoins,
  onClaimSuccess,
  onOpenGarage,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    const result = claimDailyReward();
    if (result.success) {
      soundEngine.playCheckpointSound();
      triggerCelebration('mission');
      onClaimSuccess(result.tier.coins, result.tier.xp, result.tier.decal.id);
    }
  };

  const currentTier = status.nextTier;
  const isClaimable = status.canClaim;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[94vh] bg-[#07190e] border border-[#1fc16b]/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1fc16b]/20 to-[#f26522]/20 border border-[#1fc16b]/40 text-[#1fc16b] shadow-inner">
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-bold text-lg sm:text-xl text-white">
                  Daily Uyo City Login Rewards
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Day {status.currentStreakDay} of 7 Streak
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Launch daily to earn Ibom Coins and unlock exclusive vehicle decals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>₦{playerCoins.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close daily reward modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Streak Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c2a18] via-[#092213] to-[#123821] border border-[#1fc16b]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1fc16b]/15 border border-[#1fc16b]/40 flex items-center justify-center text-[#1fc16b]">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              </div>
              <div>
                <h4 className="text-sm font-orbitron font-bold text-white flex items-center gap-2">
                  <span>Day {status.currentStreakDay} Login Milestone</span>
                  {isClaimable ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#1fc16b] text-black text-[10px] font-black uppercase tracking-wider">
                      Ready to Claim
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-bold">
                      Claimed Today
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isClaimable
                    ? 'Claim today’s fare dividend and your limited-edition Akwa Ibom decal.'
                    : 'You have claimed today’s reward! Check back tomorrow for the next tier.'}
                </p>
              </div>
            </div>

            {isClaimable ? (
              <button
                onClick={handleClaim}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1fc16b] to-[#179c55] hover:brightness-110 text-black font-orbitron font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#1fc16b]/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Claim Now (+₦{currentTier.coins.toLocaleString()})
              </button>
            ) : (
              <div className="w-full sm:w-auto flex items-center gap-2 text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Next reward ready tomorrow</span>
              </div>
            )}
          </div>

          {/* Featured Decal Spotlight */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-orbitron font-bold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#1fc16b]" />
                {isClaimable ? 'Today’s Exclusive Decal Unlock' : 'Current Active Reward Decal'}
              </span>
              <span className="text-[11px] font-mono text-amber-300">
                Tier {currentTier.day} / 7
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0a2014] p-4 rounded-xl border border-[#1fc16b]/30">
              {/* Visual Decal Badge */}
              <div
                className="w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shrink-0"
                style={{
                  borderColor: currentTier.decal.primaryColor,
                  background: `linear-gradient(135deg, ${currentTier.decal.primaryColor}22, ${currentTier.decal.accentColor}33)`,
                }}
              >
                {/* Decorative Stripe preview */}
                <div
                  className="absolute inset-x-0 h-2 top-3 shadow"
                  style={{ backgroundColor: currentTier.decal.primaryColor }}
                />
                <div
                  className="absolute inset-x-0 h-1.5 bottom-3 shadow"
                  style={{ backgroundColor: currentTier.decal.accentColor }}
                />
                <Sparkles
                  className="w-7 h-7 relative z-10"
                  style={{ color: currentTier.decal.primaryColor }}
                />
                <span className="text-[9px] font-mono font-bold mt-1 text-white relative z-10 uppercase">
                  {currentTier.decal.pattern}
                </span>
              </div>

              {/* Decal Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-orbitron font-bold text-white text-base">
                    {currentTier.decal.name}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{
                      backgroundColor: `${currentTier.decal.primaryColor}30`,
                      color: currentTier.decal.primaryColor,
                    }}
                  >
                    Day {currentTier.day} Decal
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {currentTier.decal.description}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2.5 text-xs font-mono">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +₦{currentTier.coins.toLocaleString()} Ibom Coins
                  </span>
                  <span className="text-[#1fc16b] font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> +{currentTier.xp} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Road Map Grid */}
          <div className="space-y-3">
            <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-slate-400">
              7-Day Check-in Roadmap
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {DAILY_REWARD_TIERS.map((tier) => {
                const isPast = tier.day < status.currentStreakDay || (!isClaimable && tier.day <= status.currentStreakDay);
                const isCurrent = tier.day === status.currentStreakDay;
                const isFuture = tier.day > status.currentStreakDay;

                return (
                  <div
                    key={tier.day}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                      isCurrent && isClaimable
                        ? 'bg-[#1fc16b]/15 border-[#1fc16b] ring-2 ring-[#1fc16b]/50 shadow-lg shadow-[#1fc16b]/20 scale-102'
                        : isCurrent && !isClaimable
                        ? 'bg-[#0e301d] border-[#1fc16b]/50'
                        : isPast
                        ? 'bg-black/40 border-white/10 opacity-75'
                        : 'bg-black/30 border-white/5 opacity-60'
                    }`}
                  >
                    {/* Day number badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-orbitron font-bold text-slate-300">
                        DAY {tier.day}
                      </span>
                      {isPast ? (
                        <div className="w-4 h-4 rounded-full bg-[#1fc16b] text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : isCurrent && isClaimable ? (
                        <span className="w-2 h-2 rounded-full bg-[#1fc16b] animate-ping" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500" />
                      )}
                    </div>

                    {/* Decal Icon & Pattern Preview */}
                    <div className="my-1.5 flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm relative overflow-hidden"
                        style={{
                          borderColor: tier.decal.primaryColor,
                          background: `${tier.decal.primaryColor}15`,
                        }}
                      >
                        <div
                          className="w-full h-1 absolute top-2"
                          style={{ backgroundColor: tier.decal.primaryColor }}
                        />
                        <div
                          className="w-full h-0.5 absolute bottom-2"
                          style={{ backgroundColor: tier.decal.accentColor }}
                        />
                        <Sparkles
                          className="w-4 h-4"
                          style={{ color: tier.decal.primaryColor }}
                        />
                      </div>
                      <span className="text-[10px] font-space font-semibold text-white mt-1.5 text-center line-clamp-1">
                        {tier.decal.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Reward details */}
                    <div className="mt-2 pt-2 border-t border-white/5 text-center">
                      <div className="text-[11px] font-mono font-bold text-amber-300">
                        +₦{tier.coins.toLocaleString()}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        +{tier.xp} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#092213] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1fc16b]" />
            <span>Equip earned decals anytime in the Garage customs shop</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onOpenGarage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGarage();
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Palette className="w-3.5 h-3.5 text-[#1fc16b]" />
                Open Garage Decals
              </button>
            )}

            {isClaimable ? (
              <button
                onClick={handleClaim}
                className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Claim Reward</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
