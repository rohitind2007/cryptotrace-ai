import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import { GitFork, Move } from "lucide-react";

interface Props {
  selectedAddress: string | null;
}

export default function MoneyFlowCanvas({ selectedAddress }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedAddress) return;

    setLoading(true);
    fetch(`/api/graph/${selectedAddress}?hops=2`)
      .then((res) => res.json())
      .then((data) => {
        const targetLower = selectedAddress.toLowerCase();

        const computedNodes: Node[] = (data.nodes || []).map((n: any) => {
          const isTarget = n.id.toLowerCase() === targetLower;
          return {
            id: n.id,
            position: n.position || { x: 100, y: 100 },
            draggable: true,
            data: {
              label: n.data?.label || `${n.id.slice(0, 6)}...${n.id.slice(-4)}`,
            },
            style: {
              background: isTarget
                ? "linear-gradient(135deg, #0f172a 0%, #1e0a1a 100%)"
                : "rgba(2,6,23,0.9)",
              color: isTarget ? "#f43f5e" : "#22d3ee",
              border: isTarget ? "2px solid #f43f5e" : "1px solid rgba(255,255,255,0.18)",
              borderRadius: "14px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              padding: "10px 14px",
              cursor: "grab",
              boxShadow: isTarget
                ? "0 0 20px rgba(244,63,94,0.35), 0 0 60px rgba(244,63,94,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
              transition: "box-shadow 0.5s ease, transform 0.3s ease",
              animation: isTarget ? "glow-pulse-rose 2.5s ease-in-out infinite" : undefined,
            },
          };
        });

        const computedEdges: Edge[] = (data.edges || []).map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#22d3ee",
            strokeWidth: 1.5,
            filter: "drop-shadow(0 0 3px rgba(34,211,238,0.3))",
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#22d3ee" },
          labelStyle: {
            fill: "#22d3ee",
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: "#020617",
            fillOpacity: 0.95,
            stroke: "rgba(34, 211, 238, 0.35)",
            strokeWidth: 1,
            rx: 8,
            ry: 8,
          },
          labelBgPadding: [6, 8] as [number, number],
        }));

        setNodes(computedNodes);
        setEdges(computedEdges);
      })
      .catch((err) => console.error("Graph fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedAddress, setNodes, setEdges]);

  return (
    <div className="w-full h-full liquid-glass rounded-2xl relative overflow-hidden border border-white/5 flex flex-col">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center px-4 py-2.5 border-b border-white/5 bg-white/[0.02] z-10">
        <div className="flex items-center gap-2">
          <GitFork size={13} className="text-cyber-cyan" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest gradient-text">
            Money Flow Engine
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] font-mono text-white/30">
            <Move size={10} /> Drag nodes to inspect
          </span>
          {selectedAddress && (
            <span className="text-[10px] font-mono text-white/50 truncate max-w-xs">
              Target: <strong className="text-white/80">{selectedAddress.slice(0, 6)}...{selectedAddress.slice(-4)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-black/40">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <span className="text-xs font-mono gradient-text animate-breathe">
              Tracing topology structure...
            </span>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          fitView
          fitViewOptions={{ padding: 0.25 }}
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls className="!bg-slate-900/90 !border !border-white/10 !rounded-xl !overflow-hidden !shadow-lg [&>button]:!bg-slate-900 [&>button]:!border-b [&>button]:!border-white/5 [&>button]:!fill-white [&>button:hover]:!bg-slate-800" />
        </ReactFlow>
      </div>
    </div>
  );
}