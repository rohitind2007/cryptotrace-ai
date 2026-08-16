import React from "react";
import { motion } from "framer-motion";
import {
  X,
  ShieldAlert,
  Database,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { TransactionPayload } from "../types";

interface Props {
  tx: TransactionPayload | null;
  onClose: () => void;
}

export default function ForensicModal({ tx, onClose }: Props) {
  if (!tx) return null;

  const riskColor =
    tx.risk_score >= 70
      ? "gradient-text-rose"
      : tx.risk_score >= 40
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with radial glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        style={{
          background: `radial-gradient(600px circle at center, rgba(${
            tx.risk_score >= 70 ? "244,63,94" : "34,211,238"
          },0.06) 0%, rgba(0,0,0,0.85) 70%)`,
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-2xl liquid-glass rounded-[2.5rem] relative border border-white/10 overflow-hidden shadow-2xl z-10"
      >
        {/* Gradient accent line at top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />

        {/* Scan line overlay on header area */}
        <div className="p-8 scan-line-overlay">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-cyber-cyan mb-1">
                <Database size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Forensic Dossier
                </span>
              </div>
              <h2 className="text-3xl font-heading italic text-white leading-none">
                Tx #{tx.tx_hash.slice(2, 8)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full liquid-glass hover:text-cyber-cyan hover:glow-border-cyan transition-all duration-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">
                  Primary Entity (From)
                </label>
                <div className="p-3 liquid-glass rounded-2xl border border-white/5 font-mono text-xs text-cyber-cyan break-all hover:glow-border-cyan transition-shadow duration-500">
                  {tx.from}
                </div>
              </div>

              <div className="flex justify-center py-1">
                <ArrowRight className="text-white/20" size={18} />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">
                  Counterparty (To)
                </label>
                <div className="p-3 liquid-glass rounded-2xl border border-white/5 font-mono text-xs text-white/80 break-all">
                  {tx.to || "Contract Deployment"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-5 liquid-glass rounded-3xl border ${
                tx.risk_score >= 70 ? 'border-cyber-rose/20 animate-glow-rose' : 'border-white/5'
              } bg-cyber-rose/5`}>
                <div className="flex items-center gap-2 text-cyber-rose mb-2">
                  <ShieldAlert size={18} className={tx.risk_score >= 70 ? 'animate-breathe' : ''} />
                  <span className="text-xs font-bold uppercase">
                    Risk Assessment
                  </span>
                </div>
                <div className={`text-5xl font-heading italic mb-2 leading-none ${riskColor}`}>
                  {tx.risk_score}%
                </div>
                <p className="text-xs text-white/60 leading-snug">
                  {tx.ai_forensic_dossier?.investigator_summary ||
                    "ML flagged statistical outlier based on transfer velocity and gas ratio."}
                </p>
                {tx.ai_forensic_dossier?.recommended_action && (
                  <div className="mt-3 text-[11px] text-emerald-400 font-mono">
                    Action: {tx.ai_forensic_dossier.recommended_action}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://etherscan.io/tx/${tx.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 liquid-glass rounded-full text-[10px] font-bold uppercase border border-white/5 hover:border-cyber-cyan hover:glow-border-cyan transition-all duration-300 text-white"
                >
                  Etherscan <ExternalLink size={12} />
                </a>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center py-3 liquid-glass rounded-full text-[10px] font-bold uppercase border border-white/5 hover:bg-white/5 transition-all duration-300 text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Info Line */}
        <div className="px-8 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/40">
          <span>BLOCK_HEIGHT: {tx.block_number ?? "PENDING"}</span>
          <span>GAS: {Number(tx.gas_price_gwei || 0).toFixed(2)} Gwei</span>
        </div>
      </motion.div>
    </div>
  );
}