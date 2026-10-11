import React, { useState, useEffect } from 'react';
import {
  Gift,
  Coins,
  Check,
  Lock,
  Sparkles,
  X,
  Flame,
  ShieldCheck,
  Palette,
  Clock,
} from 'lucide-react';
import {
  DAILY_REWARD_TIERS,
  DailyRewardStatus,
  claimDailyReward,
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
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setCountdown(
        `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[94vh] bg-[#0a1a10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#10261a]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24]">
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  Daily Uyo City Login Rewards
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#fbbf24] font-mono text-xs font-bold">
                  <Flame className="w-3 h-3 text-[#fbbf24]" />
                  Day {status.currentStreakDay} of 7 Streak
                </span>
              </div>
              <p className="text-xs text-[#9db8a8] mt-0.5">
                Check in daily to earn Ibom Coins and unlock exclusive vehicle wraps
              </p>
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
              aria-label="Close daily reward modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Streak Status Banner & Claim Countdown */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shrink-0">
                <Flame className="w-5 h-5 text-[#fbbf24]" />
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <span>Day {status.currentStreakDay} Login Milestone</span>
                  {isClaimable ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#22c55e] text-black text-[10px] font-black uppercase tracking-wider">
                      Ready to Claim
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#9db8a8] text-[10px] font-bold">
                      Claimed Today
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#9db8a8] mt-0.5">
                  {isClaimable
                    ? 'Claim today’s fare dividend and your limited-edition Akwa Ibom decal.'
                    : `Next claim unlocks at midnight in ${countdown}`}
                </p>
              </div>
            </div>

            {isClaimable ? (
              <button
                onClick={handleClaim}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Claim Now (+₦{currentTier.coins.toLocaleString()})
              </button>
            ) : (
              <div className="w-full sm:w-auto flex items-center gap-2 text-xs font-mono text-[#9db8a8] px-3.5 py-2 rounded-full bg-white/5 border border-white/10 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>Next reward in {countdown}</span>
              </div>
            )}
          </div>

          {/* 7-Day Streak Timeline */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#9db8a8]">
              7-Day Check-in Roadmap
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {DAILY_REWARD_TIERS.map((tier) => {
                const isClaimedPast = tier.day < status.currentStreakDay;
                const isCurrent = tier.day === status.currentStreakDay;
                const isUpcoming = tier.day > status.currentStreakDay;

                return (
                  <div
                    key={tier.day}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                      isCurrent && isClaimable
                        ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-md ring-1 ring-[#22c55e]'
                        : isClaimedPast || (isCurrent && !isClaimable)
                        ? 'bg-[#10261a] border-white/10'
                        : 'bg-black/50 border-white/5 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-400">Day {tier.day}</span>
                        {isClaimedPast || (isCurrent && !isClaimable) ? (
                          <Check className="w-3 h-3 text-[#22c55e]" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#fbbf24] block tabular-nums">
                        +₦{tier.coins.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-display truncate mt-2 block">
                      {tier.decal.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#10261a] flex justify-between items-center text-xs text-[#9db8a8]">
          <span>Rewards reset every 7 consecutive daily check-ins.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
