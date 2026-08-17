import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  GitFork,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Wallet,
  Coins,
  Building2,
  Lock,
  Sparkles,
  Network,
  Orbit,
  Move,
} from "lucide-react";

interface Props {
  selectedAddress: string | null;
  onSelectAddress?: (address: string) => void;
}

interface FlowNodeData {
  label: string;
  address: string;
  category: "target" | "mixer" | "dex" | "cex" | "storage" | "lending" | "wallet";
  riskScore: number;
  ethAmount?: string;
  isTarget?: boolean;
  onSelect?: (address: string) => void;
}

/* ─── Custom Flow Node Component with Wide Aesthetics & Free Draggability ─── */
function CustomFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.address) {
      navigator.clipboard.writeText(data.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClick = () => {
    if (data.onSelect && data.address) {
      data.onSelect(data.address);
    }
  };

  const config = useMemo(() => {
    switch (data.category) {
      case "target":
        return {
          border: "border-cyan-400/90 ring-2 ring-cyan-400/30 shadow-[0_0_35px_rgba(0,210,255,0.35)]",
          bg: "bg-gradient-to-br from-[#1b253b] via-[#15192c] to-[#121424]",
          badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
          icon: <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />,
          accentText: "text-cyan-300",
          tag: "TARGET PROBE",
        };
      case "mixer":
        return {
          border: "border-rose-500/80 ring-2 ring-rose-500/30 shadow-[0_0_25px_rgba(255,45,135,0.35)]",
          bg: "bg-gradient-to-br from-[#2a1727] via-[#1c1425] to-[#131424]",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
          accentText: "text-rose-400",
          tag: "THREAT / MIXER",
        };
      case "dex":
        return {
          border: "border-emerald-400/70 ring-1 ring-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
          bg: "bg-gradient-to-br from-[#162923] via-[#141e26] to-[#131424]",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
          icon: <Coins className="w-3.5 h-3.5 text-emerald-400" />,
          accentText: "text-emerald-400",
          tag: "DEX PROTOCOL",
        };
      case "cex":
        return {
          border: "border-amber-400/70 ring-1 ring-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
          bg: "bg-gradient-to-br from-[#292218] via-[#1c1822] to-[#131424]",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
          icon: <Building2 className="w-3.5 h-3.5 text-amber-400" />,
          accentText: "text-amber-400",
          tag: "CEX EXCHANGE",
        };
      case "storage":
        return {
          border: "border-indigo-400/60 ring-1 ring-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]",
          bg: "bg-gradient-to-br from-[#1a1c38] via-[#141528] to-[#131424]",
          badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
          icon: <Lock className="w-3.5 h-3.5 text-indigo-400" />,
          accentText: "text-indigo-400",
          tag: "VAULT / COLD",
        };
      default:
        return {
          border: "border-slate-700/80 hover:border-slate-500 shadow-xl",
          bg: "bg-gradient-to-br from-[#1e2038] via-[#171829] to-[#131424]",
          badgeBg: "bg-white/10 text-slate-300 border-white/10",
          icon: <Wallet className="w-3.5 h-3.5 text-slate-300" />,
          accentText: "text-slate-200",
          tag: "WALLET",
        };
    }
  }, [data.category]);

  const shortAddr = data.address
    ? `${data.address.slice(0, 6)}...${data.address.slice(-4)}`
    : "";

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl border p-3.5 w-[230px] cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${config.bg} ${config.border}`}
    >
      {/* React Flow Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-[#131424] !-top-2 transition-transform group-hover:scale-125"
      />

      {/* Header: Icon & Category Tag */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {config.icon}
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate ${config.badgeBg}`}>
            {config.tag}
          </span>
        </div>
        {data.riskScore > 0 && (
          <span
            className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 ${
              data.riskScore >= 70
                ? "bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse"
                : data.riskScore >= 40
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {data.riskScore}%
          </span>
        )}
      </div>

      {/* Label / Entity Name */}
      <div className="mb-2">
        <h4 className={`text-xs font-bold font-heading truncate ${config.accentText}`}>
          {data.label}
        </h4>
      </div>

      {/* Address & Copy Action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-white/50">
        <span className="truncate group-hover:text-white/80 transition-colors">
          {shortAddr}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
          title="Copy address"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
        </button>
      </div>

      {/* Optional ETH volume chip */}
      {data.ethAmount && (
        <div className="mt-1.5 pt-1 flex items-center justify-between text-[10px] font-mono text-cyan-300/80">
          <span className="text-white/30 text-[9px]">FLOW:</span>
          <span className="font-bold">{data.ethAmount}</span>
        </div>
      )}

      {/* React Flow Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-[#131424] !-bottom-2 transition-transform group-hover:scale-125"
      />
    </div>
  );
}

const nodeTypes = {
  flowNode: CustomFlowNode,
};

/* ─── Spacious Tree Layout Generator ─── */
function generateSpaciousTreeTopology(targetAddr: string): { nodes: Node[]; edges: Edge[] } {
  const targetLower = targetAddr.toLowerCase();
  
  let seed = 0;
  for (let i = 0; i < targetLower.length; i++) {
    seed = (seed * 31 + targetLower.charCodeAt(i)) & 0xffffffff;
  }
  const pseudoRand = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const branchProtocols = [
    { label: "Uniswap V3 Router", category: "dex" as const, risk: 15 },
    { label: "Tornado.Cash Relayer", category: "mixer" as const, risk: 94 },
    { label: "Binance Hot Deposit", category: "cex" as const, risk: 25 },
    { label: "Aave V3 Collateral", category: "lending" as const, risk: 20 },
  ];

  const subNodesPool = [
    { label: "Settled Inflow", category: "wallet" as const, risk: 10 },
    { label: "Cold Storage Safe", category: "storage" as const, risk: 5 },
    { label: "Split Relay Node", category: "mixer" as const, risk: 88 },
    { label: "Arbitrage Flashbot", category: "dex" as const, risk: 35 },
    { label: "Curve.fi LP Pool", category: "dex" as const, risk: 12 },
    { label: "Kraken Settlement", category: "cex" as const, risk: 20 },
  ];

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root Target Node at Center Top
  const rootX = 580;
  const rootY = 40;

  nodes.push({
    id: targetLower,
    type: "flowNode",
    position: { x: rootX, y: rootY },
    draggable: true,
    data: {
      label: `Target Probe (${targetLower.slice(0, 6)}...${targetLower.slice(-4)})`,
      address: targetLower,
      category: "target",
      riskScore: 68,
      isTarget: true,
    },
  });

  // Level 1: 3 Spacious Branches
  const numHops1 = 3;
  const hop1Spacing = 440; // Wide horizontal gap between Level 1 nodes
  const startHop1X = rootX - ((numHops1 - 1) * hop1Spacing) / 2;
  const hop1Y = 270; // 230px vertical gap

  for (let i = 0; i < numHops1; i++) {
    const protoIndex = Math.floor(pseudoRand(i + 1) * branchProtocols.length) % branchProtocols.length;
    const proto = branchProtocols[protoIndex];
    const hop1Addr = `0x${Array.from({ length: 40 }, (_, k) =>
      Math.floor(pseudoRand(k + i * 10) * 16).toString(16)
    ).join("")}`;

    const hop1X = startHop1X + i * hop1Spacing;
    const eth1 = (pseudoRand(i + 20) * 45 + 2).toFixed(2);

    nodes.push({
      id: hop1Addr,
      type: "flowNode",
      position: { x: hop1X, y: hop1Y },
      draggable: true,
      data: {
        label: proto.label,
        address: hop1Addr,
        category: proto.category,
        riskScore: proto.risk,
        ethAmount: `${eth1} ETH`,
      },
    });

    const isHighRisk = proto.risk >= 70;
    const stroke = isHighRisk ? "#ff2d87" : "#00d2ff";

    edges.push({
      id: `edge_root_${i}`,
      source: targetLower,
      target: hop1Addr,
      label: `${eth1} ETH`,
      type: "smoothstep",
      animated: true,
      style: { stroke, strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 16, height: 16 },
      labelStyle: { fill: stroke, fontSize: 10, fontFamily: "monospace", fontWeight: 700 },
      labelBgStyle: { fill: "#131424", fillOpacity: 0.95, stroke, strokeWidth: 1, rx: 6, ry: 6 },
    });

    // Level 2: 2 Sub-nodes per hop 1, spaced generously underneath
    const numSub = 2;
    const subGap = 210; // Clearance between sibling sub-nodes
    const hop2Y = 530; // 260px vertical clearance from hop1

    for (let j = 0; j < numSub; j++) {
      const subIndex = Math.floor(pseudoRand(j + i * 5 + 50) * subNodesPool.length) % subNodesPool.length;
      const sub = subNodesPool[subIndex];
      const hop2Addr = `0x${Array.from({ length: 40 }, (_, k) =>
        Math.floor(pseudoRand(k + j * 7 + i * 13) * 16).toString(16)
      ).join("")}`;

      const subOffset = (j === 0 ? -subGap / 2 : subGap / 2);
      const hop2X = hop1X + subOffset;
      const eth2 = (parseFloat(eth1) * (pseudoRand(j + 70) * 0.5 + 0.3)).toFixed(2);

      nodes.push({
        id: hop2Addr,
        type: "flowNode",
        position: { x: hop2X, y: hop2Y },
        draggable: true,
        data: {
          label: sub.label,
          address: hop2Addr,
          category: sub.category,
          riskScore: sub.risk,
          ethAmount: `${eth2} ETH`,
        },
      });

      const subStroke = sub.risk >= 70 ? "#ff2d87" : "#00e676";

      edges.push({
        id: `edge_${i}_${j}`,
        source: hop1Addr,
        target: hop2Addr,
        label: `${eth2} ETH`,
        type: "smoothstep",
        animated: true,
        style: { stroke: subStroke, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: subStroke, width: 14, height: 14 },
        labelStyle: { fill: subStroke, fontSize: 9, fontFamily: "monospace", fontWeight: 700 },
        labelBgStyle: { fill: "#131424", fillOpacity: 0.95, stroke: subStroke, strokeWidth: 1, rx: 6, ry: 6 },
      });
    }
  }

  return { nodes, edges };
}

/* ─── Radial Orbit Layout Generator ─── */
function applyRadialOrbitLayout(nodes: Node[]): Node[] {
  const targetNode = nodes.find((n) => (n.data as any)?.isTarget) || nodes[0];
  if (!targetNode) return nodes;

  const centerX = 650;
  const centerY = 400;

  const otherNodes = nodes.filter((n) => n.id !== targetNode.id);
  const hop1Nodes = otherNodes.slice(0, 3);
  const hop2Nodes = otherNodes.slice(3);

  const radius1 = 280;
  const radius2 = 480;

  return nodes.map((node) => {
    if (node.id === targetNode.id) {
      return { ...node, position: { x: centerX, y: centerY } };
    }

    const hop1Index = hop1Nodes.findIndex((n) => n.id === node.id);
    if (hop1Index !== -1) {
      const angle = (hop1Index * (2 * Math.PI)) / hop1Nodes.length - Math.PI / 2;
      return {
        ...node,
        position: {
          x: Math.round(centerX + radius1 * Math.cos(angle)),
          y: Math.round(centerY + radius1 * Math.sin(angle)),
        },
      };
    }

    const hop2Index = hop2Nodes.findIndex((n) => n.id === node.id);
    if (hop2Index !== -1) {
      const angle = (hop2Index * (2 * Math.PI)) / (hop2Nodes.length || 1) - Math.PI / 2 + 0.3;
      return {
        ...node,
        position: {
          x: Math.round(centerX + radius2 * Math.cos(angle)),
          y: Math.round(centerY + radius2 * Math.sin(angle)),
        },
      };
    }

    return node;
  });
}

/* ─── Inner Canvas Component ─── */
function FlowCanvasInner({ selectedAddress, onSelectAddress }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"tree" | "orbit">("tree");
  const [activeTarget, setActiveTarget] = useState<string>(
    selectedAddress || "0xeb9863e28d0fc0702a5197e66674f86ee2c35b5e"
  );
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleNodeSelect = useCallback(
    (addr: string) => {
      setActiveTarget(addr);
      if (onSelectAddress) {
        onSelectAddress(addr);
      }
    },
    [onSelectAddress]
  );

  const fetchGraph = useCallback(
    (targetAddr: string, mode: "tree" | "orbit" = layoutMode) => {
      setLoading(true);
      const cleanAddr = targetAddr.toLowerCase();

      fetch(`/api/graph/${cleanAddr}?hops=2`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
            const transformedNodes: Node[] = data.nodes.map((n: any, idx: number) => {
              const isTarget = n.id.toLowerCase() === cleanAddr;
              const label = n.data?.label || n.label || `${n.id.slice(0, 6)}...${n.id.slice(-4)}`;
              const labelLower = label.toLowerCase();

              let category: FlowNodeData["category"] = "wallet";
              let risk = 20;

              if (isTarget) {
                category = "target";
                risk = 68;
              } else if (labelLower.includes("mixer") || labelLower.includes("tornado") || labelLower.includes("railgun")) {
                category = "mixer";
                risk = 95;
              } else if (labelLower.includes("uniswap") || labelLower.includes("curve") || labelLower.includes("dex") || labelLower.includes("swap")) {
                category = "dex";
                risk = 15;
              } else if (labelLower.includes("binance") || labelLower.includes("coinbase") || labelLower.includes("kraken") || labelLower.includes("cex")) {
                category = "cex";
                risk = 25;
              } else if (labelLower.includes("storage") || labelLower.includes("cold") || labelLower.includes("vault")) {
                category = "storage";
                risk = 5;
              }

              // Spacious grid layout calculation for backend data
              let pos = n.position;
              if (!pos || (pos.x === 0 && pos.y === 0)) {
                if (isTarget) {
                  pos = { x: 580, y: 40 };
                } else {
                  const col = idx % 3;
                  const row = Math.floor(idx / 3) + 1;
                  pos = { x: 140 + col * 440, y: 40 + row * 250 };
                }
              }

              return {
                id: n.id,
                type: "flowNode",
                position: pos,
                draggable: true,
                data: {
                  label,
                  address: n.id,
                  category,
                  riskScore: risk,
                  isTarget,
                  onSelect: handleNodeSelect,
                },
              };
            });

            const transformedEdges: Edge[] = (data.edges || []).map((e: any) => {
              const val = parseFloat(e.label || "0");
              const isHigh = val > 10;
              const stroke = isHigh ? "#ff2d87" : "#00d2ff";

              return {
                id: e.id || `${e.source}-${e.target}`,
                source: e.source,
                target: e.target,
                label: e.label || "Flow",
                type: "smoothstep",
                animated: true,
                style: { stroke, strokeWidth: 2.2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 15, height: 15 },
                labelStyle: { fill: stroke, fontSize: 10, fontFamily: "monospace", fontWeight: 700 },
                labelBgStyle: { fill: "#131424", fillOpacity: 0.95, stroke, strokeWidth: 1, rx: 6, ry: 6 },
              };
            });

            const finalNodes = mode === "orbit" ? applyRadialOrbitLayout(transformedNodes) : transformedNodes;
            setNodes(finalNodes);
            setEdges(transformedEdges);
          } else {
            const fallback = generateSpaciousTreeTopology(cleanAddr);
            const wrappedNodes = fallback.nodes.map((n) => ({
              ...n,
              data: { ...n.data, onSelect: handleNodeSelect },
            }));
            const finalNodes = mode === "orbit" ? applyRadialOrbitLayout(wrappedNodes) : wrappedNodes;
            setNodes(finalNodes);
            setEdges(fallback.edges);
          }
        })
        .catch(() => {
          const fallback = generateSpaciousTreeTopology(cleanAddr);
          const wrappedNodes = fallback.nodes.map((n) => ({
            ...n,
            data: { ...n.data, onSelect: handleNodeSelect },
          }));
          const finalNodes = mode === "orbit" ? applyRadialOrbitLayout(wrappedNodes) : wrappedNodes;
          setNodes(finalNodes);
          setEdges(fallback.edges);
        })
        .finally(() => {
          setLoading(false);
          setTimeout(() => {
            fitView({ padding: 0.35, duration: 600 });
          }, 120);
        });
    },
    [fitView, handleNodeSelect, layoutMode, setNodes, setEdges]
  );

  useEffect(() => {
    if (selectedAddress) {
      setActiveTarget(selectedAddress);
      fetchGraph(selectedAddress, layoutMode);
    } else {
      fetchGraph(activeTarget, layoutMode);
    }
  }, [selectedAddress, fetchGraph, layoutMode]);

  const handleToggleLayout = () => {
    const nextMode = layoutMode === "tree" ? "orbit" : "tree";
    setLayoutMode(nextMode);
    if (nextMode === "orbit") {
      setNodes((prev) => applyRadialOrbitLayout(prev));
    } else {
      fetchGraph(activeTarget, "tree");
    }
    setTimeout(() => {
      fitView({ padding: 0.35, duration: 600 });
    }, 150);
  };

  const handleResetView = useCallback(() => {
    fitView({ padding: 0.35, duration: 500 });
  }, [fitView]);

  return (
    <div
      className={`w-full h-full bg-[#1b1c33] rounded-[2rem] relative overflow-hidden border border-white/5 flex flex-col transition-all duration-300 shadow-2xl ${
        isFullscreen ? "!fixed !inset-4 !z-50 !h-[calc(100vh-32px)] !w-[calc(100vw-32px)] shadow-2xl" : ""
      }`}
    >
      {/* Top Controls Header */}
      <div className="flex flex-wrap justify-between items-center px-6 py-3.5 border-b border-white/5 bg-[#171829] z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <GitFork size={15} />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-white block">
              Money Flow <span className="text-cyan-300">Topology</span>
            </span>
            <span className="text-[10px] text-white/40 font-mono flex items-center gap-1.5">
              <Move size={10} className="text-cyan-400/80" />
              Freely drag any node • Click to re-center
            </span>
          </div>
        </div>

        {/* Center Target badge */}
        {activeTarget && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="text-[10px] text-white/40 uppercase">Target Probe:</span>
            <strong className="text-white font-bold">{activeTarget}</strong>
          </div>
        )}

        {/* Interactive Controls */}
        <div className="flex items-center gap-2">
          {/* Layout Mode Toggle Button */}
          <button
            onClick={handleToggleLayout}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Toggle between Tree Flow & Radial Orbit layout"
          >
            {layoutMode === "tree" ? <Orbit size={13} /> : <Network size={13} />}
            <span>{layoutMode === "tree" ? "Radial Orbit" : "Tree Flow"}</span>
          </button>

          <button
            onClick={() => fetchGraph(activeTarget, layoutMode)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Re-Align & Refresh Layout"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-cyan-400" : ""} />
          </button>
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Reset & Fit View"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-[#131424] min-h-[520px]">
        {/* Soft Violet/Cyan ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="ambient-orb ambient-orb-violet w-[500px] h-[500px] top-1/4 left-1/4 opacity-25" />
          <div className="ambient-orb ambient-orb-cyan w-[450px] h-[450px] bottom-10 right-10 opacity-20" />
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#131424]/80 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_15px_#22d3ee]" />
              <span className="text-xs font-mono text-cyan-300 font-bold">
                Tracing fund topology for {activeTarget.slice(0, 10)}...
              </span>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          minZoom={0.15}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          fitView
          fitViewOptions={{ padding: 0.35 }}
        >
          <Background color="rgba(155, 81, 224, 0.2)" gap={32} size={1.5} />
          <Controls className="!bg-[#1b1c33]/90 !border !border-white/10 !rounded-2xl !overflow-hidden !shadow-2xl [&>button]:!bg-[#1b1c33] [&>button]:!border-b [&>button]:!border-white/10 [&>button]:!fill-cyan-300 [&>button:hover]:!bg-cyan-500/20" />
        </ReactFlow>

        {/* Bottom Right Legend */}
        <div className="absolute bottom-4 right-4 z-10 p-3 rounded-2xl bg-[#171829]/90 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col gap-1.5 pointer-events-none hidden md:flex">
          <span className="text-[10px] font-mono font-bold uppercase text-white/50 mb-0.5 tracking-wider">
            Topology Classification
          </span>
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d2ff]" />
            <span>Target Probe Node</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ff2d87]" />
            <span>Mixer / High Threat</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span>DEX / DeFi Protocol</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span>CEX / Hot Deposit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MoneyFlowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}