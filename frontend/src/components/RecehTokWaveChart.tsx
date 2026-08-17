import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, Activity, ArrowUpRight, ShieldAlert, Zap, TrendingUp } from 'lucide-react';
import { TransactionPayload } from '../types';

interface WaveChartProps {
  onOpenCanvas: () => void;
  selectedAddress?: string | null;
  selectedTx?: TransactionPayload | null;
  transactions?: TransactionPayload[];
  onSelectToken?: (token: 'BTC' | 'ETH' | 'LTC') => void;
}

export default function RecehTokWaveChart({
  onOpenCanvas,
  selectedAddress,
  selectedTx,
  transactions = [],
  onSelectToken,
}: WaveChartProps) {
  const [activeToken, setActiveToken] = useState<'BTC' | 'ETH' | 'LTC'>('BTC');

  // Take recent 7 transactions for the wave nodes
  const recentTxs = useMemo(() => {
    if (transactions.length === 0) return [];
    return transactions.slice(0, 7).reverse();
  }, [transactions]);

  // Active highlighted transaction (either explicitly selectedTx or latest)
  const activeInspection = selectedTx || transactions[0] || null;

  // Compute curve coordinates dynamically from transactions with strict container bounds
  const { cyanPath, pinkPath, goldPath, focalPoint } = useMemo(() => {
    const paddingX = 40;
    const usableWidth = 700 - paddingX * 2;
    const height = 280;

    if (recentTxs.length < 2) {
      return {
        cyanPath: "M 40,230 C 120,210 190,230 260,180 C 330,130 400,190 470,150 C 505,130 540,170 600,140 C 630,120 650,140 660,130",
        pinkPath: "M 40,210 C 110,230 170,170 240,190 C 310,210 370,140 440,160 C 510,180 570,110 630,140 C 650,150 655,135 660,140",
        goldPath: "M 40,220 C 120,240 180,190 260,210 C 340,230 420,180 500,190 C 570,200 620,170 660,180",
        focalPoint: { x: 440, yCyan: 140, yPink: 160, yGold: 190 },
      };
    }

    const step = usableWidth / (recentTxs.length - 1);

    // Max values for scaling
    const maxVal = Math.max(...recentTxs.map(t => Number(t.value_eth) || 0), 10);
    const maxRisk = 100;
    const maxGas = Math.max(...recentTxs.map(t => Number(t.gas_price_gwei) || 0), 50);

    const cyanPoints = recentTxs.map((t, i) => {
      const val = Number(t.value_eth) || 0;
      const norm = Math.min(val / maxVal, 1);
      const y = height - 45 - norm * 170; // within 65px - 235px
      return { x: paddingX + i * step, y };
    });

    const pinkPoints = recentTxs.map((t, i) => {
      const risk = Number(t.risk_score) || (t.is_suspicious ? 80 : 15);
      const norm = risk / maxRisk;
      const y = height - 55 - norm * 150;
      return { x: paddingX + i * step, y };
    });

    const goldPoints = recentTxs.map((t, i) => {
      const gas = Number(t.gas_price_gwei) || 20;
      const norm = Math.min(gas / maxGas, 1);
      const y = height - 65 - norm * 120;
      return { x: paddingX + i * step, y };
    });

    // Helper to generate smooth bezier curve SVG path
    const generateSmoothPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
      }
      return d;
    };

    // Find focal index of selected transaction
    let focalIdx = recentTxs.length - 1;
    if (activeInspection) {
      const matchIdx = recentTxs.findIndex(t => t.tx_hash === activeInspection.tx_hash);
      if (matchIdx !== -1) focalIdx = matchIdx;
    }

    const focalX = cyanPoints[focalIdx]?.x ?? 440;
    const focalYCyan = cyanPoints[focalIdx]?.y ?? 140;
    const focalYPink = pinkPoints[focalIdx]?.y ?? 160;
    const focalYGold = goldPoints[focalIdx]?.y ?? 190;

    return {
      cyanPath: generateSmoothPath(cyanPoints),
      pinkPath: generateSmoothPath(pinkPoints),
      goldPath: generateSmoothPath(goldPoints),
      focalPoint: { x: focalX, yCyan: focalYCyan, yPink: focalYPink, yGold: focalYGold },
    };
  }, [recentTxs, activeInspection]);

  // Display badges value calculations
  const displayEthVal = activeInspection ? Number(activeInspection.value_eth || 0).toFixed(3) : "7.357";
  const displayRiskVal = activeInspection ? `${activeInspection.risk_score || (activeInspection.is_suspicious ? 75 : 12)}%` : "29%";
  const displayGasVal = activeInspection ? `${activeInspection.gas_price_gwei || '18'} Gwei` : "18 Gwei";
  const displayUsdVal = activeInspection ? `$${((Number(activeInspection.value_eth) || 0) * 3492).toLocaleString()}` : "$3.43 M";

  // Compute percentage position across container width (0-100%)
  const percentX = Math.min(Math.max((focalPoint.x / 700) * 100, 8), 92);
  const isRightSide = percentX > 45;

  return (
    <div className="w-full bg-[#1b1c33]/90 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group select-none transition-all duration-300">
      {/* Top Header & Legend */}
      <div className="flex flex-wrap justify-between items-center gap-3 z-10 mb-4">
        {/* Curve Legend Filters */}
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <button
            onClick={() => {
              setActiveToken('BTC');
              if (onSelectToken) onSelectToken('BTC');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
              activeToken === 'BTC'
                ? 'bg-[#ff2d87]/20 border border-[#ff2d87]/60 text-white font-bold shadow-[0_0_12px_rgba(255,45,135,0.4)]'
                : 'text-white/40 hover:text-white/80 border border-transparent'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d87] shadow-[0_0_8px_#ff2d87]" />
            <span>Threat Risk</span>
          </button>

          <button
            onClick={() => {
              setActiveToken('ETH');
              if (onSelectToken) onSelectToken('ETH');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
              activeToken === 'ETH'
                ? 'bg-[#00d2ff]/20 border border-[#00d2ff]/60 text-white font-bold shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                : 'text-white/40 hover:text-white/80 border border-transparent'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] shadow-[0_0_8px_#00d2ff]" />
            <span>ETH Inflow ($3,492)</span>
          </button>

          <button
            onClick={() => {
              setActiveToken('LTC');
              if (onSelectToken) onSelectToken('LTC');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
              activeToken === 'LTC'
                ? 'bg-[#f5a623]/20 border border-[#f5a623]/60 text-white font-bold shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                : 'text-white/40 hover:text-white/80 border border-transparent'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#f5a623] shadow-[0_0_8px_#f5a623]" />
            <span>Gas Velocity</span>
          </button>
        </div>

        {/* Selected Transaction Chip */}
        {activeInspection && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#131424] border border-cyan-500/30 text-cyber-cyan text-xs font-mono animate-in fade-in duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-white/60">Inspecting:</span>
            <strong className="text-white">
              {activeInspection.tx_hash ? `${activeInspection.tx_hash.slice(0, 8)}...` : '0x0'}
            </strong>
            <span className="text-cyan-300 font-bold">({displayEthVal} ETH)</span>
          </div>
        )}

        {/* Action Toggle to Full Topology Flow Canvas */}
        <button
          onClick={onOpenCanvas}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyber-cyan border border-cyan-400/40 text-xs font-mono font-bold transition-all duration-300 cursor-pointer hover:scale-[1.03] shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <GitFork size={14} />
          <span>Interactive Topology Graph</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Main Multi-Curve Wave SVG Canvas */}
      <div className="relative w-full h-[280px] sm:h-[320px] flex">
        {/* Y-Axis Labels */}
        <div className="w-12 flex flex-col justify-between text-[10px] font-mono text-white/30 py-2 select-none">
          <span>6.500</span>
          <span>6.000</span>
          <span>5.500</span>
          <span>5.000</span>
          <span>4.500</span>
          <span>4.000</span>
          <span>3.500</span>
          <span>3.000</span>
          <span>2.500</span>
          <span>2.000</span>
        </div>

        {/* Wave Curves Graphic Area */}
        <div className="flex-1 relative h-full overflow-hidden">
          <svg
            viewBox="0 0 700 280"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="cyanWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.0" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Grid Lines */}
            {[40, 80, 120, 160, 200, 240].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="700"
                y2={y}
                stroke="rgba(255,255,255,0.03)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Dynamic Vertical Highlight Beam (Moves to active transaction) */}
            <rect
              x={Math.max(0, focalPoint.x - 40)}
              y="0"
              width="80"
              height="280"
              fill="url(#cyanWaveGrad)"
              opacity="0.6"
              rx="16"
              className="transition-all duration-500 ease-out"
            />
            <line
              x1={focalPoint.x}
              y1="0"
              x2={focalPoint.x}
              y2="280"
              stroke="rgba(0, 210, 255, 0.5)"
              strokeDasharray="3 3"
              className="transition-all duration-500 ease-out"
            />

            {/* 1. Yellow/Orange Curve (LTC/Gas) */}
            <path
              d={goldPath}
              fill="none"
              stroke="#f5a623"
              strokeWidth={activeToken === 'LTC' ? '4.5' : '2'}
              opacity={activeToken === 'LTC' ? '1' : '0.4'}
              filter={activeToken === 'LTC' ? 'url(#glow)' : undefined}
              className="transition-all duration-700 ease-in-out"
            />

            {/* 2. Pink/Magenta Curve (BTC / Threat Risk Rating) */}
            <path
              d={pinkPath}
              fill="none"
              stroke="#ff2d87"
              strokeWidth={activeToken === 'BTC' ? '4.5' : '2.5'}
              opacity={activeToken === 'BTC' ? '1' : '0.6'}
              filter={activeToken === 'BTC' ? 'url(#glow)' : undefined}
              className="transition-all duration-700 ease-in-out"
            />

            {/* 3. Cyan Curve (ETH Inflow Volume) */}
            <path
              d={cyanPath}
              fill="none"
              stroke="#00d2ff"
              strokeWidth={activeToken === 'ETH' ? '4.5' : '3'}
              opacity={activeToken === 'ETH' ? '1' : '0.6'}
              filter={activeToken === 'ETH' ? 'url(#glow)' : undefined}
              className="transition-all duration-700 ease-in-out"
            />

            {/* Dynamic Focal Indicator Points */}
            <circle
              cx={focalPoint.x}
              cy={focalPoint.yPink}
              r="6"
              fill="#ffffff"
              stroke="#ff2d87"
              strokeWidth="3"
              className="animate-pulse shadow-[0_0_12px_#ff2d87] transition-all duration-500 ease-out"
            />
            <circle
              cx={focalPoint.x}
              cy={focalPoint.yCyan}
              r="6"
              fill="#ffffff"
              stroke="#00d2ff"
              strokeWidth="3"
              className="animate-pulse shadow-[0_0_12px_#00d2ff] transition-all duration-500 ease-out"
            />
          </svg>

          {/* Dynamic Floating Badges - Transform Inward to Always Stay Inside Box */}
          <div
            className="absolute z-20 flex flex-col gap-2 pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: `${percentX}%`,
              transform: isRightSide ? 'translateX(calc(-100% - 24px))' : 'translateX(24px)',
              top: '40px',
            }}
          >
            {/* Risk Badge */}
            <span className="px-3.5 py-1.5 rounded-full bg-[#1b1c33]/95 border border-[#ff2d87]/70 text-[#ff2d87] text-[10px] font-mono font-bold shadow-[0_0_15px_rgba(255,45,135,0.45)] flex items-center gap-1.5 w-fit whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d87]" />
              Threat Risk: {displayRiskVal}
            </span>

            {/* Gas Badge */}
            <span className="px-3.5 py-1.5 rounded-full bg-[#1b1c33]/95 border border-[#f5a623]/70 text-[#f5a623] text-[10px] font-mono font-bold shadow-[0_0_15px_rgba(245,166,35,0.35)] flex items-center gap-1.5 w-fit whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
              Gas: {displayGasVal}
            </span>

            {/* Volume Badge */}
            <span className="px-3.5 py-1.5 rounded-full bg-[#1b1c33]/95 border border-[#00d2ff]/70 text-[#00d2ff] text-[10px] font-mono font-bold shadow-[0_0_15px_rgba(0,210,255,0.45)] flex items-center gap-1.5 w-fit whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
              Vol: {displayEthVal} ETH ({displayUsdVal})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
