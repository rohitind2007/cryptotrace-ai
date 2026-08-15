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
    <div className="liquid-glass rounded-[2rem] overflow-hidden flex flex-col h-full border border-white/5">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Transaction Hash</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Origin / Target</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Value</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Risk Score</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <tr 
                key={tx.tx_hash} 
                onClick={() => onSelectTx(tx)}
                className="group cursor-pointer hover:bg-cyber-cyan/[0.03] transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-cyber-cyan/80">
                  <div className="flex items-center gap-2">
                    <Hash size={12} className="text-white/20" />
                    {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-6)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-white/90">
                    {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                  </div>
                  <div className="text-[10px] font-mono text-white/40">
                    ➔ {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : "Contract Deployment"}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-white tracking-tight">
                  {tx.value_eth.toFixed(4)} ETH
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${tx.risk_score > 70 ? 'bg-cyber-rose' : tx.risk_score > 30 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        style={{ width: `${tx.risk_score}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${tx.risk_score > 70 ? 'text-cyber-rose' : 'text-white/40'}`}>
                      {tx.risk_score}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents row click from firing
                      onOpenReport(tx);
                    }}
                    title="Open Forensic Dossier"
                    className="opacity-70 group-hover:opacity-100 p-2 rounded-full liquid-glass text-white hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all cursor-pointer"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}