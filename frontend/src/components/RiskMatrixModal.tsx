import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Zap } from 'lucide-react';
import { TransactionPayload } from '../types';

interface RiskMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionPayload[];
  onSelectTx: (tx: TransactionPayload) => void;
  onOpenReport: (tx: TransactionPayload) => void;
}

export default function RiskMatrixModal({
  isOpen,
  onClose,
  transactions,
  onSelectTx,
  onOpenReport,
}: RiskMatrixModalProps) {
  const [sortBy, setSortBy] = useState<'buffer' | 'highest' | 'lowest'>('buffer');
  const [hoveredTx, setHoveredTx] = useState<TransactionPayload | null>(null);

  if (!isOpen) return null;

  const sortedTxs = [...transactions].sort((a, b) => {
    const riskA = Number(a.risk_score) || (a.is_suspicious ? 75 : 15);
    const riskB = Number(b.risk_score) || (b.is_suspicious ? 75 : 15);
    if (sortBy === 'highest') return riskB - riskA;
    if (sortBy === 'lowest') return riskA - riskB;
    return 0; // buffer order
  });

  const criticalCount = transactions.filter((t) => (t.risk_score || 0) >= 70 || t.is_suspicious).length;
  const mediumCount = transactions.filter((t) => (t.risk_score || 0) >= 40 && (t.risk_score || 0) < 70 && !t.is_suspicious).length;
  const lowCount = transactions.filter((t) => (t.risk_score || 0) < 40 && !t.is_suspicious).length;
  const avgRisk = transactions.length > 0
    ? Math.round(transactions.reduce((acc, t) => acc + (Number(t.risk_score) || (t.is_suspicious ? 75 : 15)), 0) / transactions.length)
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0d0e1a]/85 backdrop-blur-md"
        />

        {/* Matrix Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="w-full max-w-4xl max-h-[90vh] bg-[#1b1c33] rounded-[2.5rem] relative border border-white/10 overflow-hidden shadow-2xl z-10 flex flex-col select-none"
        >
          {/* Top Accent Gradient */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#ff2d87] via-[#9b51e0] to-[#00d2ff]" />

          {/* Header */}
          <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-[#171829]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyber-cyan">
                <Grid size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                  <span>Buffer Risk Heatmap Matrix</span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {transactions.length} Buffered Units
                  </span>
                </h2>
                <p className="text-xs text-white/40 font-mono">
                  Live IsolationForest risk score distribution of active memory buffer
                </p>
              </div>
            </div>

            {/* Sorting & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#131424] p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setSortBy('buffer')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'buffer' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Live Order
                </button>
                <button
                  onClick={() => setSortBy('highest')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'highest' ? 'bg-[#ff2d87]/20 text-[#ff2d87] font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  High Risk First
                </button>
                <button
                  onClick={() => setSortBy('lowest')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'lowest' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Lowest First
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Telemetry Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#131424] border-b border-white/5 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[#1b1c33] border border-white/5 flex items-center justify-between">
              <span className="text-white/40 text-[10px] uppercase">Avg Risk</span>
              <span className="text-base font-bold text-cyan-300">{avgRisk}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#1b1c33] border border-[#ff2d87]/30 flex items-center justify-between">
              <span className="text-[#ff2d87] text-[10px] uppercase">Critical (≥70%)</span>
              <span className="text-base font-bold text-[#ff2d87]">{criticalCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#1b1c33] border border-amber-500/30 flex items-center justify-between">
              <span className="text-amber-400 text-[10px] uppercase">Medium (40-69%)</span>
              <span className="text-base font-bold text-amber-400">{mediumCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#1b1c33] border border-emerald-500/30 flex items-center justify-between">
              <span className="text-emerald-400 text-[10px] uppercase">Low (&lt;40%)</span>
              <span className="text-base font-bold text-emerald-400">{lowCount}</span>
            </div>
          </div>

          {/* 10x10 Heatmap Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#131424]">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
              {sortedTxs.map((tx, idx) => {
                const risk = Number(tx.risk_score) || (tx.is_suspicious ? 75 : 15);
                const isCritical = risk >= 70 || tx.is_suspicious;
                const isMedium = risk >= 40 && risk < 70;

                let cellBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30';
                if (isCritical) {
                  cellBg = 'bg-[#ff2d87]/25 border-[#ff2d87]/60 text-[#ff2d87] hover:bg-[#ff2d87]/40 shadow-[0_0_12px_rgba(255,45,135,0.3)] animate-pulse';
                } else if (isMedium) {
                  cellBg = 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/35';
                }

                return (
                  <button
                    key={tx.tx_hash || idx}
                    onMouseEnter={() => setHoveredTx(tx)}
                    onClick={() => {
                      onSelectTx(tx);
                      onClose();
                    }}
                    className={`h-14 rounded-2xl border flex flex-col items-center justify-center p-1 transition-all duration-200 cursor-pointer group hover:scale-105 ${cellBg}`}
                    title={`Tx: ${tx.tx_hash.slice(0, 10)}... | Value: ${tx.value_eth} ETH | Risk: ${risk}%`}
                  >
                    <span className="text-xs font-black font-mono tracking-tight">
                      {risk}%
                    </span>
                    <span className="text-[8px] font-mono text-white/50 truncate max-w-[48px]">
                      {Number(tx.value_eth || 0).toFixed(2)}E
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Inspector Bar (Updates on Cell Hover) */}
          <div className="p-4 border-t border-white/5 bg-[#171829] flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
            {hoveredTx ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-white/60">
                  Target: <strong className="text-white">{hoveredTx.from.slice(0, 8)}...{hoveredTx.from.slice(-6)}</strong>
                </span>
                <span className="text-cyan-300">
                  {Number(hoveredTx.value_eth || 0).toFixed(4)} ETH
                </span>
                <span className="text-white/40">
                  Block #{hoveredTx.block_number}
                </span>
              </div>
            ) : (
              <span className="text-white/40">
                Hover over any matrix cell to preview details • Click to focus in Wave Chart
              </span>
            )}

            {hoveredTx && (
              <button
                onClick={() => {
                  onOpenReport(hoveredTx);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyber-cyan font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Inspect Dossier</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
