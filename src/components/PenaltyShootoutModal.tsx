import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/AudioSynthesizer';
import { Trophy, Target, Shield, RefreshCw, X, Award } from 'lucide-react';

interface PenaltyShootoutModalProps {
  isOpen: boolean;
  onWinReward: (xp: number, coins: number) => void;
  onClose: () => void;
}

export const PenaltyShootoutModal: React.FC<PenaltyShootoutModalProps> = ({
  isOpen,
  onWinReward,
  onClose,
}) => {
  const [attempts, setAttempts] = useState(0);
  const [goals, setGoals] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState<'TL' | 'BL' | 'C' | 'TR' | 'BR'>('C');
  const [power, setPower] = useState(75);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  if (!isOpen) return null;

  const targetNames: Record<string, string> = {
    TL: 'Top Left Corner',
    BL: 'Bottom Left Corner',
    C: 'Dead Center',
    TR: 'Top Right Corner',
    BR: 'Bottom Right Corner',
  };

  const handleShoot = () => {
    if (gameOver || attempts >= 5) return;

    // AI Goalkeeper guess (1 of 5 zones)
    const zones: ('TL' | 'BL' | 'C' | 'TR' | 'BR')[] = ['TL', 'BL', 'C', 'TR', 'BR'];
    const keeperDive = zones[Math.floor(Math.random() * zones.length)];

    // If keeper guessed correctly and power wasn't optimal, keeper saves!
    const isSaved = keeperDive === selectedTarget && Math.random() > 0.3;
    const isMissed = power > 95 && Math.random() > 0.4; // blasted over bar

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isMissed) {
      setLastResult('Blasted over the crossbar! Miss!');
    } else if (isSaved) {
      setLastResult(`Goalkeeper dived to ${targetNames[keeperDive]} and saved it!`);
    } else {
      setLastResult(`GOAL! Struck into ${targetNames[selectedTarget]}! Crowds roar!`);
      setGoals((g) => g + 1);
      soundEngine.playCheckpointSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1fc16b', '#ffffff', '#f26522'],
      });
    }

    if (nextAttempts >= 5) {
      setGameOver(true);
      const finalGoals = !isMissed && !isSaved ? goals + 1 : goals;
      if (finalGoals >= 3) {
        const rewardXP = finalGoals * 150;
        const rewardCoins = finalGoals * 800;
        onWinReward(rewardXP, rewardCoins);
      }
    }
  };

  const handleReset = () => {
    setAttempts(0);
    setGoals(0);
    setLastResult(null);
    setGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#07190e] border border-[#1fc16b] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1fc16b]/20 text-[#1fc16b]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                Nest of Champions: Penalty Shootout
              </h3>
              <p className="text-xs text-slate-400">Godswill Akpabio International Stadium Pitch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scoreboard */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/50 border border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-space font-semibold">Match Status</span>
              <p className="font-orbitron font-bold text-white text-sm">Super Eagles Cup Tie</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase">Shots</span>
                <p className="font-orbitron font-bold text-white text-lg">{attempts}/5</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase">Goals</span>
                <p className="font-orbitron font-bold text-[#1fc16b] text-lg">{goals}</p>
              </div>
            </div>
          </div>

          {/* Goal Net & Target Selector */}
          <div className="relative w-full aspect-[16/9] rounded-2xl bg-gradient-to-b from-[#143d22] to-[#081e11] border-4 border-white/80 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Net pattern overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Goalkeeper Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce pointer-events-none">
              🧤
            </div>

            {/* Target Selectors */}
            <div className="relative z-10 flex justify-between h-1/2">
              <button
                onClick={() => setSelectedTarget('TL')}
                className={`w-20 h-16 rounded-xl border-2 flex items-center justify-center font-orbitron font-bold text-xs transition-all ${
                  selectedTarget === 'TL' ? 'bg-[#1fc16b] text-black border-white ring-4 ring-[#1fc16b]/50' : 'bg-black/40 text-white border-white/40 hover:bg-white/20'
                }`}
              >
                Top Left
              </button>
              <button
                onClick={() => setSelectedTarget('C')}
                className={`w-20 h-16 rounded-xl border-2 flex items-center justify-center font-orbitron font-bold text-xs transition-all ${
                  selectedTarget === 'C' ? 'bg-[#1fc16b] text-black border-white ring-4 ring-[#1fc16b]/50' : 'bg-black/40 text-white border-white/40 hover:bg-white/20'
                }`}
              >
                Center
              </button>
              <button
                onClick={() => setSelectedTarget('TR')}
                className={`w-20 h-16 rounded-xl border-2 flex items-center justify-center font-orbitron font-bold text-xs transition-all ${
                  selectedTarget === 'TR' ? 'bg-[#1fc16b] text-black border-white ring-4 ring-[#1fc16b]/50' : 'bg-black/40 text-white border-white/40 hover:bg-white/20'
                }`}
              >
                Top Right
              </button>
            </div>

            <div className="relative z-10 flex justify-between h-1/2 items-end">
              <button
                onClick={() => setSelectedTarget('BL')}
                className={`w-20 h-16 rounded-xl border-2 flex items-center justify-center font-orbitron font-bold text-xs transition-all ${
                  selectedTarget === 'BL' ? 'bg-[#1fc16b] text-black border-white ring-4 ring-[#1fc16b]/50' : 'bg-black/40 text-white border-white/40 hover:bg-white/20'
                }`}
              >
                Bottom Left
              </button>
              <button
                onClick={() => setSelectedTarget('BR')}
                className={`w-20 h-16 rounded-xl border-2 flex items-center justify-center font-orbitron font-bold text-xs transition-all ${
                  selectedTarget === 'BR' ? 'bg-[#1fc16b] text-black border-white ring-4 ring-[#1fc16b]/50' : 'bg-black/40 text-white border-white/40 hover:bg-white/20'
                }`}
              >
                Bottom Right
              </button>
            </div>
          </div>

          {/* Last Result Alert */}
          {lastResult && (
            <div className="p-3 rounded-xl bg-black/60 border border-[#1fc16b]/40 text-center text-xs font-semibold text-white">
              {lastResult}
            </div>
          )}

          {/* Shot Controls */}
          {!gameOver ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Shot Power</span>
                  <span className="font-mono font-bold text-[#f26522]">{power}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  className="w-full accent-[#1fc16b]"
                />
              </div>

              <button
                onClick={handleShoot}
                className="w-full py-3 rounded-2xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-sm shadow-xl transition-all"
              >
                ⚽ SHOOT BALL (Attempt {attempts + 1} of 5)
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#092b16] border border-[#1fc16b] text-center space-y-3">
              <h4 className="font-orbitron font-black text-lg text-white">
                Shootout Complete!
              </h4>
              <p className="text-xs text-slate-300">
                You scored {goals} out of 5 penalties against the state goalkeeper!
              </p>
              {goals >= 3 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f26522] text-white font-mono font-bold text-xs">
                  <Award className="w-4 h-4" /> Rewarded +{goals * 150} XP & +₦{(goals * 800).toLocaleString()} Coins!
                </div>
              )}
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" /> Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
