import React from 'react';
import { Shield, Database, Activity as ActivityIcon } from 'lucide-react';

import homeIcon from '../assets/cryptoboard/icons/Home.png';
import activityIcon from '../assets/cryptoboard/icons/Activity.png';
import swapIcon from '../assets/cryptoboard/icons/Swap.png';
import bagIcon from '../assets/cryptoboard/icons/Bag.png';
import settingIcon from '../assets/cryptoboard/icons/Setting.png';
import infoIcon from '../assets/cryptoboard/icons/Info Square.png';

export type TabType = 'terminal' | 'investigation' | 'threats' | 'node';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  status: boolean;
  alertCount: number;
  onOpenDatabase?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  status,
  alertCount,
  onOpenDatabase,
}: SidebarProps) {
  const navItems = [
    {
      id: 'terminal' as TabType,
      label: 'Live Terminal',
      sublabel: 'Ingestion & Monitor',
      icon: homeIcon,
      badge: null,
    },
    {
      id: 'investigation' as TabType,
      label: 'Money Flow',
      sublabel: 'Visual Trace Graph',
      icon: swapIcon,
      badge: null,
    },
    {
      id: 'threats' as TabType,
      label: 'Threat Sentinel',
      sublabel: 'High-Risk Alerts',
      icon: bagIcon,
      badge: alertCount > 0 ? `${alertCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'node' as TabType,
      label: 'Node Health',
      sublabel: 'ML Engine & DB',
      icon: settingIcon,
      badge: status ? 'Active' : 'Offline',
      badgeColor: status ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
  ];

  return (
    <aside className="w-20 md:w-64 h-full liquid-glass bg-[#070c20]/60 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col justify-between py-5 px-3 z-30 select-none transition-all duration-300 shadow-2xl">
      {/* Top Section: Brand */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-violet-600/40 border border-cyan-400/40 flex items-center justify-center glow-border-cyan shrink-0 shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-heading font-black italic tracking-wider text-base text-white">
              Crypto<span className="gradient-text">Board</span>
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300/60">
              Trace AI Sentinel
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          <span className="hidden md:block text-[10px] font-mono font-bold uppercase tracking-widest text-white/30 px-3 py-1">
            Menu
          </span>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-white border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Active Bar indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyber-cyan rounded-r-full shadow-[0_0_8px_#22d3ee]" />
                )}

                {/* CryptoBoard Iconly Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyber-cyan shadow-inner'
                      : 'bg-white/[0.04] text-white/70 group-hover:bg-white/10'
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`w-5 h-5 object-contain transition-all duration-300 ${
                      isActive ? 'brightness-125 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  />
                </div>

                <div className="hidden md:flex flex-col text-left flex-1 min-w-0">
                  <span className={`text-xs font-semibold tracking-wide truncate ${isActive ? 'text-white font-bold' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono truncate">
                    {item.sublabel}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`hidden md:inline-flex text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.badgeColor || 'bg-white/10 text-white/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Neon SQL Explorer & System Health */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        {onOpenDatabase && (
          <button
            onClick={onOpenDatabase}
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30 transition-all duration-300 text-xs font-mono group cursor-pointer hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            title="Open Neon PostgreSQL Table Explorer"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-cyber-cyan">Neon SQL</span>
              <span className="text-[9px] text-white/40">Database Engine</span>
            </div>
          </button>
        )}

        {/* Node Status Card */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Network</span>
              <span className="text-xs font-bold font-mono text-white/90 truncate">Ethereum Mainnet</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
