import React, { useEffect, useState, useCallback } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GitFork, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, RefreshCw, ExternalLink } from "lucide-react";

interface Props {
  selectedAddress: string | null;
  onSelectAddress?: (address: string) => void;
}

function FlowCanvasInner({ selectedAddress, onSelectAddress }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const fetchGraph = useCallback((targetAddr: string) => {
    setLoading(true);
    fetch(`/api/graph/${targetAddr}?hops=2`)
      .then((res) => res.json())
      .then((data) => {
        const targetLower = targetAddr.toLowerCase();

        const computedNodes: Node[] = (data.nodes || []).map((n: any) => {
          const isTarget = n.id.toLowerCase() === targetLower;
          const label = n.data?.label || `${n.id.slice(0, 8)}...${n.id.slice(-6)}`;
          const isMixerOrThreat = label.toLowerCase().includes("tornado") || label.toLowerCase().includes("mixer") || label.toLowerCase().includes("split");
          const isDex = label.toLowerCase().includes("uniswap") || label.toLowerCase().includes("pool") || label.toLowerCase().includes("swap");

          let bg = "linear-gradient(135deg, #1b1c33 0%, #171829 100%)";
          let border = "1px solid rgba(255, 255, 255, 0.12)";
          let color = "#ffffff";
          let shadow = "0 10px 25px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05)";

          if (isTarget) {
            bg = "linear-gradient(135deg, #1b1c33 0%, #131424 100%)";
            border = "2px solid #00d2ff";
            color = "#00d2ff";
            shadow = "0 0 25px rgba(0, 210, 255, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
          } else if (isMixerOrThreat) {
            bg = "linear-gradient(135deg, #231828 0%, #1b1c33 100%)";
            border = "2px solid #ff2d87";
            color = "#ff2d87";
            shadow = "0 0 25px rgba(255, 45, 135, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)";
          } else if (isDex) {
            bg = "linear-gradient(135deg, #152428 0%, #1b1c33 100%)";
            border = "2px solid #00e676";
            color = "#00e676";
            shadow = "0 0 20px rgba(0, 230, 118, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)";
          }

          return {
            id: n.id,
            position: n.position || { x: 350, y: 100 },
            draggable: true,
            data: { label },
            style: {
              background: bg,
              color: color,
              border: border,
              borderRadius: "20px",
              fontSize: isTarget ? "13px" : "12px",
              fontWeight: isTarget ? 700 : 600,
              fontFamily: "'JetBrains Mono', monospace",
              padding: "16px 24px",
              cursor: "pointer",
              boxShadow: shadow,
              letterSpacing: "0.02em",
              minWidth: "190px",
              textAlign: "center" as const,
            },
          };
        });

        const computedEdges: Edge[] = (data.edges || []).map((e: any) => {
          const isHighFlow = parseFloat(e.label || "0") > 10;
          const strokeColor = isHighFlow ? "#ff2d87" : "#00d2ff";

          return {
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            type: "smoothstep",
            animated: true,
            style: {
              stroke: strokeColor,
              strokeWidth: 2.5,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: strokeColor,
              width: 18,
              height: 18,
            },
            labelStyle: {
              fill: strokeColor,
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
            },
            labelBgStyle: {
              fill: "#131424",
              fillOpacity: 0.98,
              stroke: isHighFlow ? "rgba(255, 45, 135, 0.6)" : "rgba(0, 210, 255, 0.6)",
              strokeWidth: 1.5,
              rx: 10,
              ry: 10,
            },
            labelBgPadding: [8, 12] as [number, number],
          };
        });

        setNodes(computedNodes);
        setEdges(computedEdges);

        setTimeout(() => {
          fitView({ padding: 0.2, duration: 600 });
        }, 150);
      })
      .catch((err) => console.error("Graph fetch error:", err))
      .finally(() => setLoading(false));
  }, [fitView, setNodes, setEdges]);

  useEffect(() => {
    if (selectedAddress) {
      fetchGraph(selectedAddress);
    }
  }, [selectedAddress, fetchGraph]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id && node.id !== selectedAddress) {
        if (onSelectAddress) onSelectAddress(node.id);
        fetchGraph(node.id);
      }
    },
    [selectedAddress, onSelectAddress, fetchGraph]
  );

  const handleResetView = useCallback(() => {
    fitView({ padding: 0.2, duration: 400 });
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
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyber-cyan">
            <GitFork size={15} />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-white block">
              Money Flow <span className="text-cyber-cyan">Topology</span>
            </span>
            <span className="text-[10px] text-white/40 font-mono">
              Click any node to re-center & expand hops
            </span>
          </div>
        </div>

        {/* Center Target badge */}
        {selectedAddress && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyber-cyan text-xs font-mono">
            <span className="text-[10px] text-white/40 uppercase">Target Address:</span>
            <strong className="text-white font-bold">{selectedAddress}</strong>
          </div>
        )}

        {/* Interactive Controls */}
        <div className="flex items-center gap-2">
          {selectedAddress && (
            <button
              onClick={() => fetchGraph(selectedAddress)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Refresh Graph"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-cyan-400" : ""} />
            </button>
          )}
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
            className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyber-cyan transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Interactive Flow Canvas with RecehTok Atmosphere */}
      <div className="flex-1 w-full h-full relative bg-[#131424] min-h-[450px]">
        {/* Soft Violet/Cyan ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="ambient-orb ambient-orb-violet w-[500px] h-[500px] top-1/4 left-1/4 opacity-25" />
          <div className="ambient-orb ambient-orb-cyan w-[450px] h-[450px] bottom-10 right-10 opacity-20" />
        </div>

        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#131424]/80 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_15px_#22d3ee]" />
              <span className="text-xs font-mono text-cyan-300 font-bold">
                Tracing fund topology for {selectedAddress?.slice(0, 10)}...
              </span>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          fitView
          fitViewOptions={{ padding: 0.25 }}
        >
          <Background color="rgba(155, 81, 224, 0.2)" gap={28} size={1.5} />
          <Controls className="!bg-[#1b1c33]/90 !border !border-white/10 !rounded-2xl !overflow-hidden !shadow-2xl [&>button]:!bg-[#1b1c33] [&>button]:!border-b [&>button]:!border-white/10 [&>button]:!fill-cyan-300 [&>button:hover]:!bg-cyan-500/20" />
        </ReactFlow>
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