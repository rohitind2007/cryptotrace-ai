import React, { useRef, useEffect } from 'react';
import { TransactionPayload } from '../types';
import { ArrowUpRight, Hash } from 'lucide-react';

interface LiveFeedProps {
  transactions: TransactionPayload[];
  onSelectTx: (tx: TransactionPayload) => void;
  onOpenReport: (tx: TransactionPayload) => void;
}

export default function LiveFeedTable({ transactions, onSelectTx, onOpenReport }: LiveFeedProps) {
  // Track previously seen hashes to know which rows are "new"
  const seenHashes = useRef<Set<string>>(new Set());
  const newHashes = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentNew = new Set<string>();
    transactions.forEach((tx) => {
      if (!seenHashes.current.has(tx.tx_hash)) {
        currentNew.add(tx.tx_hash);
        seenHashes.current.add(tx.tx_hash);
      }
    });
    newHashes.current = currentNew;
  }, [transactions]);

  return (
    <div className="liquid-glass rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col h-full border border-white/5 shadow-xl">
      {/* Gradient header accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />

      {/* Scrollable Container */}
      <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[540px] md:min-w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] sticky top-0 backdrop-blur-md z-10">
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                Tx Hash
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                Origin / Target
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                Value
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                Risk Score
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-xs font-mono text-white/30">
                  <span className="shimmer-bg inline-block px-6 py-2 rounded-lg">
                    Scanning live blocks for incoming transactions...
                  </span>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isNew = newHashes.current.has(tx.tx_hash);
                return (
                  <tr
                    key={tx.tx_hash}
                    onClick={() => onSelectTx(tx)}
                    className={`group cursor-pointer hover:bg-cyber-cyan/[0.04] transition-colors duration-300 ${
                      isNew ? 'row-flash-new' : ''
                    }`}
                  >
                    {/* Transaction Hash */}
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 md:py-4 font-mono text-[11px] md:text-xs text-cyber-cyan/90 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Hash size={11} className="text-white/20 shrink-0" />
                        <span>{tx.tx_hash ? `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` : "—"}</span>
                      </div>
                    </td>

                    {/* Origin / Target */}
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 md:py-4 whitespace-nowrap">
                      <div className="text-[11px] md:text-xs font-mono font-medium text-white/90">
                        {tx.from ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : "—"}
                      </div>
                      <div className="text-[9px] md:text-[10px] font-mono text-white/40">
                        ➔ {tx.to && tx.to !== "Contract Deployment" ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : "Contract"}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 md:py-4 text-[11px] md:text-xs font-mono font-bold text-white tracking-tight whitespace-nowrap">
                      {Number(tx.value_eth || 0).toFixed(3)} ETH
                    </td>

                    {/* Risk Score Meter */}
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 md:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-12 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              tx.risk_score > 70 ? 'bg-cyber-rose shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                              : tx.risk_score > 30 ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]'
                              : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, tx.risk_score))}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${
                          tx.risk_score > 70 ? 'text-cyber-rose' : tx.risk_score > 30 ? 'text-orange-400' : 'text-emerald-400'
                        }`}>
                          {tx.risk_score}%
                        </span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 md:py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReport(tx);
                        }}
                        title="Open Forensic Dossier"
                        className="p-1.5 md:p-2 rounded-full liquid-glass text-white/70 hover:text-cyber-cyan hover:glow-border-cyan transition-all duration-300 cursor-pointer inline-flex items-center justify-center"
                      >
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}