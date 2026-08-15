import React, { useState } from "react";
import { Terminal, Shield, Wifi, Globe, Loader2 } from "lucide-react";

interface NavbarProps {
  activeTab: "terminal" | "investigation" | "node";
  onSelectTab: (tab: "terminal" | "investigation" | "node") => void;
  status: boolean;
}

export default function Navbar({
  activeTab,
  onSelectTab,
  status,
}: NavbarProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const handlePingServer = async () => {
    if (isPinging) return;
    setIsPinging(true);
    const start = performance.now();

    try {
      const res = await fetch("http://localhost:8000/api/health", { cache: "no-store" });
      if (res.ok) {
        const roundTripMs = Math.round(performance.now() - start);
        setLatency(roundTripMs);
      } else {
        setLatency(null);
      }
    } catch {
      setLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <nav className="fixed top-4 inset-x-0 px-8 z-50 flex justify-center">
      <div className="liquid-glass rounded-full px-6 py-2.5 flex items-center gap-12 border border-white/5 max-w-5xl w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center text-cyber-cyan border border-cyber-cyan/20">
            <Shield size={20} />
          </div>
          <span className="font-heading italic text-2xl tracking-tighter text-white">
            CryptoTrace AI
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <button
            onClick={() => onSelectTab("terminal")}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              activeTab === "terminal"
                ? "text-cyber-cyan font-bold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Terminal size={14} />
            Terminal
          </button>

          <button
            onClick={() => onSelectTab("investigation")}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              activeTab === "investigation"
                ? "text-cyber-cyan font-bold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Globe size={14} />
            Investigation
          </button>

          <button
            onClick={() => onSelectTab("node")}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              activeTab === "node"
                ? "text-cyber-cyan font-bold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Wifi size={14} />
            Node Monitor
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[9px] uppercase tracking-widest text-white/40 leading-none">
              {latency !== null ? `Latency: ${latency}ms` : "Status"}
            </div>
            <div
              className={`text-[11px] font-bold ${status ? "text-emerald-400" : "text-rose-500"}`}
            >
              {status ? "ONLINE" : "CONNECTING"}
            </div>
          </div>
          <button
            onClick={handlePingServer}
            title="Ping Backend Server"
            className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center text-white/40 hover:text-cyber-cyan transition-all border border-white/5 hover:border-cyber-cyan/30 active:scale-95 cursor-pointer"
          >
            {isPinging ? (
              <Loader2 size={18} className="animate-spin text-cyber-cyan" />
            ) : (
              <Globe size={18} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}