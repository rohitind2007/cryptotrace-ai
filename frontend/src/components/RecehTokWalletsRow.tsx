import React, { useState } from 'react';
import { Plus, Zap, Layers, Activity, Copy, Check, Search, Globe, ArrowRight, Wallet } from 'lucide-react';

interface WalletsRowProps {
  volumeEth: number;
  txCount: number;
  blockNumber: string | number;
  onFilterVolume?: () => void;
  onFilterLatest?: () => void;
  onSelectProbeAddress?: (address: string) => void;
  activeFilter?: 'all' | 'high_volume' | 'flagged';
}

export default function RecehTokWalletsRow({
  volumeEth,
  txCount,
  blockNumber,
  onFilterVolume,
  onFilterLatest,
  onSelectProbeAddress,
  activeFilter,
}: WalletsRowProps) {
  const [isProbeModalOpen, setIsProbeModalOpen] = useState(false);
  const [probeInput, setProbeInput] = useState('');
  const [copiedBlock, setCopiedBlock] = useState(false);

  const presets = [
    { label: "Vitalik Buterin", desc: "Ethereum Co-Founder (Whale Wallet)", address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", tag: "Whale Wallet", color: "text-cyan-300" },
    { label: "Tornado.Cash Mixer", desc: "Privacy Mixer (Flagged for Money Laundering)", address: "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc", tag: "Suspicious", color: "text-rose-400" },
    { label: "Uniswap Exchange", desc: "Decentralized Crypto Swap Protocol", address: "0xe592427a0aece92de3edee1f18e0157c05861564", tag: "DEX Exchange", color: "text-emerald-400" },
    { label: "Binance Hot Wallet", desc: "Major Centralized Exchange Inflow", address: "0x28c6c06298d514db089934071355e5743bf21d60", tag: "Binance CEX", color: "text-amber-400" },
  ];

  const handleCopyBlock = () => {
    navigator.clipboard.writeText(String(blockNumber));
    setCopiedBlock(true);
    setTimeout(() => setCopiedBlock(false), 1500);
  };

  const handleProbeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (probeInput.trim() && onSelectProbeAddress) {
      onSelectProbeAddress(probeInput.trim());
      setIsProbeModalOpen(false);
      setProbeInput('');
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full select-none">
      <div className="flex justify-between items-center px-1">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/40">
          WALLETS & ACTIVE METRICS
        </span>
        <span className="text-[10px] font-mono text-cyan-400/60 hidden sm:inline">
          Click cards to filter • Click Track Wallet to inspect any address
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Active Cyan Card (Click to filter by High Volume) */}
        <button
          type="button"
          onClick={onFilterVolume}
          aria-label={`Toggle High Volume filter. Current volume: ${volumeEth.toFixed(4)} ETH`}
          className={`p-4 rounded-[1.8rem] text-slate-950 flex items-center justify-between shadow-[0_10px_25px_rgba(0,210,255,0.3)] transition-[transform,box-shadow,background-color] duration-200 cursor-pointer hover:scale-[1.02] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            activeFilter === 'high_volume'
              ? 'bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] ring-2 ring-white text-white'
              : 'bg-gradient-to-tr from-[#00b4db] to-[#00d2ff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/15 flex items-center justify-center font-bold text-base shadow-inner shrink-0">
              <span className="font-heading font-black">₿</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold font-mono tracking-tight text-black tabular-nums">
                {volumeEth.toFixed(4)} <span className="text-xs font-semibold">ETH</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-900/80">
                <svg width="24" height="12" viewBox="0 0 24 12" className="overflow-visible stroke-current fill-none" aria-hidden="true">
                  <path d="M0,10 Q6,2 12,6 T24,2" strokeWidth="2" />
                </svg>
                <span className="tabular-nums">+12.5% Inflow</span>
              </div>
            </div>
          </div>
        </button>

        {/* 2. Dark Scanned Units Card (Click to show all latest) */}
        <button
          type="button"
          onClick={onFilterLatest}
          aria-label={`Show all latest units. Current count: ${txCount} units`}
          className={`p-4 rounded-[1.8rem] bg-[#1b1c33] border flex items-center justify-between text-white shadow-lg transition-[transform,background-color,border-color] duration-200 cursor-pointer hover:scale-[1.02] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            activeFilter === 'all' ? 'border-cyan-400/50 bg-[#23243f]' : 'border-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-300 shrink-0">
              <Zap size={18} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold font-mono tracking-tight text-white tabular-nums">
                {txCount} <span className="text-xs font-normal text-white/50">Units</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-rose-400">
                <svg width="24" height="12" viewBox="0 0 24 12" className="overflow-visible stroke-current fill-none" aria-hidden="true">
                  <path d="M0,2 Q6,10 12,6 T24,10" strokeWidth="2" />
                </svg>
                <span className="tabular-nums">-5.23% Gas</span>
              </div>
            </div>
          </div>
        </button>

        {/* 3. Dark Block Height Card (Click to copy Block Number) */}
        <button
          type="button"
          onClick={handleCopyBlock}
          aria-label={`Block height ${blockNumber}. Click to copy block number`}
          className="p-4 rounded-[1.8rem] bg-[#1b1c33] border border-white/5 hover:border-purple-400/40 flex items-center justify-between text-white shadow-lg transition-[transform,border-color] duration-200 cursor-pointer hover:scale-[1.02] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 shrink-0">
              {copiedBlock ? <Check size={18} className="text-emerald-400" aria-hidden="true" /> : <Layers size={18} aria-hidden="true" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold font-mono tracking-tight text-white truncate max-w-[120px] tabular-nums">
                #{blockNumber}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400">
                <span className="tabular-nums">{copiedBlock ? "Copied!" : "+39.69% Sync"}</span>
              </div>
            </div>
          </div>
          <Copy size={12} className="text-white/20 hover:text-white shrink-0" aria-hidden="true" />
        </button>

        {/* 4. Dashed Track Wallet Card */}
        <button
          type="button"
          onClick={() => setIsProbeModalOpen(true)}
          aria-label="Open Track Wallet Inspector modal"
          className="p-4 rounded-[1.8rem] border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 flex items-center justify-center gap-2 text-cyan-300 transition-[border-color,background-color] duration-200 cursor-pointer group shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300 text-cyan-400" aria-hidden="true" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            + Track Wallet
          </span>
        </button>
      </div>

      {/* Simple & Easy-to-Understand Wallet Tracker Modal */}
      {isProbeModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 modal-dialog-contain"
          role="dialog"
          aria-modal="true"
          aria-labelledby="track-wallet-title"
        >
          <div className="w-full max-w-lg bg-[#1b1c33] border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                  <Wallet size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 id="track-wallet-title" className="font-heading font-bold text-white text-base">Track Any Ethereum Wallet</h3>
                  <p className="text-xs text-white/50">See where its crypto came from and where it was sent</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProbeModalOpen(false)}
                aria-label="Close track wallet modal"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                ✕
              </button>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleProbeSubmit} className="flex flex-col gap-2">
              <label htmlFor="probe-wallet-input" className="text-[11px] font-mono text-white/60">
                Paste any wallet or contract address:
              </label>
              <div className="relative flex items-center">
                <input
                  id="probe-wallet-input"
                  type="text"
                  placeholder="0x…"
                  value={probeInput}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setProbeInput(e.target.value)}
                  className="w-full pl-4 pr-24 py-3 bg-[#131424] border border-white/10 focus:border-cyan-400 rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 rounded-lg bg-[#00d2ff] hover:bg-[#00b4db] text-black font-bold text-xs font-mono cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Track Now
                </button>
              </div>
            </form>

            {/* Simple Preset Demos */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Or pick an example wallet to test:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.address}
                    type="button"
                    onClick={() => {
                      if (onSelectProbeAddress) onSelectProbeAddress(preset.address);
                      setIsProbeModalOpen(false);
                    }}
                    aria-label={`Select preset: ${preset.label} (${preset.tag})`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#23243f]/60 hover:bg-[#23243f] border border-white/5 hover:border-cyan-500/30 text-left transition-colors duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        {preset.label}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {preset.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-mono font-bold tabular-nums ${preset.color}`}>
                        {preset.tag}
                      </span>
                      <ArrowRight size={13} className="text-white/30 group-hover:text-white" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
