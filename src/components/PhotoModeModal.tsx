import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Sliders, X, Share2, Check } from 'lucide-react';
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
  const [shareSuccess, setShareSuccess] = useState(false);
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
        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
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
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.roundRect(30, wY, 320, 50, 12);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('UYOVERSE 3D', 50, wY + 28);

        ctx.fillStyle = '#ff6a1a';
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

  const handleShare = async () => {
    if (!previewCanvasRef.current) return;
    try {
      const canvas = previewCanvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'uyoverse-snapshot.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Uyoverse 3D: Land of Promise',
            text: 'Check out my ride cruising through Uyo, Akwa Ibom in Uyoverse 3D!',
            files: [file],
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        } else if (navigator.share) {
          await navigator.share({
            title: 'Uyoverse 3D',
            text: 'Cruising through Uyo, Akwa Ibom in Uyoverse 3D!',
            url: window.location.href,
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        } else {
          // Fallback to download
          handleDownload();
        }
      }, 'image/jpeg', 0.95);
    } catch {
      // User cancelled or unsupported
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0a1a10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#10261a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#22c55e]/20 text-[#22c55e]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Cinematic Photo Mode & Snapshot
              </h3>
              <p className="text-xs text-[#9db8a8]">Capture, filter, download, and share wallpapers across Uyo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close photo studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div className="relative w-full aspect-[16/9] bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl">
            <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-display font-bold text-white mr-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#22c55e]" /> Filter:
              </span>
              {[
                { id: 'none', label: 'Raw' },
                { id: 'golden', label: 'Golden Hour' },
                { id: 'neon', label: 'Cyberpunk' },
                { id: 'vintage', label: 'Vintage' },
                { id: 'harmattan', label: 'Harmattan' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as PhotoFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all cursor-pointer ${
                    filter === f.id
                      ? 'bg-[#22c55e] text-black shadow-md'
                      : 'bg-white/5 border border-white/10 text-[#9db8a8] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="accent-[#22c55e] w-4 h-4 rounded"
              />
              Watermark Badge
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#10261a] flex flex-wrap justify-between items-center gap-3">
          <span className="text-xs text-[#9db8a8] font-mono">1080p WebGL Render</span>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {shareSuccess ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Share2 className="w-4 h-4" />}
              {shareSuccess ? 'Shared!' : 'Share Photo'}
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-display font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download (.JPG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
