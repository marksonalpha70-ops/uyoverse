import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Search,
  Sparkles,
  X,
  Edit2,
  Check,
  ChevronUp,
  MapPin,
  Car,
  Flame,
  Zap,
  Target,
} from 'lucide-react';
import { LeaderboardPlayer, LeaderboardTier } from '../types/game';
import {
  getUyoLegendsLeaderboard,
  getTierDetails,
  setPlayerHandle,
  getPlayerHandle,
} from '../utils/leaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  playerXP: number;
  onClose: () => void;
  onJumpToDistrict?: (landmarkName: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  playerXP,
  onClose,
  onJumpToDistrict,
}) => {
  const [handleInput, setHandleInput] = useState(getPlayerHandle());
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'top3' | 'nearby' | LeaderboardTier>('all');
  const userRowRef = useRef<HTMLDivElement>(null);

  const leaderboardData = getUyoLegendsLeaderboard(playerXP, handleInput);
  const { leaderboard, userRank, userEntry, nextLegend, xpToNextRank, totalPlayers } = leaderboardData;
  const userTierDetails = getTierDetails(userEntry.tier);

  useEffect(() => {
    setHandleInput(getPlayerHandle());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveHandle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const saved = setPlayerHandle(handleInput);
    setHandleInput(saved);
    setIsEditingHandle(false);
  };

  const handleScrollToUser = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setTimeout(() => {
      userRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Filtered leaderboard
  const filteredList = leaderboard.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.favoriteVehicle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'top3') return player.rank <= 3;
    if (activeFilter === 'nearby') {
      return Math.abs(player.rank - userRank) <= 2 || player.isUser;
    }
    return player.tier === activeFilter;
  });

  const top3 = leaderboard.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#081f12] via-[#05160d] to-[#040e08] border border-[#1fc16b]/40 rounded-3xl shadow-2xl shadow-[#1fc16b]/20 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#0d2a19] via-[#09351d] to-[#061c10] flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-[#f26522] flex items-center justify-center shadow-lg shadow-amber-500/30 text-black">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#1fc16b]/20 border border-[#1fc16b]/40 text-[#1fc16b]">
                  Global Community Standings
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono">
                  <Flame className="w-3 h-3 text-amber-400" /> Season 1 Active
                </span>
              </div>
              <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white tracking-wide mt-0.5 flex items-center gap-2">
                UYO LEGENDS LEADERBOARD
              </h2>
              <p className="text-slate-300 text-xs hidden sm:block">
                Top drivers across Akwa Ibom ranked by total street XP & cultural exploration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Standing Hero Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#072615] to-[#051c0f] border-b border-[#1fc16b]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Driver info */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#1fc16b] text-black font-orbitron font-black flex flex-col items-center justify-center shadow-lg shadow-[#1fc16b]/30">
                  <span className="text-[10px] uppercase font-bold leading-none">Rank</span>
                  <span className="text-xl font-black">#{userRank}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 text-sm">{userTierDetails.badge}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditingHandle ? (
                    <form onSubmit={handleSaveHandle} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        maxLength={24}
                        autoFocus
                        className="px-2.5 py-1 rounded-lg bg-black/80 border border-[#1fc16b] text-white text-xs font-orbitron font-bold focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg bg-[#1fc16b] text-black hover:bg-[#19a55a] transition-all"
                        title="Save Callsign"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-1.5">
                        {userEntry.name}
                        <button
                          onClick={() => setIsEditingHandle(true)}
                          className="text-slate-400 hover:text-[#1fc16b] transition-colors p-1"
                          title="Edit your driver callsign"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1fc16b]/20 border border-[#1fc16b]/40 text-[#1fc16b] font-orbitron font-bold">
                        YOU
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300 mt-1">
                  <span className={`font-orbitron font-bold ${userTierDetails.color}`}>
                    {userTierDetails.label}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[#1fc16b] font-bold">{playerXP.toLocaleString()} XP</span>
                  <span>•</span>
                  <span className="text-slate-400">{userEntry.district}</span>
                </div>
              </div>
            </div>

            {/* Right: Next Rank Gap & Action */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
              <div className="text-left md:text-right">
                {userRank === 1 ? (
                  <div className="text-xs text-amber-300 font-orbitron font-bold flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-400" /> City Grandmaster! Top of Uyo!
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] text-slate-400 flex items-center md:justify-end gap-1 font-space">
                      <Target className="w-3 h-3 text-[#f26522]" /> Next Rank (#{userRank - 1}):
                      <span className="text-white font-bold">{nextLegend?.name}</span>
                    </div>
                    <div className="text-xs font-orbitron font-bold text-amber-300 mt-0.5">
                      +{xpToNextRank.toLocaleString()} XP to overtake
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleScrollToUser}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#1fc16b] hover:text-black border border-white/20 hover:border-transparent text-xs font-orbitron font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                Find My Row
              </button>
            </div>
          </div>
        </div>

        {/* Podium for Top 3 Legends */}
        <div className="p-4 sm:p-5 bg-black/40 border-b border-white/10">
          <h4 className="text-xs font-orbitron font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Top 3 Uyo Grandmasters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((player) => {
              const isFirst = player.rank === 1;
              const isSecond = player.rank === 2;
              const isThird = player.rank === 3;

              return (
                <div
                  key={player.id}
                  className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    player.isUser
                      ? 'bg-[#0a2f1a] border-[#1fc16b] ring-1 ring-[#1fc16b]/50 shadow-lg shadow-[#1fc16b]/20'
                      : isFirst
                      ? 'bg-gradient-to-b from-amber-950/40 to-black/60 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : isSecond
                      ? 'bg-gradient-to-b from-slate-800/40 to-black/60 border-slate-400/40'
                      : 'bg-gradient-to-b from-orange-950/40 to-black/60 border-orange-600/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-orbitron font-black text-xs text-black"
                        style={{ backgroundColor: player.avatarColor }}
                      >
                        {player.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-orbitron font-bold text-xs text-white truncate max-w-[130px]">
                            {player.name}
                          </span>
                          {player.isUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1fc16b] text-black font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                          {player.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isFirst && <Crown className="w-5 h-5 text-amber-400" />}
                      {isSecond && <Medal className="w-5 h-5 text-slate-300" />}
                      {isThird && <Award className="w-5 h-5 text-amber-600" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[11px] truncate max-w-[110px]">
                      {player.district}
                    </span>
                    <span className="font-orbitron font-bold text-[#1fc16b]">
                      {player.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 bg-[#07160d] border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#1fc16b] text-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              All Legends ({totalPlayers})
            </button>
            <button
              onClick={() => setActiveFilter('top3')}
              className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'top3'
                  ? 'bg-amber-400 text-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Podium
            </button>
            <button
              onClick={() => setActiveFilter('nearby')}
              className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'nearby'
                  ? 'bg-[#f26522] text-white'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Near My Rank
            </button>
            <button
              onClick={() => setActiveFilter('legend')}
              className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'legend'
                  ? 'bg-amber-400/30 border border-amber-400 text-amber-300'
                  : 'bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              👑 Legends
            </button>
            <button
              onClick={() => setActiveFilter('diamond')}
              className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'diamond'
                  ? 'bg-cyan-400/30 border border-cyan-400 text-cyan-300'
                  : 'bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              💎 Diamond
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver or district..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1fc16b]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2 max-h-[460px]">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Trophy className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-orbitron">No drivers found matching your search</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredList.map((player) => {
              const tierInfo = getTierDetails(player.tier);
              const isPodium = player.rank <= 3;

              return (
                <div
                  key={player.id}
                  ref={player.isUser ? userRowRef : undefined}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    player.isUser
                      ? 'bg-gradient-to-r from-[#0a351e] to-[#072414] border-[#1fc16b] shadow-xl shadow-[#1fc16b]/20 ring-2 ring-[#1fc16b]/40 scale-[1.01]'
                      : 'bg-black/40 hover:bg-[#07190e] border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Left: Rank, Avatar, Name & Title */}
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl font-orbitron font-black text-xs flex items-center justify-center shrink-0 ${
                        player.rank === 1
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-500/30'
                          : player.rank === 2
                          ? 'bg-slate-300 text-black'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-white/5 border border-white/10 text-slate-300'
                      }`}
                    >
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </div>

                    {/* Driver Icon */}
                    <div
                      className="w-10 h-10 rounded-xl font-orbitron font-bold text-sm text-black flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.name[0]}
                    </div>

                    {/* Driver details */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-orbitron font-bold text-sm text-white">
                          {player.name}
                        </span>
                        {player.isUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1fc16b] text-black font-black uppercase tracking-wider">
                            YOU
                          </span>
                        )}
                        <span className={`text-[10px] font-orbitron font-semibold ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="text-slate-300">{player.title}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-[#1fc16b]" />
                          {player.district}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400 hidden md:inline-flex">
                          <Car className="w-3 h-3 text-sky-400" />
                          {player.favoriteVehicle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: XP & Missions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-space block">
                        Completed Missions
                      </span>
                      <span className="text-xs font-mono text-slate-200">
                        {player.missionsCompleted} Objectives
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-space block">
                        Total XP
                      </span>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-base font-orbitron font-black text-[#1fc16b]">
                          {player.xp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-3.5 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1fc16b] animate-ping" />
            <span>Leaderboard syncs in real-time with street mission achievements and daily rewards.</span>
          </div>
          <div className="font-orbitron text-slate-300 text-[11px]">
            Akwa Ibom State Tourism & Digital Metaverse League
          </div>
        </div>
      </div>
    </div>
  );
};
