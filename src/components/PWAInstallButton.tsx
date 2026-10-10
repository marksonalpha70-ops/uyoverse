import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1fc16b] hover:bg-[#19a55a] text-black font-orbitron font-bold text-xs shadow-md transition-all active:scale-95"
        title="Install Uyoverse App onto your Device"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#092213] border border-[#1fc16b]/50 text-white font-orbitron font-bold text-xs hover:bg-[#1fc16b]/20 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#1fc16b]" />
          <span className="hidden sm:inline">Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#07190e] border border-[#1fc16b] p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1fc16b]" />
                  Install Uyoverse on iPhone
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                To experience the full fullscreen game without browser address bars:
              </p>
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1fc16b]/20 text-[#1fc16b] flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari navigation bar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1fc16b]/20 text-[#1fc16b] flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1fc16b]/20 text-[#1fc16b] flex items-center justify-center text-[11px] font-bold">3</span>
                  <span>Tap <strong>Add</strong> at top right to launch from home screen!</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#1fc16b] text-black font-orbitron font-bold text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / browser install prompt button
  return (
    <button
      onClick={() => alert("To install Uyoverse as an App on your device:\n\n• On Chrome/Edge: Click the Install icon in the address bar.\n• On Android: Tap Chrome menu (⋮) -> 'Add to Home screen' or 'Install App'.\n• On iPhone: Tap Safari Share -> 'Add to Home Screen'.")}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#092213] border border-[#1fc16b]/50 text-white font-orbitron font-bold text-xs hover:bg-[#1fc16b]/20 transition-all"
      title="Install App Information"
    >
      <Download className="w-3.5 h-3.5 text-[#1fc16b]" />
      <span>Install PWA</span>
    </button>
  );
};
