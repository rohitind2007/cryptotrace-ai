import React, { useState } from 'react';
import { Database, Shield, ChevronRight } from 'lucide-react';

import dashboardIcon from '../assets/cryptodash/Dashboard@3x.svg';
import tradeIcon from '../assets/cryptodash/Trade@3x.svg';
import walletIcon from '../assets/cryptodash/Wallet@3x.svg';
import messageIcon from '../assets/cryptodash/Message@3x.svg';
import accountIcon from '../assets/cryptodash/Account@3x.svg';
import collapseIcon from '../assets/cryptodash/Collapse Icon.png';
import logoImg from '../assets/cryptodash/Logo.png';
import giftIllustration from '../assets/cryptodash/Icon Illustrations.png';

export type TabType = 'terminal' | 'investigation' | 'threats' | 'node';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  status: boolean;
  alertCount: number;
  onOpenDatabase?: () => void;
}

export default function RecehTokSidebar({
  activeTab,
  onSelectTab,
  status,
  alertCount,
  onOpenDatabase,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGiftWidget, setShowGiftWidget] = useState(true);

  const handleNavClick = (tabId: TabType) => {
    onSelectTab(tabId);
    if (isCollapsed) {
      setIsCollapsed(false); // expand sidebar on icon click when collapsed
    }
  };

  const handleDbClick = () => {
    if (onOpenDatabase) onOpenDatabase();
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const navItems = [
    {
      id: 'terminal' as TabType,
      label: 'Dashboard',
      sublabel: 'Live Web3 Stream',
      icon: dashboardIcon,
      badge: null,
    },
    {
      id: 'investigation' as TabType,
      label: 'Money Flow',
      sublabel: 'Topology Canvas',
      icon: tradeIcon,
      badge: null,
    },
    {
      id: 'threats' as TabType,
      label: 'Messages',
      sublabel: 'Threat Sentinel Alerts',
      icon: messageIcon,
      hasDot: alertCount > 0,
      badgeText: alertCount > 0 ? `${alertCount}` : null,
    },
    {
      id: 'node' as TabType,
      label: 'System & Node',
      sublabel: 'ML Model Telemetry',
      icon: accountIcon,
      badge: null,
    },
  ];

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={`h-full bg-[#131424] border-r border-white/5 flex flex-col justify-between py-6 z-30 select-none transition-[width,padding] duration-300 ${
        isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-4'
      }`}
    >
      {/* Top Brand Logo & Collapse Toggle */}
      <div className="flex flex-col gap-8 w-full">
        <div
          className={`flex items-center w-full ${
            isCollapsed ? 'justify-center' : 'justify-between px-2'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            className="flex items-center gap-3 min-w-0 group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-full border border-cyan-400/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 overflow-hidden shadow-[0_0_16px_rgba(0,210,255,0.4)] bg-transparent">
              <img
                src="/favicon.png"
                alt="CryptoTrace AI logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-bold text-base text-white tracking-wide truncate">
                CryptoTrace <span className="gradient-text font-black">AI</span>
              </span>
            )}
          </button>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <img
                src={collapseIcon}
                alt=""
                aria-hidden="true"
                className="w-3.5 h-3.5 object-contain"
              />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 w-full" aria-label="Main navigation items">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-label={`${item.label} — ${item.sublabel}`}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center rounded-2xl transition-[color,background-color,border-color,box-shadow] duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131424] ${
                  isCollapsed
                    ? 'w-12 h-12 mx-auto justify-center'
                    : 'w-full gap-3.5 px-3 py-3'
                } ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyber-cyan font-bold border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && !isCollapsed && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-cyber-cyan rounded-r-full shadow-[0_0_10px_#22d3ee]" />
                )}

                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className={`w-5 h-5 object-contain transition-[filter,opacity] duration-200 ${
                      isActive ? 'filter brightness-150 drop-shadow-[0_0_6px_rgba(0,210,255,0.8)]' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-xs font-bold tracking-wide truncate">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-white/30 font-mono truncate">
                      {item.sublabel}
                    </span>
                  </div>
                )}

                {/* Pink Notification Badge */}
                {item.hasDot && (
                  <span className={`${isCollapsed ? 'absolute top-2 right-2' : 'ml-auto flex items-center gap-1'}`}>
                    {!isCollapsed && item.badgeText && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#ff2d87]/20 border border-[#ff2d87]/40 text-[#ff2d87] text-[9px] font-mono font-bold tabular-nums">
                        {item.badgeText}
                      </span>
                    )}
                    <span className="w-2 h-2 rounded-full bg-[#ff2d87] shadow-[0_0_8px_#ff2d87] animate-pulse" aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}

          {/* Database Explorer Item directly in Sidebar */}
          {onOpenDatabase && (
            <button
              type="button"
              onClick={handleDbClick}
              aria-label="Open Neon SQL Database PostgreSQL Ledger"
              className={`relative flex items-center rounded-2xl text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-[color,background-color,border-color] duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131424] ${
                isCollapsed
                  ? 'w-12 h-12 mx-auto justify-center'
                  : 'w-full gap-3.5 px-3 py-3'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0 text-purple-400">
                <Database size={18} aria-hidden="true" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-xs font-bold tracking-wide truncate text-white">
                    Neon SQL DB
                  </span>
                  <span className="text-[9px] text-purple-300/40 font-mono truncate">
                    PostgreSQL Ledger
                  </span>
                </div>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Area: Promo Widget & Connection Status */}
      <div className="flex flex-col gap-3 w-full">
        {/* Bottom Gift Widget */}
        {!isCollapsed && showGiftWidget && (
          <div className="p-4 rounded-2xl bg-[#1e1f38] border border-white/5 flex flex-col items-center text-center relative group shadow-xl">
            <img
              src={giftIllustration}
              alt=""
              aria-hidden="true"
              className="w-14 h-14 object-contain -mt-8 mb-2 filter drop-shadow-[0_8px_16px_rgba(245,166,35,0.3)] animate-float"
            />
            <span className="text-[11px] text-white/50 font-mono">
              Live scanned volume
            </span>
            <span className="text-xs font-mono font-bold text-white mt-0.5 tabular-nums">
              0.02343,00 <span className="text-cyber-cyan">ETH</span>
            </span>

            <div className="flex items-center gap-2 w-full mt-3">
              <button
                type="button"
                onClick={onOpenDatabase}
                aria-label="Explore Neon Database"
                className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30 text-[10px] font-mono font-bold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                Explore DB
              </button>
              <button
                type="button"
                onClick={() => setShowGiftWidget(false)}
                aria-label="Dismiss scanned volume widget"
                className="px-2 py-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white text-[10px] font-mono transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Network Status Dot */}
        <div className={`rounded-2xl bg-[#171829] border border-white/5 flex items-center ${
          isCollapsed ? 'p-3 justify-center w-12 h-12 mx-auto' : 'p-2.5 justify-between'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${status ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} aria-hidden="true" />
            {!isCollapsed && (
              <span className={`text-[10px] font-mono truncate ${status ? 'text-white/70' : 'text-rose-400/80 font-bold'}`}>
                {status ? 'Ethereum Mainnet' : 'Mainnet (Offline)'}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
