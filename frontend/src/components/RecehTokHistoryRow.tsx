import React from 'react';
import { TransactionPayload } from '../types';
import { ArrowUpRight, Zap, ShieldAlert, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

interface HistoryRowProps {
  transactions: TransactionPayload[];
  onSelectTx: (tx: TransactionPayload) => void;
  onOpenReport: (tx: TransactionPayload) => void;
  activeMode?: 'history' | 'trend';
  onToggleMode?: (mode: 'history' | 'trend') => void;
}

export default function RecehTokHistoryRow({
  transactions,
  onSelectTx,
  onOpenReport,
  activeMode = 'history',
  onToggleMode,
}: HistoryRowProps) {
  const sortedTxs = activeMode === 'trend'
    ? [...transactions].sort((a, b) => (Number(b.value_eth) || 0) - (Number(a.value_eth) || 0))
    : transactions;

  const latest = sortedTxs[0];
  if (!latest) return null;

  return (
    <section 
      aria-label="Transaction Feed Highlight"
      className="w-full flex flex-col gap-2.5 select-none"
    >
      <div className="flex justify-between items-center px-1">
        {/* Toggle Mode Tabs (TREND vs HISTORY) */}
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold" role="tablist" aria-label="Transaction sort mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'trend'}
            aria-label="Sort by High Volume Trend"
            onClick={() => onToggleMode && onToggleMode('trend')}
            className={`px-3 py-1 rounded-full cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeMode === 'trend'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                : 'text-white/40 hover:text-white border border-transparent'
            }`}
          >
            🔥 TREND (HIGH VOL)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'history'}
            aria-label="Sort by Live Stream History"
            onClick={() => onToggleMode && onToggleMode('history')}
            className={`px-3 py-1 rounded-full cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeMode === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                : 'text-white/40 hover:text-white border border-transparent'
            }`}
          >
            ⏱ HISTORY (LIVE STREAM)
          </button>
        </div>

        <span className="text-[10px] font-mono text-white/40 tabular-nums">
          Showing {transactions.length} Units (Click card to focus wave • Click Inspect for dossier)
        </span>
      </div>

      {/* RecehTok Transaction Pill Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectTx(latest)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectTx(latest);
          }
        }}
        aria-label={`Select transaction ${latest.tx_hash.slice(0, 10)}. Value: ${Number(latest.value_eth || 0).toFixed(4)} ETH`}
        className="p-4 rounded-[1.8rem] bg-[#1b1c33] hover:bg-[#23243f] border border-white/5 hover:border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 transition-[transform,background-color,border-color] duration-200 cursor-pointer group shadow-xl hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Crypto Icon Chip */}
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyber-cyan flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Zap size={20} aria-hidden="true" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors duration-200 truncate">
              {latest.to ? `Transfer to ${latest.to.slice(0, 12)}…${latest.to.slice(-6)}` : 'Smart Contract Execution'}
            </span>
            <span className="text-[10px] font-mono text-white/40 truncate mt-0.5 tabular-nums">
              Hash: {latest.tx_hash.slice(0, 18)}… • Block #{latest.block_number}
            </span>
          </div>
        </div>

        {/* Right Info: Value, Risk, and Actions */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex flex-col items-end mr-1">
            <span className="font-bold text-white text-sm tabular-nums">
              {Number(latest.value_eth || 0).toFixed(4)} ETH
            </span>
            <span className="text-[10px] text-white/30 tabular-nums">
              Gas: {latest.gas_price_gwei || '18'} Gwei
            </span>
          </div>

          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tabular-nums ${
            latest.is_suspicious || (latest.risk_score || 0) >= 60
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_8px_#f43f5e]'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {latest.is_suspicious ? 'HIGH RISK' : '-5.23%'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReport(latest);
            }}
            aria-label={`Inspect forensic report for ${latest.tx_hash.slice(0, 8)}`}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Inspect
          </button>
        </div>
      </div>
    </section>
  );
}
