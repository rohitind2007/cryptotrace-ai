import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  X,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Search
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

  const filtered = records.filter(
    (r) =>
      r.tx_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.threat_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="liquid-glass border border-white/10 w-full max-w-6xl max-h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden bg-[#020617]/95"
      >
        {/* Gradient accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 glow-border-cyan">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Neon PostgreSQL <span className="gradient-text">Storage Explorer</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Table: flagged_transactions
                </span>
              </div>
              <p className="text-[11px] font-mono text-white/40">
                Audited on-chain records persisted in your cloud database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:glow-border-cyan"
            >
              Neon Console <ExternalLink size={12} />
            </a>
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 border border-white/10 disabled:opacity-50 hover:glow-border-cyan"
              title="Refresh database records"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-all duration-300 border border-white/10"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="relative w-full sm:w-80">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search hash, address, or threat category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all duration-300"
            />
          </div>
          <div className="text-xs font-mono text-white/50 self-end sm:self-auto">
            Showing <strong className="text-cyan-400">{filtered.length}</strong> of{" "}
            <strong className="text-white">{records.length}</strong> stored entries
          </div>
        </div>

        {/* Database Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && records.length === 0 ? (
            <div className="py-20 text-center text-xs font-mono">
              <span className="gradient-text animate-breathe inline-block">
                Querying Neon PostgreSQL table...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs font-mono text-white/40">
              No SQL records match your search criteria.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10 sticky top-0 bg-[#020617] pb-2">
                <tr>
                  <th className="py-2 px-3">Tx Hash</th>
                  <th className="py-2 px-3">Block</th>
                  <th className="py-2 px-3">Sender (From)</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3">Risk</th>
                  <th className="py-2 px-3">Threat Category</th>
                  <th className="py-2 px-3">Saved (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((row) => {
                  const isCrit = row.severity === "CRITICAL";
                  const isHigh = row.severity === "HIGH";
                  return (
                    <tr
                      key={row.tx_hash}
                      className={`hover:bg-white/[0.02] transition-colors duration-300 ${
                        isCrit ? 'hover:bg-rose-500/[0.04]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <a
                          href={`https://etherscan.io/tx/${row.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 hover:text-cyber-cyan transition-colors"
                        >
                          {row.tx_hash.slice(0, 8)}...{row.tx_hash.slice(-6)}
                          <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-white/70">#{row.block_number}</td>
                      <td className="py-2.5 px-3 text-white/50">
                        {row.from ? `${row.from.slice(0, 6)}...${row.from.slice(-4)}` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold">{row.value_eth} ETH</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCrit
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                              : isHigh
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]"
                              : "bg-slate-800 text-slate-400 border border-white/5"
                          }`}
                        >
                          {row.risk_score}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-white/80">{row.threat_category}</td>
                      <td className="py-2.5 px-3 text-white/40 text-[10px]">
                        {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : "Recent"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center px-6 py-3 border-t border-white/10 bg-white/[0.02] text-[10px] font-mono text-white/40">
          <span>Target Engine: SQLAlchemy + pg8000</span>
          <span>SSL Mode: Verified (TLSv1.3)</span>
        </div>
      </motion.div>
    </div>
  );
}