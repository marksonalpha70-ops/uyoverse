import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running standalone or installed, hide quiet button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android native prompt flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#22c55e]/40 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
        title="Install Uyoverse App onto device"
        aria-label="Install App"
      >
        <Download className="w-3.5 h-3.5 text-[#22c55e]" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari or desktop browser fallback guide modal
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#22c55e]/40 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
        title="Install Uyoverse App onto device"
        aria-label="Install App Guide"
      >
        <Download className="w-3.5 h-3.5 text-[#22c55e]" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#0a1a10] border border-white/10 p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#22c55e]" />
                Install Uyoverse
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close install modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#9db8a8] leading-relaxed">
              Launch directly from your home screen for fullscreen immersion:
            </p>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs text-slate-200">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button in Safari's bottom bar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                    <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                    <span>Tap <strong>Add</strong> at top right to complete.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                    <span>On Chrome/Edge, click the <strong>Install</strong> icon in the address bar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                    <span>On Android, open browser menu <strong>(⋮)</strong> and tap <strong>Add to Home screen</strong>.</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-display font-bold text-xs cursor-pointer transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
