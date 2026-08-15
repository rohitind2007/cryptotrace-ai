import React, { useEffect, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import LiveFeedTable from "./components/LiveFeedTable";
import AlertCards from "./components/AlertCards";
import MoneyFlowCanvas from "./components/MoneyFlowCanvas";
import ForensicModal from "./components/ForensicModal";
import { TransactionPayload } from "./types";

export default function App() {
  const [transactions, setTransactions] = useState<TransactionPayload[]>([]);
  const [alerts, setAlerts] = useState<TransactionPayload[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionPayload | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'investigation' | 'node'>('terminal');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

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
              if (fresh.length === 0) return prev;
              return [...fresh, ...prev].slice(0, 50);
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

    fetchFeed();
    const interval = setInterval(fetchFeed, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelectTransaction = useCallback((tx: TransactionPayload) => {
    setSelectedAddress(tx.from);
  }, []);

  const handleOpenReport = useCallback((tx: TransactionPayload) => {
    setSelectedTx(tx);
    setSelectedAddress(tx.from);
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-sans pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-8">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} status={isConnected} />

      <main className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col">
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Stream (7/12 cols on desktop) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Live Ingestion Table */}
              <div className="h-[380px] lg:h-[430px] w-full">
                <LiveFeedTable
                  transactions={transactions}
                  onSelectTx={handleSelectTransaction}
                  onOpenReport={handleOpenReport}
                />
              </div>

              {/* Topological Money Flow Graph */}
              <div className="h-[340px] lg:h-[390px] w-full">
                <MoneyFlowCanvas selectedAddress={selectedAddress} />
              </div>
            </div>

            {/* Right Alerts Sentinel Panel (4/12 cols on desktop - sticky matched height) */}
            <div className="lg:col-span-4 h-[450px] lg:h-[844px] lg:sticky lg:top-24">
              <AlertCards
                alerts={alerts}
                onSelectAlert={handleOpenReport}
              />
            </div>
          </div>
        )}

        {activeTab === 'investigation' && (
          <div className="w-full h-[550px] lg:h-[820px]">
            <MoneyFlowCanvas selectedAddress={selectedAddress || transactions[0]?.from || null} />
          </div>
        )}

        {activeTab === 'node' && (
          <div className="liquid-glass p-6 lg:p-10 rounded-3xl lg:rounded-[2.5rem] border border-white/5 space-y-6">
            <div>
              <h3 className="text-xl lg:text-2xl font-heading italic text-white">Node Health & Pipeline Sentinel</h3>
              <p className="text-xs text-white/40 font-mono mt-1">Real-time telemetry of Web3 RPC streams and heuristic decision cores.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">Web3 Ingestion</span>
                <span className="text-emerald-400 font-bold text-lg">ACTIVE</span>
                <span className="text-white/30 block text-[10px] mt-1">Ethereum Mainnet (JSON-RPC)</span>
              </div>
              <div className="p-4 lg:p-5 bg-black/40 rounded-2xl border border-white/5">
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">ML Engine</span>
                <span className="text-cyber-cyan font-bold text-lg">IsolationForest</span>
                <span className="text-white/30 block text-[10px] mt-1">Contamination: 0.05 (Unsupervised)</span>
              </div>
              <div className="p-4 lg:p-5 bg-black/40 rounded-2xl border border-white/5">
                <span className="text-white/40 block text-xs uppercase tracking-wider mb-1">Reasoning Core</span>
                <span className="text-cyber-rose font-bold text-lg">Google Gemini</span>
                <span className="text-white/30 block text-[10px] mt-1">Forensic Dossier Synthesis</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-10 text-center font-mono text-[10px] text-white/30 tracking-wider">
        CRYPTOTRACE AI • ETHEREUM AML & FRAUD SENTINEL
      </footer>

      <ForensicModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}