import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Fingerprint, ArrowRight } from "lucide-react";
import { TransactionPayload } from "../types";

interface AlertCardsProps {
  alerts: TransactionPayload[];
  onSelectAlert: (tx: TransactionPayload) => void;
}

export default function AlertCards({ alerts, onSelectAlert }: AlertCardsProps) {
  return (
    <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1 custom-scrollbar">
      {alerts.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-white/30 bg-[#1b1c33] rounded-[2rem] border border-white/5">
          <div className="inline-block px-6 py-2 rounded-lg mb-2 bg-white/5">
            Scanning live blocks for suspicious behavior...
          </div>
          <div className="text-[10px] text-white/20 mt-2">Threat sentinel monitoring active</div>
        </div>
      ) : (
        alerts.map((alert, idx) => {
          const isCritical = alert.severity === "CRITICAL" || (alert.risk_score || 0) >= 80;

          return (
            <motion.div
              key={alert.tx_hash || idx}
              initial={{ opacity: 0, x: -24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: idx * 0.05,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              onClick={() => onSelectAlert(alert)}
              className={`p-4 rounded-[1.5rem] bg-[#1b1c33] border relative group cursor-pointer transition-all duration-300 shadow-xl hover:scale-[1.01] ${
                isCritical
                  ? "border-[#ff2d87]/40 hover:border-[#ff2d87] shadow-[0_0_15px_rgba(255,45,135,0.2)]"
                  : "border-white/5 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-wide font-mono ${
                    isCritical
                      ? "bg-[#ff2d87]/20 text-[#ff2d87] border border-[#ff2d87]/40"
                      : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {alert.severity || "FLAGGED"} ({alert.risk_score}%)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {Number(alert.value_eth || 0).toFixed(3)} ETH
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert size={14} className={isCritical ? "text-[#ff2d87]" : "text-cyan-400"} />
                <span className="font-heading font-bold text-xs text-white group-hover:text-cyber-cyan transition-colors">
                  {alert.ai_forensic_dossier?.threat_category || "Outlier Anomaly"}
                </span>
              </div>

              <p className="text-[11px] text-white/50 font-mono line-clamp-2 leading-relaxed">
                {alert.ai_forensic_dossier?.investigator_summary ||
                  `Detected anomalous transfer on Block #${alert.block_number}.`}
              </p>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px] font-mono">
                <span className="text-white/30 truncate max-w-[160px]">
                  {alert.from.slice(0, 8)}...{alert.from.slice(-6)}
                </span>
                <span className="text-cyber-cyan group-hover:underline flex items-center gap-1 font-bold">
                  <span>Open Dossier</span>
                  <ArrowRight size={10} />
                </span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
