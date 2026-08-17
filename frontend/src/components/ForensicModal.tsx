import React from "react";
import { motion } from "framer-motion";
import {
  X,
  ShieldAlert,
  Database,
  ArrowRight,
  GitFork,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { TransactionPayload } from "../types";

interface Props {
  tx: TransactionPayload | null;
  onClose: () => void;
  onInvestigateInGraph?: (address: string) => void;
}

export default function ForensicModal({ tx, onClose, onInvestigateInGraph }: Props) {
  const [copied, setCopied] = React.useState(false);
  if (!tx) return null;

  const isHighRisk = tx.risk_score >= 60 || tx.is_suspicious;

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.tx_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTraceClick = () => {
    if (onInvestigateInGraph) {
      onInvestigateInGraph(tx.from);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0d0e1a]/85 backdrop-blur-md"
      />

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-2xl bg-[#1b1c33] rounded-[2.5rem] relative border border-white/10 overflow-hidden shadow-2xl z-10 select-none"
      >
        {/* Top Accent Gradient */}
        <div className={`h-[3px] w-full bg-gradient-to-r ${isHighRisk ? 'from-[#ff2d87] via-[#9b51e0] to-[#00d2ff]' : 'from-[#00d2ff] to-[#00e676]'}`} />

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Database size={15} />
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-cyan-300">
                  AI FORENSIC DOSSIER
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-white">
                {tx.ai_forensic_dossier?.threat_category || "Transaction Investigation Dossier"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#131424] hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Risk Score Pill */}
            <div className="p-5 rounded-2xl bg-[#131424] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
                Sentinel Risk Rating
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black font-mono ${isHighRisk ? 'text-[#ff2d87]' : 'text-[#00e676]'}`}>
                  {tx.risk_score}%
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isHighRisk
                    ? 'bg-[#ff2d87]/20 text-[#ff2d87] border border-[#ff2d87]/40'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {tx.severity || (isHighRisk ? 'CRITICAL' : 'BENIGN')}
                </span>
              </div>
            </div>

            {/* Inflow Value */}
            <div className="p-5 rounded-2xl bg-[#131424] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
                Transferred Value
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {Number(tx.value_eth || 0).toFixed(4)} <span className="text-cyan-300 text-sm">ETH</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Gas: {tx.gas_price_gwei || '18'} Gwei • Block #{tx.block_number}
              </span>
            </div>
          </div>

          {/* AI Forensic Summary */}
          <div className="p-5 rounded-2xl bg-[#23243f]/70 border border-cyan-500/20 mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold block mb-1">
              Gemini & IsolationForest Synthesis:
            </span>
            <p className="text-xs text-white/80 font-mono leading-relaxed">
              {tx.ai_forensic_dossier?.investigator_summary ||
                `Transaction of ${tx.value_eth} ETH from ${tx.from} to ${tx.to} inspected. No malicious mixers identified.`}
            </p>
          </div>

          {/* Addresses */}
          <div className="p-4 rounded-2xl bg-[#131424] border border-white/5 space-y-2 text-xs font-mono mb-6">
            <div className="flex justify-between items-center text-white/60">
              <span className="text-[10px] text-white/40 uppercase">Origin Address:</span>
              <span className="text-white font-bold">{tx.from}</span>
            </div>
            <div className="flex justify-between items-center text-white/60">
              <span className="text-[10px] text-white/40 uppercase">Target Entity:</span>
              <span className="text-cyan-300 font-bold">{tx.to || "Contract Deployment"}</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTraceClick}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyber-cyan font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <GitFork size={13} />
                <span>Trace in Graph →</span>
              </button>

              {/* View on Etherscan */}
              <a
                href={`https://etherscan.io/tx/${tx.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink size={13} />
                <span>Etherscan</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-[#00d2ff] hover:bg-[#00b4db] text-black font-bold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy Hash"}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}