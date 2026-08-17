import React, { useRef, useEffect, useState } from 'react';
import { TransactionPayload } from '../types';
import { ArrowUpRight, Hash, ShieldAlert, CheckCircle2, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

interface LiveFeedProps {
  transactions: TransactionPayload[];
  onSelectTx: (tx: TransactionPayload) => void;
  onOpenReport: (tx: TransactionPayload) => void;
}

export default function LiveFeedTable({ transactions, onSelectTx, onOpenReport }: LiveFeedProps) {
  const seenHashes = useRef<Set<string>>(new Set());
  const newHashes = useRef<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'none' | 'value' | 'risk'>('none');
  const [sortAsc, setSortAsc] = useState(false);

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

  // Default display: newest transactions at the top
  const sortedTransactions = React.useMemo(() => {
    if (sortField === 'value') {
      return [...transactions].sort((a, b) => {
        const valA = Number(a.value_eth) || 0;
        const valB = Number(b.value_eth) || 0;
        return sortAsc ? valA - valB : valB - valA;
      });
    }
    if (sortField === 'risk') {
      return [...transactions].sort((a, b) => {
        const riskA = Number(a.risk_score) || (a.is_suspicious ? 75 : 15);
        const riskB = Number(b.risk_score) || (b.is_suspicious ? 75 : 15);
        return sortAsc ? riskA - riskB : riskB - riskA;
      });
    }
    return transactions; // default newest arrival at index 0 (top)
  }, [transactions, sortField, sortAsc]);

  const toggleSort = (field: 'value' | 'risk') => {
    if (sortField === field) {
      if (!sortAsc) {
        setSortAsc(true);
      } else {
        setSortField('none');
        setSortAsc(false);
      }
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-[#1b1c33]/90 backdrop-blur-xl rounded-[2rem] overflow-hidden flex flex-col h-full border border-white/5 shadow-2xl select-none">
      {/* Top Header line with live indicator */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00d2ff]/40 to-transparent" />

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[540px] md:min-w-full">
          <thead>
            <tr className="border-b border-white/5 bg-[#131424]/85 sticky top-0 backdrop-blur-md z-10">
              <th className="px-4 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-white/40 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Tx Hash (Newest at Top)</span>
                </div>
              </th>
              <th className="px-4 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-white/40 whitespace-nowrap">
                Origin / Target
              </th>
              <th
                onClick={() => toggleSort('value')}
                className="px-4 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-white/40 whitespace-nowrap cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Value</span>
                  {sortField === 'value' ? (
                    sortAsc ? <ArrowUp size={11} className="text-cyan-400" /> : <ArrowDown size={11} className="text-cyan-400" />
                  ) : (
                    <ArrowUpDown size={11} className="text-white/20" />
                  )}
                </div>
              </th>
              <th
                onClick={() => toggleSort('risk')}
                className="px-4 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-white/40 whitespace-nowrap cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  {sortField === 'risk' ? (
                    sortAsc ? <ArrowUp size={11} className="text-pink-400" /> : <ArrowDown size={11} className="text-pink-400" />
                  ) : (
                    <ArrowUpDown size={11} className="text-white/20" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-white/40 text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-xs font-mono text-white/30">
                  <span className="inline-block px-6 py-2 rounded-lg bg-white/5 animate-pulse">
                    Scanning live blocks for incoming transactions...
                  </span>
                </td>
              </tr>
            ) : (
              sortedTransactions.map((tx) => {
                const isNew = newHashes.current.has(tx.tx_hash);
                const isHighRisk = tx.is_suspicious || (tx.risk_score || 0) >= 60;
                return (
                  <tr
                    key={tx.tx_hash}
                    onClick={() => onSelectTx(tx)}
                    className={`group cursor-pointer hover:bg-cyan-500/[0.06] transition-colors duration-200 ${
                      isNew ? 'bg-cyan-500/[0.08]' : ''
                    }`}
                  >
                    {/* Tx Hash */}
                    <td className="px-4 py-3 text-xs font-mono text-cyan-300 group-hover:text-cyan-200">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Hash size={12} className="text-cyan-400/60" />
                        <span>{tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-6)}</span>
                      </div>
                    </td>

                    {/* From -> To */}
                    <td className="px-4 py-3 text-xs font-mono text-white/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/60">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span>
                        <span className="text-cyan-400">→</span>
                        <span className="text-white font-medium">{tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Contract'}</span>
                      </div>
                    </td>

                    {/* Value ETH */}
                    <td className="px-4 py-3 text-xs font-mono font-bold text-white whitespace-nowrap">
                      <span>{Number(tx.value_eth || 0).toFixed(4)} ETH</span>
                    </td>

                    {/* Risk Score */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isHighRisk
                          ? 'bg-[#ff2d87]/20 text-[#ff2d87] border border-[#ff2d87]/40 shadow-[0_0_8px_#ff2d87]'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      }`}>
                        {isHighRisk ? (
                          <>
                            <ShieldAlert size={11} />
                            <span>FLAGGED ({tx.risk_score}%)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={11} />
                            <span>LOW ({tx.risk_score || 12}%)</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReport(tx);
                        }}
                        className="px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono transition-all cursor-pointer font-bold"
                      >
                        Inspect
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