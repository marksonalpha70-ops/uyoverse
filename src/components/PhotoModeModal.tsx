import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Sliders, Sparkles, X, Check, Image as ImageIcon } from 'lucide-react';
import { PhotoFilter, VehicleState } from '../types/game';

interface PhotoModeModalProps {
  isOpen: boolean;
  vehicleState: VehicleState;
  onClose: () => void;
}

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({
  isOpen,
  vehicleState,
  onClose,
}) => {
  const [filter, setFilter] = useState<PhotoFilter>('golden');
  const [showWatermark, setShowWatermark] = useState(true);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Capture current WebGL canvas
      const webglCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (webglCanvas) {
        try {
          const dataUrl = webglCanvas.toDataURL('image/jpeg', 0.95);
          setSnapshotUrl(dataUrl);
        } catch {
          // fallback
        }
      }
    }
  }, [isOpen]);

  // Render composite on canvas with watermark and filter
  useEffect(() => {
    if (!snapshotUrl || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = snapshotUrl;
    img.onload = () => {
      canvas.width = img.width || 1280;
      canvas.height = img.height || 720;

      // Draw base photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply Post Filter
      if (filter === 'golden') {
        ctx.fillStyle = 'rgba(255, 140, 0, 0.16)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (filter === 'neon') {
        ctx.fillStyle = 'rgba(31, 193, 107, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (filter === 'vintage') {
        ctx.fillStyle = 'rgba(112, 66, 20, 0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (filter === 'harmattan') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Official Watermark Badge
      if (showWatermark) {
        const wY = canvas.height - 70;
        ctx.fillStyle = 'rgba(5, 14, 8, 0.85)';
        ctx.roundRect(30, wY, 320, 50, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#1fc16b';
        ctx.lineWidth = 1.5;
        ctx.roundRect(30, wY, 320, 50, 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('UYOVERSE 3D', 50, wY + 28);

        ctx.fillStyle = '#f26522';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('LAND OF PROMISE • DIGITAL TWIN', 50, wY + 42);

        // Date & Telemetry
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${vehicleState.speed} KM/H • UYO, NIGERIA`, canvas.width - 40, canvas.height - 30);
      }
    };
  }, [snapshotUrl, filter, showWatermark, vehicleState]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `UYOVERSE-Snapshot-${Date.now()}.jpg`;
    link.href = previewCanvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#07190e] border border-[#1fc16b] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#092213]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1fc16b]/20 text-[#1fc16b]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                Cinematic Photo Studio & Drone Snapshot
              </h3>
              <p className="text-xs text-slate-400">Capture, filter, and export wallpaper moments across Uyo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="relative w-full aspect-[16/9] bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl">
            <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-orbitron font-bold text-white mr-2 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#1fc16b]" /> Filters:
              </span>
              {[
                { id: 'none', label: 'Raw Lens' },
                { id: 'golden', label: 'Golden Hour' },
                { id: 'neon', label: 'Cyberpunk' },
                { id: 'vintage', label: 'Vintage Kodachrome' },
                { id: 'harmattan', label: 'Harmattan Haze' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as PhotoFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all ${
                    filter === f.id
                      ? 'bg-[#1fc16b] text-black shadow-md'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-space text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="accent-[#1fc16b] w-4 h-4 rounded"
              />
              Include Brand Watermark
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#092213] flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">1080p High-Resolution Capture</span>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" /> Download Photo (.JPG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
