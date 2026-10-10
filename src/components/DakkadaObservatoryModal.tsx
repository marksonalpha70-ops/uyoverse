import React, { useState, useEffect } from 'react';
import { Building2, Eye, Compass, X, Sparkles } from 'lucide-react';

interface DakkadaObservatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DakkadaObservatoryModal: React.FC<DakkadaObservatoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isElevatorMoving, setIsElevatorMoving] = useState(true);
  const [viewpoint, setViewpoint] = useState<'plaza' | 'stadium' | 'airport' | 'ring'>('plaza');

  useEffect(() => {
    if (isOpen) {
      setCurrentFloor(1);
      setIsElevatorMoving(true);
      const timer = setInterval(() => {
        setCurrentFloor((f) => {
          if (f >= 21) {
            clearInterval(timer);
            setIsElevatorMoving(false);
            return 21;
          }
          return f + 1;
        });
      }, 70);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const views = {
    plaza: {
      name: 'West Panorama: Ibom Plaza Central Hub',
      desc: 'Looking down into the heartbeat of Uyo where all 7 major arterial avenues radiate out from the monumental colonnade and stepped water fountains.',
      altitude: '92 Meters Above Street Level',
      coords: '5.0377° N, 7.9128° E',
    },
    stadium: {
      name: 'North-West Panorama: Nest of Champions',
      desc: 'Gazing across to the luminous bowl of Godswill Akpabio International Stadium with its 4 towering floodlight masts and natural turf pitch.',
      altitude: '92 Meters Above Street Level',
      coords: '5.0125° N, 7.8930° E',
    },
    airport: {
      name: 'South-East Panorama: Victor Attah Airport Link',
      desc: 'The sweeping Oron Road corridor leading to the MRO aviation hub and gateway of Ibom Air connecting Akwa Ibom to the world.',
      altitude: '92 Meters Above Street Level',
      coords: '4.8722° N, 8.0877° E',
    },
    ring: {
      name: 'Panoramic Skyline: The Ring Road Expressway',
      desc: 'The outer arterial beltway encircling Uyo capital, dotted with solar streetlights, modern commercial towers, and lush green palm groves.',
      altitude: '92 Meters Above Street Level',
      coords: '360° Panoramic Radial Survey',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#06140c] border border-sky-400 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#081e13]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                Dakkada Tower 21st-Floor Sky Observatory
              </h3>
              <p className="text-xs text-slate-400">Smart High-Rise Glass Observation Deck • Udo Udoma Avenue</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Elevator simulation indicator */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isElevatorMoving ? 'bg-amber-400 animate-ping' : 'bg-[#1fc16b]'}`} />
              <span className="font-orbitron font-bold text-sm text-white">
                {isElevatorMoving ? 'High-Speed Smart Elevator Ascending...' : 'Deck Reached: 21st Floor Top Deck'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-xs text-slate-400">FLOOR</span>
              <span className="font-orbitron font-black text-2xl text-sky-400">{currentFloor}</span>
              <span className="text-xs text-slate-400">/ 21</span>
            </div>
          </div>

          {/* Panoramic Viewport Preview */}
          <div className="relative w-full aspect-[16/8] rounded-2xl bg-gradient-to-br from-[#0c2e1b] via-[#081c11] to-[#041009] border border-sky-400/40 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Viewport HUD Reticle */}
            <div className="absolute inset-4 rounded-xl border border-sky-400/20 pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-sky-400/30 flex items-center justify-center">
                <Compass className="w-6 h-6 text-sky-400/40" />
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
                  OBSERVATORY VIEWPORT
                </span>
                <h4 className="font-orbitron font-bold text-white text-lg mt-1">{views[viewpoint].name}</h4>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                {views[viewpoint].altitude}
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <p className="text-xs text-slate-200 leading-relaxed max-w-xl">{views[viewpoint].desc}</p>
              <span className="text-[10px] font-mono text-amber-300">GPS: {views[viewpoint].coords}</span>
            </div>
          </div>

          {/* Viewpoint Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'plaza', label: 'Ibom Plaza' },
              { id: 'stadium', label: 'Nest of Champions' },
              { id: 'airport', label: 'Airport Corridor' },
              { id: 'ring', label: 'Ring Road Beltway' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewpoint(v.id as typeof viewpoint)}
                className={`py-2 px-3 rounded-xl font-orbitron font-bold text-xs transition-all border ${
                  viewpoint === v.id
                    ? 'bg-sky-500 text-black border-sky-400 shadow-lg'
                    : 'bg-black/40 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
