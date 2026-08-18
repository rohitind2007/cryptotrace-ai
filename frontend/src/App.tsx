import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import RecehTokSidebar, { TabType } from "./components/RecehTokSidebar";
import RecehTokHeader from "./components/RecehTokHeader";
import RecehTokWalletsRow from "./components/RecehTokWalletsRow";
import RecehTokWaveChart from "./components/RecehTokWaveChart";
import RecehTokNotificationPanel from "./components/RecehTokNotificationPanel";
import RecehTokHistoryRow from "./components/RecehTokHistoryRow";
import LiveFeedTable from "./components/LiveFeedTable";
import AlertCards from "./components/AlertCards";
import MoneyFlowCanvas, { getKnownEntityLabel } from "./components/MoneyFlowCanvas";
import ForensicModal from "./components/ForensicModal";
import DatabaseModal from "./components/DatabaseModal";
import RiskMatrixModal from "./components/RiskMatrixModal";
import MobileOrientationModal from "./components/MobileOrientationModal";
import { TransactionPayload } from "./types";
import {
  Terminal as TerminalIcon,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Search,
  ShieldAlert,
  ArrowRight,
  GitFork
} from "lucide-react";

/* ─── Smart Risk-Aware Buffer Eviction (100 Cap) ─── */
function evictLowestRiskOldest(txs: TransactionPayload[], maxCap = 100): TransactionPayload[] {
  if (txs.length <= maxCap) return txs;

  const excess = txs.length - maxCap;
  
  const candidates = txs.map((tx, idx) => ({
    idx,
    risk: Number(tx.risk_score) || (tx.is_suspicious ? 75 : 15),
    isSuspicious: tx.is_suspicious ? 1 : 0,
    ageRank: idx,
  }));

  candidates.sort((a, b) => {
    if (a.isSuspicious !== b.isSuspicious) return a.isSuspicious - b.isSuspicious;
    if (a.risk !== b.risk) return a.risk - b.risk;
    return b.ageRank - a.ageRank;
  });

  const evictSet = new Set(candidates.slice(0, excess).map((c) => c.idx));
  return txs.filter((_, idx) => !evictSet.has(idx));
}

