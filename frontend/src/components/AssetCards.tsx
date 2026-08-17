import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Activity, Zap, ShieldAlert, Flame, Cpu, ArrowUpRight } from 'lucide-react';

interface AssetCardsProps {
  blockNumber: string | number;
  totalScanned: number;
  totalVolumeEth: number;
  highRiskCount: number;
  avgGasPrice: number;
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function AssetCards({
  blockNumber,
  totalScanned,
  totalVolumeEth,
  highRiskCount,
  avgGasPrice,
}: AssetCardsProps) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5"
    >
      {/* 1. Total Volume ETH Card */}
      <motion.div
        variants={cardVariant}
        className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between group hover:border-cyan-500/40 hover:glow-border-cyan transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Live Volume
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1">
              {totalVolumeEth.toFixed(2)} <span className="text-xs text-cyber-cyan font-normal">ETH</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyber-cyan">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[11px] font-mono text-emerald-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Real-time Inflow</span>
        </div>
      </motion.div>

      {/* 2. Threat Detections Card */}
      <motion.div
        variants={cardVariant}
        className={`p-4 rounded-3xl liquid-glass border flex flex-col justify-between group transition-all duration-300 relative overflow-hidden ${
          highRiskCount > 0
            ? 'border-rose-500/40 glow-border-rose'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Threat Flags
            </span>
            <span className={`text-xl font-bold font-mono mt-1 ${highRiskCount > 0 ? 'text-cyber-rose' : 'text-white'}`}>
              {highRiskCount} <span className="text-xs font-normal">Flagged</span>
            </span>
          </div>
          <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
            highRiskCount > 0
              ? 'bg-rose-500/20 border border-rose-500/30 text-cyber-rose animate-pulse'
              : 'bg-white/5 text-white/40'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[11px] font-mono text-white/40">
          <span>{highRiskCount > 0 ? 'Action required' : 'Sentinel optimal'}</span>
        </div>
      </motion.div>

      {/* 3. Block Height Card */}
      <motion.div
        variants={cardVariant}
        className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Block Height
            </span>
            <span className="text-lg font-bold font-mono text-white mt-1 truncate">
              #{blockNumber || '19420550'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[11px] font-mono text-white/40">
          <span>Synced with Mainnet</span>
        </div>
      </motion.div>

      {/* 4. Transactions Scanned Card */}
      <motion.div
        variants={cardVariant}
        className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Tx Stream
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1">
              {totalScanned} <span className="text-xs text-emerald-400 font-normal">Units</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[11px] font-mono text-emerald-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Continuous Poll</span>
        </div>
      </motion.div>

      {/* 5. Network Gas Price Card */}
      <motion.div
        variants={cardVariant}
        className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between group hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Gas Velocity
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1">
              {avgGasPrice.toFixed(1)} <span className="text-xs text-orange-400 font-normal">Gwei</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[11px] font-mono text-white/40">
          <span>Standard Base Fee</span>
        </div>
      </motion.div>

      {/* 6. ML Anomaly Core */}
      <motion.div
        variants={cardVariant}
        className="p-4 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              ML Anomaly Core
            </span>
            <span className="text-sm font-bold font-mono gradient-text mt-1">
              iForest (5%)
            </span>
          </div>
          <div className="w-8 h-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyber-cyan">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[11px] font-mono text-white/40">
          <span>Outlier Scoring</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
