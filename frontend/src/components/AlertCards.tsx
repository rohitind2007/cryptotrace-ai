import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Fingerprint } from "lucide-react";
import { TransactionPayload } from "../types";

interface AlertCardsProps {
  alerts: TransactionPayload[];
  onSelectAlert: (tx: TransactionPayload) => void;
}

export default function AlertCards({ alerts, onSelectAlert }: AlertCardsProps) {
  return (
    <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
      {alerts.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-white/30 liquid-glass rounded-2xl">
          <div className="shimmer-bg inline-block px-6 py-2 rounded-lg mb-2">
            Scanning live blocks for suspicious behavior...
          </div>
          <div className="text-[10px] text-white/20 mt-2">Threat sentinel monitoring active</div>
        </div>
      ) : (
        alerts.map((alert, idx) => {
          const isCritical = alert.severity === "CRITICAL";
          const isHigh = alert.severity === "HIGH";

          return (
            <motion.div
              key={alert.tx_hash}
              initial={{ opacity: 0, x: -24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: idx * 0.06,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              onClick={() => onSelectAlert(alert)}
              className={`liquid-glass p-4 rounded-[1.25rem] border-l-2 relative group cursor-pointer transition-all duration-300 gradient-border-sweep
                ${isCritical
                  ? "border-l-cyber-rose glow-border-rose"
                  : isHigh
                  ? "border-l-orange-500 glow-border-amber"
                  : "border-l-cyber-cyan hover:glow-border-cyan"
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-wide
                  ${isCritical
                    ? "bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/20"
                    : isHigh
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "bg-white/5 text-white/60 border border-white/5"
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-[9px] font-mono text-white/30">
                  {alert.value_eth.toFixed(3)} ETH
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                {isCritical ? (
                  <ShieldAlert size={14} className="text-cyber-rose animate-breathe" />
                ) : (
                  <Fingerprint size={14} className="text-white/40 group-hover:text-cyber-cyan transition-colors" />
                )}
                {alert.ai_forensic_dossier?.threat_category || "Anomaly Detected"}
              </h4>
              <p className="text-xs text-white/50 font-light leading-snug line-clamp-2">
                {alert.ai_forensic_dossier?.investigator_summary ||
                  alert.rules_triggered.join(", ")}
              </p>

              {/* Hover reveal action hint */}
              <div className="absolute bottom-2 right-3 text-[9px] font-mono text-white/0 group-hover:text-white/30 transition-all duration-300">
                Click to investigate →
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
