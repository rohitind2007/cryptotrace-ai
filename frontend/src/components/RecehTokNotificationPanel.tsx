import React, { useState } from 'react';
import { TransactionPayload } from '../types';
import { MoreVertical, ShieldAlert, ArrowRight, Filter, Download, Trash2, CheckCircle2 } from 'lucide-react';

interface NotificationPanelProps {
  alerts: TransactionPayload[];
  onSelectAlert: (tx: TransactionPayload) => void;
  onSeeAll?: () => void;
  onClearAlerts?: () => void;
}

export default function RecehTokNotificationPanel({
  alerts,
  onSelectAlert,
  onSeeAll,
  onClearAlerts,
}: NotificationPanelProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  const displayedAlerts = filterCriticalOnly
    ? alerts.filter((a) => a.severity === 'CRITICAL' || (a.risk_score || 0) >= 80)
    : alerts;

  const handleExportDossier = () => {
    const jsonStr = JSON.stringify(alerts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat_dossier_${Date.now()}.json`;
    a.click();
    setIsMenuOpen(false);
  };

  return (
    <div className="w-full bg-[#1b1c33]/90 backdrop-blur-xl rounded-[2rem] border border-white/5 p-5 flex flex-col justify-between shadow-2xl h-full select-none relative">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3 relative">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/50">
            NOTIFICATIONS
          </span>
          {alerts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#ff2d87] animate-pulse shadow-[0_0_8px_#ff2d87]" />
          )}
        </div>

        {/* 3-Dots Action Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
            title="Options"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-7 w-48 p-1.5 rounded-2xl bg-[#131424] border border-white/10 shadow-2xl z-50 flex flex-col gap-1 text-xs font-mono">
              <button
                onClick={() => {
                  setFilterCriticalOnly(!filterCriticalOnly);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Filter size={13} className="text-cyan-400" />
                <span>{filterCriticalOnly ? "Show All Alerts" : "Critical Flags Only"}</span>
              </button>

              <button
                onClick={handleExportDossier}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Download size={13} className="text-purple-400" />
                <span>Export Dossier (JSON)</span>
              </button>

              {onClearAlerts && (
                <button
                  onClick={() => {
                    onClearAlerts();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear In-Memory Feed</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Stream Items */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
        {displayedAlerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <span className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 mb-2">
              <CheckCircle2 size={20} className="text-emerald-400/60" />
            </span>
            <span className="text-xs font-mono text-white/40">
              {filterCriticalOnly ? "No critical anomalies" : "No threat alerts active"}
            </span>
            <span className="text-[10px] text-white/20 mt-1">IsolationForest sentinel is monitoring</span>
          </div>
        ) : (
          displayedAlerts.slice(0, 4).map((alert, idx) => {
            const avatarColors = [
              'bg-[#00d2ff] text-black',
              'bg-[#ff2d87] text-white',
              'bg-[#00e676] text-black',
              'bg-[#9b51e0] text-white',
            ];
            const bgAvatar = avatarColors[idx % avatarColors.length];
            const initial = alert.from.slice(2, 4).toUpperCase();

            return (
              <div
                key={alert.tx_hash || idx}
                onClick={() => onSelectAlert(alert)}
                className="p-3.5 rounded-2xl bg-[#23243f]/60 hover:bg-[#23243f] border border-white/5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer flex flex-col gap-2.5 group shadow-sm"
              >
                {/* User / Threat Sender Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${bgAvatar} flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-md`}>
                      {initial}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white group-hover:text-cyber-cyan transition-colors truncate">
                        {alert.ai_forensic_dossier?.threat_category || 'Suspicious Outflow'}
                      </span>
                      <span className="text-[9px] font-mono text-white/40 truncate">
                        Target: {alert.to ? `${alert.to.slice(0, 6)}...${alert.to.slice(-4)}` : 'Contract'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-white/30 shrink-0">
                    Block #{alert.block_number}
                  </span>
                </div>

                {/* Amount / Risk Badge & Action */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono">
                  <span className="text-[#00e676] font-bold">
                    +{Number(alert.value_eth || 0).toFixed(3)} ETH
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAlert(alert);
                    }}
                    className="text-xs text-cyber-cyan hover:underline flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <span>Open dossier</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Action */}
      <div className="pt-3 border-t border-white/5 text-center mt-2">
        <button
          onClick={onSeeAll}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition-all cursor-pointer font-bold"
        >
          See All Threat Alerts ({alerts.length}) →
        </button>
      </div>
    </div>
  );
}
