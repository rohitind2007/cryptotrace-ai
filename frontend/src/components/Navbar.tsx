import React from 'react';
import { Shield, Terminal, Globe, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: 'terminal' | 'investigation' | 'node';
  onSelectTab: (tab: 'terminal' | 'investigation' | 'node') => void;
  status: boolean;
}

export default function Navbar({ activeTab, onSelectTab, status }: NavbarProps) {
  return (
    <header className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 flex justify-between items-center px-3 sm:px-6 py-2 sm:py-2.5 liquid-glass rounded-2xl md:rounded-full border border-white/10 max-w-7xl mx-auto backdrop-blur-xl shadow-lg">
      {/* Brand Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
          <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <span className="font-heading italic font-bold text-xs sm:text-base tracking-wide text-white whitespace-nowrap">
          CryptoTrace <span className="text-cyber-cyan">AI</span>
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-1.5 bg-black/30 p-1 rounded-full border border-white/5 mx-1">
        <button
          onClick={() => onSelectTab('terminal')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-mono transition-all ${
            activeTab === 'terminal'
              ? 'bg-white/10 text-cyber-cyan border border-cyber-cyan/30 shadow-sm'
              : 'text-white/60 hover:text-white border border-transparent'
          }`}
        >
          <Terminal size={12} className="sm:w-[13px] sm:h-[13px]" />
          <span className="inline">Terminal</span>
        </button>

        <button
          onClick={() => onSelectTab('investigation')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-mono transition-all ${
            activeTab === 'investigation'
              ? 'bg-white/10 text-cyber-cyan border border-cyber-cyan/30 shadow-sm'
              : 'text-white/60 hover:text-white border border-transparent'
          }`}
        >
          <Globe size={12} className="sm:w-[13px] sm:h-[13px]" />
          <span className="inline">Trace</span>
        </button>

        <button
          onClick={() => onSelectTab('node')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-mono transition-all ${
            activeTab === 'node'
              ? 'bg-white/10 text-cyber-cyan border border-cyber-cyan/30 shadow-sm'
              : 'text-white/60 hover:text-white border border-transparent'
          }`}
        >
          <Radio size={12} className="sm:w-[13px] sm:h-[13px]" />
          <span className="inline">Node</span>
        </button>
      </nav>

      {/* Live Status Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[7px] uppercase tracking-widest text-white/40 hidden sm:block">Status</span>
          <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider font-mono ${status ? 'text-emerald-400' : 'text-cyber-rose'}`}>
            {status ? 'ONLINE' : 'CONNECTING'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${status ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-400/20' : 'bg-rose-500 ring-2 ring-rose-500/20'}`} />
      </div>
    </header>
  );
}