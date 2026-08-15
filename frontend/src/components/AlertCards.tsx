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
        <div className="p-6 text-center text-xs font-mono text-white/30 liquid-glass rounded-2xl">
          Scanning live blocks for suspicious behavior...
        </div>
      ) : (
        alerts.map((alert, idx) => (
          <motion.div
            key={alert.tx_hash}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectAlert(alert)}
            className={`liquid-glass p-4 rounded-[1.25rem] border-l-2 relative group cursor-pointer transition-all hover:scale-[1.02]
              ${alert.severity === "CRITICAL" ? "border-l-cyber-rose" : alert.severity === "HIGH" ? "border-l-orange-500" : "border-l-cyber-cyan"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full
                ${alert.severity === "CRITICAL" ? "bg-cyber-rose/20 text-cyber-rose" : "bg-white/5 text-white/60"}`}
              >
                {alert.severity}
              </span>
              <span className="text-[9px] font-mono text-white/30">
                {alert.value_eth.toFixed(3)} ETH
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              {alert.severity === "CRITICAL" ? (
                <ShieldAlert size={14} className="text-cyber-rose" />
              ) : (
                <Fingerprint size={14} className="text-white/40" />
              )}
              {alert.ai_forensic_dossier?.threat_category || "Anomaly Detected"}
            </h4>
            <p className="text-xs text-white/50 font-light leading-snug line-clamp-2">
              {alert.ai_forensic_dossier?.investigator_summary ||
                alert.rules_triggered.join(", ")}
            </p>
          </motion.div>
        ))
      )}
    </div>
  );
}