export default function App() {
  const [transactions, setTransactions] = useState<TransactionPayload[]>([]);
  const [alerts, setAlerts] = useState<TransactionPayload[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionPayload | null>(null);
  const [modalTx, setModalTx] = useState<TransactionPayload | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('terminal');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_volume' | 'flagged'>('all');
  const [historyMode, setHistoryMode] = useState<'history' | 'trend'>('history');
  const [isRiskMatrixOpen, setIsRiskMatrixOpen] = useState<boolean>(false);

  // Poll live Ethereum transactions
  const fetchFeed = useCallback(async () => {
    try {
      const response = await fetch("/api/feed");
      if (response.ok) {
        const incoming: TransactionPayload[] = await response.json();
        if (Array.isArray(incoming) && incoming.length > 0) {
          setIsConnected(true);

          setTransactions((prev) => {
            const existingHashes = new Set(prev.map((t) => t.tx_hash));
            const fresh = incoming.filter((t) => !existingHashes.has(t.tx_hash));
            if (fresh.length === 0) return prev;

            // Prepend fresh incoming transactions at the top (newest first)
            const combined = [...fresh, ...prev];
            const updated = evictLowestRiskOldest(combined, 100);

            if (!selectedAddress && updated.length > 0) {
              setSelectedAddress(updated[0].from);
            }
            return updated;
          });

          setAlerts((prev) => {
            const existingAlertHashes = new Set(prev.map((t) => t.tx_hash));
            const freshAlerts = incoming.filter(
              (t) => t.is_suspicious && !existingAlertHashes.has(t.tx_hash)
            );
            if (freshAlerts.length === 0) return prev;
            return [...freshAlerts, ...prev].slice(0, 50);
          });
        }
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Polling error:", err);
      setIsConnected(false);
    }
  }, [selectedAddress]);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok && isMounted) {
          setIsConnected(true);
        }
      } catch {
        // Fallback handled
      }
    };

    checkHealth();
    fetchFeed();
    const interval = setInterval(fetchFeed, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchFeed]);

  const handleSelectTransaction = useCallback((tx: TransactionPayload) => {
    setSelectedTx(tx);
    setSelectedAddress(tx.from);
  }, []);

  const handleOpenReport = useCallback((tx: TransactionPayload) => {
    setSelectedTx(tx);
    setSelectedAddress(tx.from);
    setModalTx(tx);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setFilterQuery(query);
    if (query.startsWith('0x')) {
      setSelectedAddress(query);
    }
  }, []);

  const handleSelectProbeAddress = useCallback((address: string) => {
    setSelectedAddress(address);
    setActiveTab('investigation');
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    if (activeFilter === 'high_volume') {
      list = list.filter((t) => (Number(t.value_eth) || 0) >= 3.0);
    } else if (activeFilter === 'flagged') {
      list = list.filter((t) => t.is_suspicious || (t.risk_score || 0) >= 60);
    }

    if (!filterQuery.trim()) return list;
    const q = filterQuery.toLowerCase();
    return list.filter(
      (tx) =>
        tx.tx_hash.toLowerCase().includes(q) ||
        tx.from.toLowerCase().includes(q) ||
        tx.to.toLowerCase().includes(q)
    );
  }, [transactions, filterQuery, activeFilter]);

  const totalVolume = useMemo(
    () => transactions.reduce((acc, t) => acc + (Number(t.value_eth) || 0), 0),
    [transactions]
  );

  const highRiskCount = useMemo(
    () => transactions.filter((t) => t.is_suspicious || (t.risk_score || 0) >= 60).length,
    [transactions]
  );

  return (
    <div className="h-screen w-screen bg-[#131424] text-slate-100 flex font-sans overflow-hidden selection:bg-cyan-500/30 relative">
      {/* ─── Ambient Glow Mesh ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-violet w-[700px] h-[700px] -top-60 -left-60 opacity-30" />
        <div className="ambient-orb ambient-orb-cyan w-[600px] h-[600px] top-1/3 -right-40 opacity-20" />
      </div>

      {/* ─── Left Sidebar (RecehTok Brand & Minimalist Menu) ─── */}
      <RecehTokSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        status={isConnected}
        alertCount={highRiskCount}
        onOpenDatabase={() => setIsDbModalOpen(true)}
      />

      {/* ─── Main Content Workspace ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="px-6 lg:px-8 pt-2">
          <RecehTokHeader
            status={isConnected}
            alertCount={highRiskCount}
            onSearch={handleSearch}
            onOpenAlerts={() => setActiveTab('threats')}
            onOpenDatabase={() => setIsDbModalOpen(true)}
            onRefreshFeed={fetchFeed}
            onToggleGridView={() => setIsRiskMatrixOpen(true)}
            isGridView={isRiskMatrixOpen}
          />
        </div>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
          {/* ─── Tab View 1: RecehTok Main Dashboard ─── */}
          {activeTab === 'terminal' && (
            <div className="flex flex-col gap-6">
              {/* 1. WALLETS Cards Row */}
              <RecehTokWalletsRow
                volumeEth={totalVolume}
                txCount={transactions.length}
                blockNumber={transactions[0]?.block_number || "25775487"}
                activeFilter={activeFilter}
                onFilterVolume={() => setActiveFilter(activeFilter === 'high_volume' ? 'all' : 'high_volume')}
                onFilterLatest={() => setActiveFilter('all')}
                onSelectProbeAddress={handleSelectProbeAddress}
              />

              {/* 2. Middle Row: Multi-Curve Wave Chart (8 cols) + Notifications Drawer (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left 8 Cols: Wave Chart */}
                <div className="lg:col-span-8 flex flex-col">
                  <RecehTokWaveChart
                    onOpenCanvas={() => setActiveTab('investigation')}
                    selectedAddress={selectedAddress}
                    selectedTx={selectedTx}
                    transactions={filteredTransactions}
                  />
                </div>

                {/* Right 4 Cols: Notifications Panel */}
                <div className="lg:col-span-4 flex flex-col min-h-[340px]">
                  <RecehTokNotificationPanel
                    alerts={alerts}
                    onSelectAlert={handleOpenReport}
                    onSeeAll={() => setActiveTab('threats')}
                    onClearAlerts={() => setAlerts([])}
                  />
                </div>
              </div>

              {/* 3. Bottom Row: TREND / HISTORY Live Stream */}
              <div className="flex flex-col gap-4">
                <RecehTokHistoryRow
                  transactions={filteredTransactions}
                  onSelectTx={handleSelectTransaction}
                  onOpenReport={handleOpenReport}
                  activeMode={historyMode}
                  onToggleMode={setHistoryMode}
                />

                {/* Embedded Live Feed Table */}
                <div className="h-[360px] w-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                  <LiveFeedTable
                    transactions={filteredTransactions}
                    onSelectTx={handleSelectTransaction}
                    onOpenReport={handleOpenReport}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab View 2: Money Flow Investigation Canvas ─── */}
          {activeTab === 'investigation' && (
            <div className="w-full flex-1 min-h-[650px] flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-[#1b1c33] border border-white/5">
                <div>
                  <h2 className="text-base font-bold font-heading italic text-white">
                    Money Flow <span className="gradient-text">Investigation Canvas</span>
                  </h2>
                  <p className="text-[11px] text-white/40 font-mono">
                    Deep multi-hop fund flow analysis for target: <strong className="text-cyber-cyan">{getKnownEntityLabel(selectedAddress)}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsDbModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyber-cyan text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Database size={13} />
                    <span>Explore Database</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full h-[calc(100vh-210px)] min-h-[580px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                <MoneyFlowCanvas
                  selectedAddress={selectedAddress || transactions[0]?.from || null}
                  onSelectAddress={setSelectedAddress}
                />
              </div>
            </div>
          )}

          {/* ─── Tab View 3: Threat Messages & Sentinel Alerts ─── */}
          {activeTab === 'threats' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between p-5 rounded-[2rem] bg-[#1b1c33] border border-rose-500/30 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-cyber-rose">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Threat Sentinel Messages</h2>
                    <p className="text-xs text-white/50 font-mono">
                      {alerts.length} suspicious anomaly flags detected
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-[650px] w-full">
                <AlertCards alerts={alerts} onSelectAlert={handleOpenReport} />
              </div>
            </div>
          )}

          {/* ─── Tab View 4: System & Node Health ─── */}
          {activeTab === 'node' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 lg:p-8 rounded-[2rem] bg-[#1b1c33] border border-white/5 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">
                    System & <span className="gradient-text">Node Sentinel Architecture</span>
                  </h3>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    Real-time telemetry and engine configuration for Ethereum ingestion
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 size={13} /> ALL SYSTEMS OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-5 bg-[#131424] rounded-2xl border border-white/5 space-y-2">
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">Web3 Ingestion</span>
                  <span className="text-emerald-400 font-bold text-base block">ACTIVE (Ethereum Mainnet)</span>
                  <span className="text-[11px] text-white/40 block">Public HTTP JSON-RPC Protocol (Poll: 3.5s)</span>
                </div>
                <div className="p-5 bg-[#131424] rounded-2xl border border-white/5 space-y-2">
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">ML Anomaly Engine</span>
                  <span className="gradient-text font-bold text-base block">IsolationForest Heuristics</span>
                  <span className="text-[11px] text-white/40 block">Contamination threshold: 5.0% Outliers</span>
                </div>
                <div className="p-5 bg-[#131424] rounded-2xl border border-white/5 space-y-2">
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">Storage Engine</span>
                  <span className="text-cyber-rose font-bold text-base block">Neon PostgreSQL</span>
                  <span className="text-[11px] text-white/40 block">Auto-syncing forensic ledger logs</span>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Forensic Dossier Modal */}
      <ForensicModal
        tx={modalTx}
        onClose={() => setModalTx(null)}
        onInvestigateInGraph={handleSelectProbeAddress}
      />

      {/* Buffer Risk Heatmap Matrix Modal */}
      <RiskMatrixModal
        isOpen={isRiskMatrixOpen}
        onClose={() => setIsRiskMatrixOpen(false)}
        transactions={transactions}
        onSelectTx={handleSelectTransaction}
        onOpenReport={handleOpenReport}
      />

      {/* Neon Database Modal */}
      <DatabaseModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />

      {/* Mobile Portrait Orientation Suggestion Modal */}
      <MobileOrientationModal />
    </div>
  );
}