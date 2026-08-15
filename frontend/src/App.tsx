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
          const newTxs = await response.json();
          if (isMounted) {
            setIsConnected(true);
            if (Array.isArray(newTxs) && newTxs.length > 0) {
              setTransactions((prev) => [...newTxs, ...prev].slice(0, 50));
              const newAlerts = newTxs.filter((t: TransactionPayload) => t.is_suspicious);
              if (newAlerts.length > 0) {
                setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20));
              }
            }
          }
        } else {
          if (isMounted) setIsConnected(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (isMounted) setIsConnected(false);
      }
    };

    // Initial fetch when tab opens
    fetchFeed();

    // Poll every 3.5 seconds while tab is active
    const interval = setInterval(fetchFeed, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Updates the Money Flow Graph only
  const handleSelectTransaction = useCallback((tx: TransactionPayload) => {
    setSelectedAddress(tx.from);
  }, []);

  // Opens the Forensic Dossier Modal
  const handleOpenReport = useCallback((tx: TransactionPayload) => {
    setSelectedTx(tx);
    setSelectedAddress(tx.from);
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-sans pt-24 px-8 pb-8">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} status={isConnected} />

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 max-w-7xl mx-auto w-full">
        {activeTab === 'terminal' && (
          <>
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="h-[420px]">
                <LiveFeedTable
                  transactions={transactions}
                  onSelectTx={handleSelectTransaction}
                  onOpenReport={handleOpenReport}
                />
              </div>
              <div className="h-[380px]">
                <MoneyFlowCanvas selectedAddress={selectedAddress} />
              </div>
            </div>
            <div className="h-full">
              <AlertCards
                alerts={alerts}
                onSelectAlert={handleOpenReport}
              />
            </div>
          </>
        )}

        {activeTab === 'investigation' && (
          <div className="lg:col-span-3 h-[750px]">
            <MoneyFlowCanvas selectedAddress={selectedAddress || transactions[0]?.from || null} />
          </div>
        )}

        {activeTab === 'node' && (
          <div className="lg:col-span-3 liquid-glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
            <h3 className="text-xl font-heading italic text-white">Node Health & Pipeline</h3>
            <div className="grid grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 block">Serverless Ingestion</span>
                <span className="text-emerald-400 font-bold text-base">ACTIVE (On-Demand)</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 block">ML Engine</span>
                <span className="text-cyber-cyan font-bold text-base">IsolationForest</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/40 block">Reasoning Core</span>
                <span className="text-cyber-rose font-bold text-base">Google Gemini</span>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Global Page Footer */}
      <footer className="mt-12 text-center font-mono text-[10px] text-white/30 tracking-wider">
        CRYPTOTRACE AI • ETHEREUM AML & FRAUD SENTINEL
      </footer>

      <ForensicModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}