import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  X,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Search,
  Download
} from "lucide-react";

interface DBRecord {
  tx_hash: string;
  block_number: number;
  from: string;
  to: string;
  value_eth: number;
  gas_price_gwei: number;
  risk_score: number;
  severity: string;
  threat_category: string;
  is_suspicious: boolean;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DatabaseModal({ isOpen, onClose }: Props) {
  const [records, setRecords] = useState<DBRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history?limit=50");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Failed to load DB records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    (r) =>
      r.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.threat_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = "tx_hash,block_number,from,to,value_eth,risk_score,severity,threat_category\n";
    const rows = records.map(r => `${r.tx_hash},${r.block_number},${r.from},${r.to},${r.value_eth},${r.risk_score},${r.severity},${r.threat_category}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon_audit_ledger_${Date.now()}.csv`;
    a.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0d0e1a]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full max-w-5xl max-h-[85vh] bg-[#1b1c33] rounded-[2.5rem] relative border border-white/10 overflow-hidden shadow-2xl z-10 flex flex-col select-none"
        >
          {/* Accent line */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#00d2ff] via-[#9b51e0] to-[#ff2d87]" />

          {/* Modal Header */}
          <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-[#171829]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyber-cyan">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                  <span>Neon PostgreSQL Explorer</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    pg8000
                  </span>
                </h2>
                <p className="text-xs text-white/40 font-mono">
                  Persisted forensic transaction audit ledger
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-white/30" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#131424] border border-white/10 rounded-full text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 w-36 sm:w-52"
                />
              </div>

              {/* Open in Neon Console */}
              <a
                href="https://console.neon.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,210,255,0.25)]"
                title="Open Neon Cloud Console in new tab"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline font-bold">Neon Console</span>
              </a>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export CSV"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Refresh */}
              <button
                onClick={fetchRecords}
                disabled={loading}
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30 transition-all cursor-pointer"
                title="Refresh from Neon"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-4 custom-scrollbar bg-[#131424]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                  <th className="p-3">Tx Hash</th>
                  <th className="p-3">Block</th>
                  <th className="p-3">From / To</th>
                  <th className="p-3">Value (ETH)</th>
                  <th className="p-3">Risk Rating</th>
                  <th className="p-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-white/40">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-cyber-cyan" />
                      Loading records from Neon PostgreSQL...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-white/30">
                      No records found matching criteria
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <tr key={idx} className="hover:bg-cyan-500/[0.04] transition-colors">
                      <td className="p-3 text-cyan-300 font-bold">
                        {r.tx_hash ? `${r.tx_hash.slice(0, 10)}...${r.tx_hash.slice(-6)}` : "0x0"}
                      </td>
                      <td className="p-3 text-white/70">#{r.block_number}</td>
                      <td className="p-3 text-white/70 text-[11px]">
                        <span>{r.from ? `${r.from.slice(0, 6)}...` : ""}</span>
                        <span className="text-cyan-400 mx-1">→</span>
                        <span>{r.to ? `${r.to.slice(0, 6)}...` : "Contract"}</span>
                      </td>
                      <td className="p-3 text-white font-bold">{r.value_eth} ETH</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.risk_score >= 60 || r.is_suspicious
                            ? 'bg-[#ff2d87]/20 text-[#ff2d87] border border-[#ff2d87]/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        }`}>
                          {r.risk_score}% {r.severity}
                        </span>
                      </td>
                      <td className="p-3 text-white/60 text-[11px] truncate max-w-xs">
                        {r.threat_category || "Standard Transaction"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-[#171829] flex flex-wrap justify-between items-center text-[10px] font-mono text-white/40 gap-2">
            <div className="flex items-center gap-2">
              <span>DATABASE: NEON CLOUD POSTGRESQL</span>
              <span className="text-white/20">•</span>
              <a
                href="https://console.neon.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                console.neon.tech <ExternalLink size={10} />
              </a>
            </div>
            <span>SHOWING {filteredRecords.length} AUDIT LOGS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}