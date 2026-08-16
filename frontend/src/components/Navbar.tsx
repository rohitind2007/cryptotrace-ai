import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Terminal, Globe, Radio, Activity, RefreshCw, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: 'terminal' | 'investigation' | 'node';
  onSelectTab: (tab: 'terminal' | 'investigation' | 'node') => void;
  status: boolean;
  onOpenDatabase?: () => void;
}

export default function Navbar({ activeTab, onSelectTab, status, onOpenDatabase }: NavbarProps) {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Measure actual round-trip HTTP ping to the server/Ethereum health endpoint
  const checkPing = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/health?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const duration = Math.round(performance.now() - start);
        setLatencyMs(duration);
      } else {
        setLatencyMs(null);
      }
    } catch {
      setLatencyMs(null);
    } finally {
      setIsPinging(false);
    }
  }, []);

  // Run ping on mount and poll every 8 seconds
  useEffect(() => {
    checkPing();
    const interval = setInterval(checkPing, 8000);
    return () => clearInterval(interval);
  }, [checkPing]);

  return (
    <header className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 liquid-glass rounded-2xl md:rounded-full border border-white/10 max-w-[1600px] mx-auto backdrop-blur-xl shadow-2xl">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 animate-glow-cyan">
          <Shield size={18} className="sm:w-5 sm:h-5" />
        </div>
        <span className="font-heading italic font-bold text-sm sm:text-lg tracking-wide text-white whitespace-nowrap">
          CryptoTrace <span className="gradient-text">AI</span>
        </span>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-2 bg-black/40 p-1 sm:p-1.5 rounded-full border border-white/5">
        <button
          onClick={() => onSelectTab('terminal')}
          className={`flex items-center gap-2 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-mono font-medium transition-all duration-300 ${
            activeTab === 'terminal'
              ? 'bg-white/10 text-cyber-cyan border border-cyber-cyan/40 glow-border-cyan'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Terminal size={15} />
          <span>Terminal</span>
        </button>

        <button
          onClick={() => onSelectTab('investigation')}
          className={`flex items-center gap-2 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-mono font-medium transition-all duration-300 ${
            activeTab === 'investigation'
              ? 'bg-white/10 text-cyber-cyan border border-cyber-cyan/40 glow-border-cyan'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Globe size={15} />
          <span>Trace</span>
        </button>

        <button
          onClick={() => onSelectTab('node')}
          className={`flex items-center gap-2 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-mono font-medium transition-all duration-300 ${
            activeTab === 'node'
              ? 'bg-white/10 text-cyber-cyan border border-cyber-cyan/40 glow-border-cyan'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Radio size={15} />
          <span>Node</span>
        </button>
      </nav>

      {/* Right Controls: Database Explorer + Ping Badge + Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Neon SQL Table Explorer Button */}
        {onOpenDatabase && (
          <button
            onClick={onOpenDatabase}
            title="Open Neon PostgreSQL Explorer"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30 transition-all duration-300 text-xs font-mono group cursor-pointer glow-border-cyan hover:scale-[1.03]"
          >
            <Database size={13} className="text-cyber-cyan group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-bold hidden sm:inline">Neon SQL</span>
          </button>
        )}

        {/* Interactive Ping Response Button */}
        <button
          onClick={checkPing}
          title="Click to test live Ethereum RPC ping"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/40 border border-white/10 hover:border-cyber-cyan/40 hover:bg-white/5 transition-all duration-300 text-xs font-mono group cursor-pointer hover:glow-border-cyan"
        >
          <Activity
            size={13}
            className={`${
              latencyMs !== null && latencyMs < 120
                ? 'text-emerald-400'
                : latencyMs !== null && latencyMs < 300
                ? 'text-yellow-400'
                : 'text-rose-400'
            } group-hover:scale-110 transition-transform`}
          />
          <span className="text-[10px] sm:text-xs font-bold text-white/90">
            {latencyMs !== null ? `${latencyMs}ms` : '---'}
          </span>
          <RefreshCw
            size={11}
            className={`text-white/30 group-hover:text-cyber-cyan transition-colors ${isPinging ? 'animate-spin' : ''}`}
          />
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-widest text-white/40 hidden sm:block">Status</span>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider font-mono ${status ? 'text-emerald-400' : 'text-cyber-rose'}`}>
              {status ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            status
              ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
              : 'bg-rose-500 ring-4 ring-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
          }`} />
        </div>
      </div>
    </header>
  );
}