import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import { GitFork } from "lucide-react";

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
    // Use relative endpoint so Vercel routes to the serverless function
    fetch(`/api/graph/${selectedAddress}?hops=2`)
      .then((res) => res.json())
      .then((data) => {
        const targetLower = selectedAddress.toLowerCase();

        const computedNodes: Node[] = (data.nodes || []).map(
          (n: any, idx: number) => ({
            id: n.id,
            position: { x: idx * 240 + 40, y: 100 + (idx % 2) * 90 },
            data: {
              label: n.data?.label || `${n.id.slice(0, 6)}...${n.id.slice(-4)}`,
            },
            style: {
              background:
                n.id.toLowerCase() === targetLower ? "#0f172a" : "#020617",
              color: "#22d3ee",
              border:
                n.id.toLowerCase() === targetLower
                  ? "2px solid #f43f5e"
                  : "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              fontSize: "11px",
              fontFamily: "monospace",
              padding: "10px 14px",
            },
          }),
        );

        const computedEdges: Edge[] = (data.edges || []).map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: true,
          style: { stroke: "#22d3ee", strokeWidth: 2 },
          labelStyle: {
            fill: "#22d3ee",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: "#020617",
            fillOpacity: 0.95,
            stroke: "rgba(34, 211, 238, 0.4)",
            strokeWidth: 1,
            rx: 6,
            ry: 6,
          },
          labelBgPadding: [6, 10],
        }));

        setNodes(computedNodes);
        setEdges(computedEdges);
      })
      .catch((err) => console.error("Graph error:", err))
      .finally(() => setLoading(false));
  }, [selectedAddress, setNodes, setEdges]);

  return (
    <div className="w-full h-full liquid-glass rounded-[2rem] relative overflow-hidden border border-white/5 flex flex-col p-4">
      <div className="flex justify-between items-center mb-2 z-10">
        <div className="flex items-center gap-2">
          <GitFork size={14} className="text-cyber-cyan" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">
            Money Flow Engine
          </span>
        </div>
        {selectedAddress && (
          <span className="text-[10px] font-mono text-white/50 truncate max-w-xs">
            Target: {selectedAddress}
          </span>
        )}
      </div>

      <div className="flex-1 w-full h-full rounded-2xl bg-black/40 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-xs font-mono text-cyber-cyan">
            Tracing on-chain hops...
          </div>
        )}
        {!selectedAddress ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono text-xs">
            Click any transaction to trace wallet money flow.
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background color="#334155" gap={16} />
            <Controls className="!bg-slate-900/90 !border !border-white/10 !rounded-xl !overflow-hidden !shadow-lg [&>button]:!bg-slate-900 [&>button]:!border-b [&>button]:!border-white/5 [&>button]:!fill-white [&>button:hover]:!bg-slate-800" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}