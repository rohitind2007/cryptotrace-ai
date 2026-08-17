import React, { useState } from 'react';
import { Search, Grid, Bell, ChevronDown, Activity, Database, RefreshCw, Download, Layers, Shield } from 'lucide-react';

interface HeaderProps {
  status: boolean;
  alertCount: number;
  onSearch?: (query: string) => void;
  onOpenAlerts?: () => void;
  onOpenDatabase?: () => void;
  onRefreshFeed?: () => void;
  onToggleGridView?: () => void;
  isGridView?: boolean;
  title?: string;
  subtitle?: string;
}

export default function RecehTokHeader({
  status,
  alertCount,
  onSearch,
  onOpenAlerts,
  onOpenDatabase,
  onRefreshFeed,
  onToggleGridView,
  isGridView,
  title = "Dashboard",
  subtitle = "Real-time Ethereum AML & Threat Sentinel",
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefreshFeed) onRefreshFeed();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="w-full flex flex-wrap justify-between items-center gap-4 py-4 px-2 select-none relative">
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2.5">
          <span>{title}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyber-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE MAINNET
          </span>
        </h1>
        <p className="text-xs text-white/40 mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Search address (0x...) or hash..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            className="w-48 sm:w-64 pl-8 pr-8 py-2 bg-[#1b1c33] border border-white/10 focus:border-cyan-400 rounded-full text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
          />
          <Search size={13} className="absolute left-3 text-white/30 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (onSearch) onSearch('');
              }}
              className="absolute right-3 text-white/40 hover:text-white text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </form>

        {/* Grid / Buffer Risk Heatmap Matrix Toggle Button */}
        <button
          onClick={onToggleGridView}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            isGridView
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.3)]'
              : 'bg-[#1b1c33] border-white/10 text-white/50 hover:text-white hover:border-white/20'
          }`}
          title="Open Buffer Risk Heatmap Matrix (All 100 Transactions)"
        >
          <Grid size={14} />
        </button>

        {/* Refresh Feed Button */}
        <button
          onClick={handleRefreshClick}
          className="p-2.5 rounded-full bg-[#1b1c33] border border-white/10 hover:border-cyan-400/40 text-white/50 hover:text-cyan-300 transition-all cursor-pointer"
          title="Force poll latest transactions"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
        </button>

        {/* Pink Notification Pill Badge */}
        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ff2d87] hover:bg-[#ff2d87]/90 text-white font-bold text-xs font-mono shadow-[0_0_15px_rgba(255,45,135,0.45)] transition-all cursor-pointer active:scale-95"
          title="Open Threat Sentinel Alerts"
        >
          <Bell size={13} />
          <span>{alertCount > 0 ? alertCount : '0'}</span>
        </button>

        {/* User / Sentinel Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-full bg-[#1b1c33] hover:bg-[#23243f] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 p-[1.5px] shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-[#131424] flex items-center justify-center font-bold text-[10px] font-mono text-cyan-300">
                AD
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-white tracking-wide">
              <span>Admin</span>
              <ChevronDown size={12} className={`text-white/40 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-56 p-2 rounded-2xl bg-[#1b1c33] border border-white/10 shadow-2xl z-50 flex flex-col gap-1 text-xs font-mono">
              <div className="px-3 py-2 border-b border-white/5 flex flex-col">
                <span className="text-[10px] text-white/40 uppercase">Signed in as</span>
                <span className="font-bold text-white text-xs">Admin (Sentinel Lead)</span>
                <span className="text-[9px] text-emerald-400 mt-0.5">● Node Connected (Mainnet)</span>
              </div>

              {onOpenDatabase && (
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenDatabase();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Database size={13} className="text-cyber-cyan" />
                  <span>Neon SQL Explorer</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onOpenAlerts) onOpenAlerts();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Shield size={13} className="text-rose-400" />
                <span>Threat Sentinel Feed</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleRefreshClick();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <RefreshCw size={13} className="text-purple-400" />
                <span>Sync Node Telemetry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
