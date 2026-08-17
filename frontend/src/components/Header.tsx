import React, { useState, useEffect, useCallback } from 'react';
import { Search, Activity, RefreshCw, Zap, Bell, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  status: boolean;
  alertCount: number;
  onSearch?: (query: string) => void;
  selectedAddress?: string | null;
  onOpenAlerts?: () => void;
}

export default function Header({
  status,
  alertCount,
  onSearch,
  selectedAddress,
  onOpenAlerts,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const checkPing = useCallback(async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/health?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const duration = Math.round(performance.now() - start);
        setLatencyMs(duration);
      } else {
        setLatencyMs(null);
      }
    } catch {
      setLatencyMs(null);
    } finally {
      setIsPinging(false);
    }
  }, []);

  useEffect(() => {
    checkPing();
    const interval = setInterval(checkPing, 8000);
    return () => clearInterval(interval);
  }, [checkPing]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="h-20 w-full liquid-glass bg-[#070c20]/60 backdrop-blur-2xl border-b border-cyan-500/20 px-4 sm:px-8 flex items-center justify-between gap-4 z-20 shadow-lg">
      {/* Search Input Bar styled like CryptoBoard */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-cyan-400/60 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search address, tx hash, or block number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-cyan-500/30 focus:border-cyan-400 rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 shadow-inner"
          />
        </div>
      </form>

      {/* Right Action Icons & Badges */}
      <div className="flex items-center gap-3">
        {/* Active Target Address Chip if any */}
        {selectedAddress && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
            <span className="text-[10px] text-white/50 uppercase">Active Probe:</span>
            <span className="font-bold">
              {selectedAddress.slice(0, 6)}...{selectedAddress.slice(-4)}
            </span>
          </div>
        )}

        {/* Threat Alert Counter Button */}
        {onOpenAlerts && (
          <button
            onClick={onOpenAlerts}
            className="relative p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyber-rose/50 hover:bg-cyber-rose/10 transition-all duration-300 text-white/70 hover:text-white cursor-pointer"
            title="High-Risk Sentinel Alerts"
          >
            <Bell className="w-4 h-4 text-white/80" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyber-rose text-[10px] font-bold font-mono text-white flex items-center justify-center border-2 border-[#090d16] animate-pulse shadow-[0_0_8px_#f43f5e]">
                {alertCount}
              </span>
            )}
          </button>
        )}

        {/* RPC Ping Badge */}
        <button
          onClick={checkPing}
          title="Click to test live RPC latency"
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 hover:bg-white/5 transition-all duration-300 text-xs font-mono cursor-pointer"
        >
          <Activity
            className={`w-3.5 h-3.5 ${
              latencyMs !== null && latencyMs < 120
                ? 'text-emerald-400'
                : latencyMs !== null && latencyMs < 300
                ? 'text-yellow-400'
                : 'text-rose-400'
            }`}
          />
          <span className="text-[11px] font-bold text-white/90 font-mono">
            {latencyMs !== null ? `${latencyMs}ms` : '---'}
          </span>
          <RefreshCw
            className={`w-3 h-3 text-white/30 hover:text-cyber-cyan transition-colors ${
              isPinging ? 'animate-spin' : ''
            }`}
          />
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
          <div className={`w-3 h-3 rounded-full ${
            status
              ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse'
              : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
          }`} />
          <span className="hidden sm:inline text-xs font-mono font-bold tracking-wider text-white">
            {status ? 'MAINNET ONLINE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
    </header>
  );
}
