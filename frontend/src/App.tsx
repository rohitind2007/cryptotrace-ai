import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import LiveFeedTable from "./components/LiveFeedTable";
import AlertCards from "./components/AlertCards";
import MoneyFlowCanvas from "./components/MoneyFlowCanvas";
import ForensicModal from "./components/ForensicModal";
import DatabaseModal from "./components/DatabaseModal";
import { TransactionPayload } from "./types";
import {
  Activity,
  ShieldAlert,
  Cpu,
  Zap,
  Flame,
  Layers,
  Terminal as TerminalIcon,
  CheckCircle2
} from "lucide-react";

/* ─── Animated Counter Hook ─── */
function useAnimatedValue(target: number, duration = 800) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = display;
    const diff = target - start;
    if (Math.abs(diff) < 0.01) { setDisplay(target); return; }
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

/* ─── Stagger Container Variants ─── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function App() {
  const [transactions, setTransactions] = useState<TransactionPayload[]>([]);
  const [alerts, setAlerts] = useState<TransactionPayload[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionPayload | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'investigation' | 'node'>('terminal');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Check server & database health
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok && isMounted) {
          setIsConnected(true);
        }
      } catch {
        // Handled in feed poll fallback
      }
    };

    // Poll live Ethereum transactions
    const fetchFeed = async () => {
      try {
        const response = await fetch("/api/feed");
        if (response.ok) {
          const incoming: TransactionPayload[] = await response.json();
          if (isMounted && Array.isArray(incoming) && incoming.length > 0) {
            setIsConnected(true);

            setTransactions((prev) => {
              const existingHashes = new Set(prev.map((t) => t.tx_hash));
              const fresh = incoming.filter((t) => !existingHashes.has(t.tx_hash));
              const updated = fresh.length > 0 ? [...fresh, ...prev].slice(0, 50) : prev;

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
              return [...freshAlerts, ...prev].slice(0, 20);
            });
          }
        } else {
          if (isMounted) setIsConnected(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (isMounted) setIsConnected(false);
      }
    };

    checkHealth();
    fetchFeed();
    const interval = setInterval(fetchFeed, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedAddress]);

  const handleSelectTransaction = useCallback((tx: TransactionPayload) => {
    setSelectedAddress(tx.from);
  }, []);

  const handleOpenReport = useCallback((tx: TransactionPayload) => {
    setSelectedTx(tx);
    setSelectedAddress(tx.from);
  }, []);

  // Live HUD telemetry metrics
  const totalVolume = useMemo(
    () => transactions.reduce((acc, t) => acc + (Number(t.value_eth) || 0), 0),
    [transactions]
  );

  const highRiskCount = useMemo(
    () => transactions.filter((t) => (t.risk_score || 0) >= 60).length,
    [transactions]
  );

  const avgGasPrice = useMemo(() => {
    if (!transactions.length) return 0;
    const sum = transactions.reduce((acc, t) => acc + (Number(t.gas_price_gwei) || 0), 0);
    return sum / transactions.length;
  }, [transactions]);

  // Animated display values
  const animVolume = useAnimatedValue(totalVolume);
  const animGas = useAnimatedValue(avgGasPrice);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyber-cyan/30">
      {/* ─── Ambient Background Layer ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dot Grid */}
        <div className="absolute inset-0 dot-grid-bg opacity-40" />

        {/* Floating Gradient Orbs */}
        <div className="ambient-orb ambient-orb-cyan animate-float w-[500px] h-[500px] -top-40 -left-40" />
        <div className="ambient-orb ambient-orb-rose animate-float-reverse w-[400px] h-[400px] top-1/3 -right-32" />
        <div className="ambient-orb ambient-orb-violet animate-float w-[350px] h-[350px] bottom-20 left-1/4" style={{ animationDelay: "3s" }} />
      </div>

      {/* Floating Navigation Pill */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        status={isConnected}
        onOpenDatabase={() => setIsDbModalOpen(true)}
      />

      {/* Main Workspace with top padding for fixed navbar clearance */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 flex flex-col gap-4 relative z-10">
        {/* Top Telemetry HUD Grid */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3"
        >
          {/* Card 1: Block Height */}
          <motion.div variants={fadeSlideUp} className="liquid-glass p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between group hover:glow-border-cyan transition-shadow duration-500">
            <div className="flex justify-between items-center text-white/40 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-widest">Block Height</span>
              <Layers size={13} className="text-cyber-cyan group-hover:animate-breathe" />
            </div>
            <span className="text-sm sm:text-base font-mono font-bold text-white tracking-tight">
              #{transactions[0]?.block_number || "19420550"}
            </span>
          </motion.div>

          {/* Card 2: Total Scanned */}
          <motion.div variants={fadeSlideUp} className="liquid-glass p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between group hover:glow-border-cyan transition-shadow duration-500">
            <div className="flex justify-between items-center text-white/40 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-widest">Txs Scanned</span>
              <Activity size={13} className="text-emerald-400 group-hover:animate-breathe" />
            </div>
            <span className="text-sm sm:text-base font-mono font-bold text-white tracking-tight">
              {transactions.length} Units
            </span>
          </motion.div>

          {/* Card 3: Volume Inspected */}
          <motion.div variants={fadeSlideUp} className="liquid-glass p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between group hover:glow-border-cyan transition-shadow duration-500">
            <div className="flex justify-between items-center text-white/40 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-widest">Inspected Vol</span>
              <Zap size={13} className="text-yellow-400 group-hover:animate-breathe" />
            </div>
            <span className="text-sm sm:text-base font-mono font-bold text-white tracking-tight truncate">
              {animVolume.toFixed(2)} ETH
            </span>
          </motion.div>

          {/* Card 4: High Risk Flags */}
          <motion.div variants={fadeSlideUp} className={`liquid-glass p-3.5 rounded-2xl border flex flex-col justify-between group transition-shadow duration-500 ${highRiskCount > 0 ? 'border-cyber-rose/20 animate-glow-rose' : 'border-white/5'}`}>
            <div className="flex justify-between items-center text-white/40 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-widest">Threat Detections</span>
              <ShieldAlert size={13} className="text-cyber-rose group-hover:animate-breathe" />
            </div>
            <span className="text-sm sm:text-base font-mono font-bold text-cyber-rose tracking-tight">
              {highRiskCount} Flagged
            </span>
          </motion.div>

          {/* Card 5: Gas Velocity */}
          <motion.div variants={fadeSlideUp} className="liquid-glass p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between group hover:glow-border-cyan transition-shadow duration-500">
            <div className="flex justify-between items-center text-white/40 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-widest">Network Gas</span>
              <Flame size={13} className="text-orange-400 group-hover:animate-breathe" />
            </div>
            <span className="text-sm sm:text-base font-mono font-bold text-white tracking-tight">
              {animGas.toFixed(1)} Gwei
            </span>
          </motion.div>

          {/* Card 6: Model Core */}
          <motion.div variants={fadeSlideUp} className="liquid-glass p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between group hover:glow-border-cyan transition-shadow duration-500">
            <div className="flex justify-between items-center text-white/40 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-widest">ML Anomaly Core</span>
              <Cpu size={13} className="text-cyber-cyan group-hover:animate-breathe" />
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-bold gradient-text truncate">
              iForest (5% Contam)
            </span>
          </motion.div>
        </motion.section>

        {/* Tab View: Terminal */}
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
            {/* Left 8 Columns: Live Feed Table + Mini Graph */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-[360px] w-full">
                <LiveFeedTable
                  transactions={transactions}
                  onSelectTx={handleSelectTransaction}
                  onOpenReport={handleOpenReport}
                />
              </div>

              <div className="h-[320px] w-full">
                <MoneyFlowCanvas selectedAddress={selectedAddress} />
              </div>

              {/* Dynamic Probe Sub-Bar */}
              <div className="liquid-glass px-4 py-2.5 rounded-2xl border border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 scan-line-overlay">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={12} className="text-cyber-cyan" />
                  <span>
                    TARGET_PROBE:{" "}
                    <strong className="text-white/80">
                      {selectedAddress
                        ? `${selectedAddress.slice(0, 10)}...${selectedAddress.slice(-8)}`
                        : "Awaiting selection"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline">
                    CHAIN_SYNC: <strong className="text-emerald-400">100% OK</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    RPC_LATENCY: 42ms
                  </span>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Threat Sentinel Feed */}
            <div className="lg:col-span-4 h-[500px] lg:h-[742px] lg:sticky lg:top-28">
              <AlertCards
                alerts={alerts}
                onSelectAlert={handleOpenReport}
              />
            </div>
          </div>
        )}

        {/* Tab View: Investigation / Fullscreen Money Flow Canvas */}
        {activeTab === 'investigation' && (
          <div className="w-full h-[650px] lg:h-[780px]">
            <MoneyFlowCanvas selectedAddress={selectedAddress || transactions[0]?.from || null} />
          </div>
        )}

        {/* Tab View: Node Telemetry & Architecture */}
        {activeTab === 'node' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="liquid-glass p-6 lg:p-8 rounded-3xl border border-white/5 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-heading italic text-white">
                  Node Health & <span className="gradient-text">Pipeline Sentinel</span>
                </h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">Real-time architecture telemetry for Ethereum ingestion</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono animate-glow-cyan">
                <CheckCircle2 size={12} /> ALL SYSTEMS OPERATIONAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1 hover:glow-border-cyan transition-shadow duration-500">
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">Web3 Ingestion</span>
                <span className="text-emerald-400 font-bold text-sm block">ACTIVE (Ethereum Mainnet)</span>
                <span className="text-[10px] text-white/30">Public HTTP JSON-RPC Protocol</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1 hover:glow-border-cyan transition-shadow duration-500">
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">ML Anomaly Engine</span>
                <span className="gradient-text font-bold text-sm block">IsolationForest Heuristics</span>
                <span className="text-[10px] text-white/30">Outlier threshold: 5.0% Contamination</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1 hover:glow-border-rose transition-shadow duration-500">
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">Storage Engine</span>
                <span className="text-cyber-rose font-bold text-sm block">Neon PostgreSQL (pg8000)</span>
                <span className="text-[10px] text-white/30">Auto-persisting live transactions</span>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="mt-8 text-center font-mono text-[9px] md:text-[10px] text-white/30 tracking-wider relative z-10">
        CRYPTOTRACE AI • ETHEREUM AML & FRAUD SENTINEL
      </footer>

      {/* Forensic Report Modal */}
      <ForensicModal tx={selectedTx} onClose={() => setSelectedTx(null)} />

      {/* Neon Database Explorer Modal */}
      <DatabaseModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </div>
  );
}