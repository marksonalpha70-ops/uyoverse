import React from 'react';
import { Settings, Volume2, VolumeX, Radio, RotateCcw, Monitor, Smartphone, X, Check } from 'lucide-react';
import { GraphicsQuality, RadioStation } from '../types/game';
import { soundEngine } from '../utils/AudioSynthesizer';

interface GameSettingsModalProps {
  isOpen: boolean;
  graphicsQuality: GraphicsQuality;
  onSetGraphicsQuality: (q: GraphicsQuality) => void;
  onResetVehicle: () => void;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  graphicsQuality,
  onSetGraphicsQuality,
  onResetVehicle,
  onClose,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.isMuteActive());
  const [isRadioOn, setIsRadioOn] = React.useState(soundEngine.isRadioOn());

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleRadio = () => {
    const radioOn = soundEngine.toggleRadio();
    setIsRadioOn(radioOn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#07190e] border border-[#1fc16b] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1fc16b]/20 text-[#1fc16b]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                Game Settings & Controls
              </h3>
              <p className="text-xs text-slate-400">Audio, graphics performance, and control mappings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Graphics Quality */}
          <div className="space-y-2.5">
            <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#1fc16b]" /> Graphics & Performance Preset
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Battery Saver', desc: 'Optimized for entry-level mobile' },
                { id: 'medium', label: 'Balanced 60FPS', desc: 'Smooth frame rate & shadows' },
                { id: 'ultra', label: 'Ultra HD', desc: 'Maximum particles & reflections' },
              ].map((g) => {
                const isActive = graphicsQuality === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => onSetGraphicsQuality(g.id as GraphicsQuality)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-[#1fc16b]/20 border-[#1fc16b] text-white ring-1 ring-[#1fc16b]'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron font-bold text-xs">{g.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#1fc16b]" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio & Radio */}
          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#f26522]" /> Sound & Music
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleToggleMute}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-orbitron font-bold transition-all ${
                  !isMuted
                    ? 'bg-[#1fc16b]/15 border-[#1fc16b]/50 text-white'
                    : 'bg-red-950/20 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {!isMuted ? <Volume2 className="w-4 h-4 text-[#1fc16b]" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                  <span>{isMuted ? 'Muted' : 'Sound Effects ON'}</span>
                </div>
              </button>

              <button
                onClick={handleToggleRadio}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-orbitron font-bold transition-all ${
                  isRadioOn
                    ? 'bg-[#f26522]/20 border-[#f26522] text-white'
                    : 'bg-black/40 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#f26522]" />
                  <span>{isRadioOn ? 'Radio Uyo: ON' : 'Radio Uyo: OFF'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Controls Quick Guide */}
          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
              Controls Quick Reference
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                <span>Accelerate / Walk</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">W / ↑</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                <span>Steer / Turn</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">A / D</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                <span>Brake / Reverse</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">S / ↓</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                <span>Handbrake / Jump</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">Space</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                <span>Nitro Boost / Sprint</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">Shift</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                <span>Exit / Enter Car</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">E</kbd>
              </div>
            </div>
          </div>

          {/* Emergency Reset Car */}
          <div className="pt-2">
            <button
              onClick={() => {
                onResetVehicle();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Vehicle to Ibom Plaza
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#092213] flex justify-between items-center text-[11px] text-slate-400">
          <span>Uyoverse v1.0 • Land of Promise</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-xs shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
