import React, { useState } from 'react';
import { ONLINE_DRIVERS } from '../data/gameData';
import {
  Users,
  MessageSquare,
  Send,
  Signal,
  Trophy,
  MapPin,
  Radio,
  ShieldCheck,
  Crown,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import { getUyoLegendsLeaderboard, getTierDetails } from '../utils/leaderboard';

interface CommunityLobbyViewProps {
  playerXP: number;
  playerCoins: number;
  onJumpToDriver: (x: number, z: number) => void;
  onOpenLeaderboard?: () => void;
}

export const CommunityLobbyView: React.FC<CommunityLobbyViewProps> = ({
  playerXP,
  playerCoins,
  onJumpToDriver,
  onOpenLeaderboard,
}) => {
  const [lobbyTab, setLobbyTab] = useState<'shard' | 'leaderboard'>('shard');
  const [messages, setMessages] = useState([
    { sender: 'Bassey_Drift_Pro', text: 'Convoy meeting at Ibom Plaza fountain at 9:00 PM! 🚗💨', time: '2m ago' },
    { sender: 'UyoKekeQueen', text: 'Picking up passengers from UniUyo Town Campus gate.', time: '1m ago' },
    { sender: 'Ibom_Speedster', text: 'New lap record on Wellington Bassey Way: 44.2 seconds! ⚡', time: 'Just now' },
  ]);
  const [inputText, setInputText] = useState('');

  const leaderboardData = getUyoLegendsLeaderboard(playerXP);
  const { leaderboard, userRank, userEntry, nextLegend, xpToNextRank, totalPlayers } = leaderboardData;
  const userTier = getTierDetails(userEntry.tier);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: `${userEntry.name}`, text: inputText.trim(), time: 'Just now' },
    ]);
    setInputText('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071d10] via-[#09351d] to-[#05130b] border border-[#1fc16b]/40 p-8 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1fc16b]/20 border border-[#1fc16b]/40 text-[#1fc16b] text-xs font-semibold">
            <Signal className="w-3.5 h-3.5 text-[#1fc16b] animate-pulse" />
            Uyo Metropolitan Server Shard #01 • 64-Player Dedicated
          </div>
          <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-wide">
            LIVE MULTIPLAYER COMMUNITY LOBBY & UYO LEGENDS
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Connect with fellow Uyo street cruisers, coordinate convoy rallies at Ibom Plaza, challenge drivers to Ring Road drag races, and climb the global Uyo Legends Leaderboard.
          </p>
        </div>

        {/* Server Health Metric */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-space">Server Ping</span>
            <p className="text-sm font-orbitron font-bold text-[#1fc16b] mt-0.5">24 ms (Lagos Node)</p>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-space">Online Drivers</span>
            <p className="text-sm font-orbitron font-bold text-white mt-0.5">5 Active in Shard</p>
          </div>
          <div
            onClick={onOpenLeaderboard}
            className="p-3 rounded-2xl bg-black/40 border border-[#1fc16b]/40 hover:border-[#1fc16b] cursor-pointer transition-all group hover:bg-[#1fc16b]/10"
            title="Click to view full Uyo Legends Leaderboard"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-space">Your Global Standing</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-orbitron font-bold text-amber-400 mt-0.5 flex items-center gap-1">
              Rank #{userRank} <span className="text-xs text-slate-300">({userTier.label})</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-space">Voice Chat</span>
            <p className="text-sm font-orbitron font-bold text-sky-400 mt-0.5">Spatial 3D Ready</p>
          </div>
        </div>
      </div>

      {/* Lobby Navigation Switcher */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLobbyTab('shard')}
            className={`px-4 py-2 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-2 transition-all cursor-pointer ${
              lobbyTab === 'shard'
                ? 'bg-[#1fc16b] text-black shadow-lg shadow-[#1fc16b]/20'
                : 'bg-black/40 text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Active Drivers ({ONLINE_DRIVERS.length + 1})
          </button>
          <button
            onClick={() => setLobbyTab('leaderboard')}
            className={`px-4 py-2 rounded-2xl text-xs font-orbitron font-bold flex items-center gap-2 transition-all cursor-pointer ${
              lobbyTab === 'leaderboard'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                : 'bg-black/40 text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Uyo Legends Leaderboard (Top {totalPlayers})
          </button>
        </div>

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#1fc16b]/20 border border-white/10 hover:border-[#1fc16b]/50 text-xs font-orbitron font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Open Dedicated Modal
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tab 1: Active Drivers & Chat */}
      {lobbyTab === 'shard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Online Driver Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1fc16b]" />
              Active Drivers in Uyo Metropolitan Area
            </h3>

            <div className="space-y-3">
              {/* Player Card */}
              <div className="p-4 rounded-2xl bg-[#092b16] border border-[#1fc16b] flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1fc16b] text-black font-orbitron font-black flex items-center justify-center text-sm">
                    YOU
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron font-bold text-white text-sm">{userEntry.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1fc16b]/20 text-[#1fc16b] font-bold">
                        RANK #{userRank}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">Total Coins: ₦{playerCoins.toLocaleString()} • XP: {playerXP} ({userTier.label})</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#1fc16b] font-semibold">0 ms • Hosting</span>
              </div>

              {/* Other Online Drivers */}
              {ONLINE_DRIVERS.map((dr) => (
                <div
                  key={dr.id}
                  className="p-4 rounded-2xl bg-[#07170e] border border-white/10 hover:border-[#1fc16b]/50 transition-all flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-orbitron font-bold text-sm text-black"
                      style={{ backgroundColor: dr.color }}
                    >
                      {dr.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-white text-sm">{dr.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 uppercase">
                          {dr.model}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{dr.statusMessage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 hidden sm:inline">26 ms</span>
                    <button
                      onClick={() => onJumpToDriver(dr.x, dr.z)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#1fc16b] hover:text-black font-orbitron font-bold text-xs text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Jump
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Live Shard Chat */}
          <div className="p-5 rounded-3xl bg-[#07190e] border border-white/10 flex flex-col justify-between h-[460px] shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="font-orbitron font-bold text-sm text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#1fc16b]" />
                  Radio Uyo Chat
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#1fc16b] animate-ping" />
              </div>

              {/* Message list */}
              <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                {messages.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-orbitron font-bold text-[#1fc16b]">{m.sender}</span>
                      <span className="text-slate-400 text-[10px]">{m.time}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/10">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Send radio message to drivers..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1fc16b]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#1fc16b] text-black hover:bg-[#19a55a] transition-all flex items-center justify-center shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Tab 2: Full In-Line Uyo Legends Leaderboard */
        <div className="space-y-6">
          {/* User Rank Focus Strip */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#072615] to-[#0a351e] border border-[#1fc16b] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1fc16b] text-black font-orbitron font-black flex flex-col items-center justify-center shadow-lg shadow-[#1fc16b]/30">
                <span className="text-[10px] uppercase font-bold leading-none">Rank</span>
                <span className="text-2xl font-black">#{userRank}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron font-black text-lg text-white">{userEntry.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1fc16b] text-black font-black uppercase">
                    YOU
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <span className={`font-orbitron font-bold ${userTier.color}`}>{userTier.label}</span>
                  <span>•</span>
                  <span className="font-mono text-[#1fc16b] font-bold">{playerXP.toLocaleString()} XP</span>
                  <span>•</span>
                  <span>{userEntry.district}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {nextLegend && (
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-space">Next Target (#{userRank - 1})</span>
                  <span className="text-xs font-orbitron font-bold text-amber-300">
                    +{xpToNextRank.toLocaleString()} XP to overtake {nextLegend.name}
                  </span>
                </div>
              )}
              {onOpenLeaderboard && (
                <button
                  onClick={onOpenLeaderboard}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 font-orbitron font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  Open Full View
                </button>
              )}
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="space-y-3">
            {leaderboard.map((player) => {
              const tierInfo = getTierDetails(player.tier);
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    player.isUser
                      ? 'bg-gradient-to-r from-[#0a351e] to-[#072414] border-[#1fc16b] shadow-xl shadow-[#1fc16b]/20 ring-2 ring-[#1fc16b]/40 scale-[1.01]'
                      : 'bg-[#07170e] hover:bg-[#092215] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl font-orbitron font-black text-sm flex items-center justify-center shrink-0 ${
                        player.rank === 1
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-500/30'
                          : player.rank === 2
                          ? 'bg-slate-300 text-black'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-black/50 border border-white/10 text-slate-300'
                      }`}
                    >
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </div>

                    <div
                      className="w-10 h-10 rounded-xl font-orbitron font-bold text-sm text-black flex items-center justify-center shrink-0"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.name[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-sm text-white">{player.name}</span>
                        {player.isUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1fc16b] text-black font-black uppercase">
                            YOU
                          </span>
                        )}
                        <span className={`text-[10px] font-orbitron font-semibold ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300">{player.title}</span>
                        <span>•</span>
                        <span>{player.district}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-space block">Vehicle</span>
                      <span className="text-xs text-slate-200 font-medium">{player.favoriteVehicle}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-space block">Total XP</span>
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
            })}
          </div>
        </div>
      )}
    </div>
  );
};
