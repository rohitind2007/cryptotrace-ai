import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X, Smartphone, ArrowRight } from 'lucide-react';

export default function MobileOrientationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('cryptotrace_orientation_dismissed');
    if (isDismissed) return;

    const checkMobilePortrait = () => {
      // 1. Strict Mobile User-Agent check (excludes iPad, Mac, Desktop, Tablets)
      const ua = navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      // 2. Viewport dimensions: narrow phone width & portrait orientation
      const isPortrait = window.innerHeight > window.innerWidth;
      const isPhoneWidth = window.innerWidth < 640 && window.screen.width < 640;

      // 3. Touch capabilities
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Only show if it is genuinely a mobile smartphone in portrait mode
      if (isMobileUA && !isTablet && isPortrait && isPhoneWidth && hasTouch) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobilePortrait();

    window.addEventListener('resize', checkMobilePortrait);
    window.addEventListener('orientationchange', checkMobilePortrait);

    return () => {
      window.removeEventListener('resize', checkMobilePortrait);
      window.removeEventListener('orientationchange', checkMobilePortrait);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('cryptotrace_orientation_dismissed', 'true');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 select-none pointer-events-auto">
        {/* Dark blurred backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-[#0d0e1a]/90 backdrop-blur-lg"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-[#1b1c33] border border-cyan-500/30 rounded-[2.5rem] p-6 shadow-[0_0_35px_rgba(0,210,255,0.25)] overflow-hidden flex flex-col items-center text-center gap-4 z-10"
        >
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff2d87] via-[#00d2ff] to-[#7928ca]" />

          {/* Close 'X' Button */}
          <button
            onClick={handleDismiss}
            aria-label="Close orientation suggestion"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Animated Rotating Phone Device Illustration */}
          <div className="relative mt-2 w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            <motion.div
              animate={{ rotate: [0, 90, 90, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", times: [0, 0.4, 0.8, 1] }}
              className="text-cyan-300"
            >
              <Smartphone size={36} />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#ff2d87] text-white shadow-[0_0_10px_#ff2d87]">
              <RotateCw size={12} className="animate-spin" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-bold font-heading text-white tracking-tight">
              Use Landscape Mode
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans px-2">
              For the best real-time forensics, wave analytics, and live topology graphs, please rotate your device to landscape.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-2 mt-2">
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00d2ff] to-[#00a8ff] hover:from-[#00b4db] hover:to-[#00d2ff] text-black font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(0,210,255,0.4)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Continue in Portrait</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
