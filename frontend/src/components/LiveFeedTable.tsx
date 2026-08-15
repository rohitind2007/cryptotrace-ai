import React from 'react';
import { TransactionPayload } from '../types';
import { ArrowUpRight, Hash } from 'lucide-react';

interface LiveFeedProps {
  transactions: TransactionPayload[];
  onSelectTx: (tx: TransactionPayload) => void;
  onOpenReport: (tx: TransactionPayload) => void;
}

export default function LiveFeedTable({ transactions, onSelectTx, onOpenReport }: LiveFeedProps) {
  return (
    <div className="liquid-glass rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col h-full border border-white/5 shadow-xl">
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
                  Scanning live blocks for incoming transactions...
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.tx_hash}
                  onClick={() => onSelectTx(tx)}
                  className="group cursor-pointer hover:bg-cyber-cyan/[0.04] transition-colors"
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
                      <div className="w-8 sm:w-12 h-1 bg-white/10 rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full ${
                            tx.risk_score > 70 ? 'bg-cyber-rose' : tx.risk_score > 30 ? 'bg-orange-400' : 'bg-emerald-400'
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
                      className="p-1.5 md:p-2 rounded-full liquid-glass text-white/70 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all cursor-pointer inline-flex items-center justify-center"
                    >
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}