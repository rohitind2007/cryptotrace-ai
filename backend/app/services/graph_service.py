from typing import Dict, Any, List, Optional

try:
    import networkx as nx
except ImportError:
    nx = None


class InMemoryDiGraph:
    """Lightweight in-memory graph fallback if networkx is not installed."""
    def __init__(self):
        self.nodes = {}
        self.edges_dict = {}

    def add_node(self, node, **attr):
        if node not in self.nodes:
            self.nodes[node] = {}
        self.nodes[node].update(attr)

    def add_edge(self, u, v, **attr):
        self.add_node(u)
        self.add_node(v)
        self.edges_dict[(u, v)] = attr

    def edges(self, data=False):
        if data:
            return [(u, v, d) for (u, v), d in self.edges_dict.items()]
        return list(self.edges_dict.keys())

    def to_undirected(self):
        return self

    def __contains__(self, item):
        return item in self.nodes


# Known Ethereum addresses with metadata
KNOWN_ENTITIES = {
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": {
        "label": "Vitalik Buterin (vitalik.eth)",
        "category": "target",
        "riskScore": 8,
    },
    "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc": {
        "label": "Tornado.Cash: 0.1 ETH Pool",
        "category": "mixer",
        "riskScore": 98,
    },
    "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b": {
        "label": "Tornado.Cash: Router",
        "category": "mixer",
        "riskScore": 98,
    },
    "0x722122df12d45b4003a09612089a4666fdaf1bf7": {
        "label": "Tornado.Cash: 0.1 ETH",
        "category": "mixer",
        "riskScore": 98,
    },
    "0x8589427373d6d84e98730d7795d8f6f8731fda16": {
        "label": "Tornado.Cash: 0.1 ETH v2",
        "category": "mixer",
        "riskScore": 98,
    },
    "0x0836222f2b2b24a3f36f98668ed8f0b38d1a872f": {
        "label": "Lazarus Group Associated Pool",
        "category": "mixer",
        "riskScore": 99,
    },
    "0xe592427a0aece92de3edee1f18e0157c05861564": {
        "label": "Uniswap V3: SwapRouter",
        "category": "dex",
        "riskScore": 10,
    },
    "0x28c6c06298d514db089934071355e5743bf21d60": {
        "label": "Binance: Hot Wallet 14",
        "category": "cex",
        "riskScore": 22,
    },
    "0xeb9863e28d0fc0702a5197e66674f86ee2c35b5e": {
        "label": "Sanctioned Entity Outflow (OFAC)",
        "category": "target",
        "riskScore": 98,
    },
    "0x0000000000000000000000000000000000000000": {
        "label": "Contract Creation / Null Address",
        "category": "storage",
        "riskScore": 0,
    },
}


class MoneyFlowGraphService:
    def __init__(self):
        self.G = nx.DiGraph() if nx else InMemoryDiGraph()

    def _infer_entity(
        self,
        address: str,
        threat_category: Optional[str] = None,
        is_suspicious: bool = False,
        risk_score: int = 15,
    ) -> Dict[str, Any]:
        clean = address.lower()
        if clean in KNOWN_ENTITIES:
            return KNOWN_ENTITIES[clean]

        short_label = f"{clean[:6]}...{clean[-4:]}"
        cat = "wallet"

        threat_lower = (threat_category or "").lower()
        if "mixer" in threat_lower or "tornado" in threat_lower or "lazarus" in threat_lower:
            cat = "mixer"
            risk_score = max(risk_score, 90)
        elif "dex" in threat_lower or "swap" in threat_lower or "uniswap" in threat_lower:
            cat = "dex"
        elif "cex" in threat_lower or "exchange" in threat_lower or "binance" in threat_lower:
            cat = "cex"
        elif "sanctioned" in threat_lower or is_suspicious or risk_score >= 70:
            cat = "mixer"
            risk_score = max(risk_score, 75)

        return {
            "label": short_label,
            "category": cat,
            "riskScore": risk_score,
        }

    def add_transaction(
        self,
        from_addr: str,
        to_addr: str,
        value_eth: float,
        tx_hash: str,
        block_number: Optional[int] = None,
        risk_score: Optional[int] = None,
        severity: Optional[str] = None,
        threat_category: Optional[str] = None,
        is_suspicious: bool = False,
    ):
        if not from_addr:
            return
        if not to_addr:
            to_addr = "0x0000000000000000000000000000000000000000"

        from_addr = from_addr.lower()
        to_addr = to_addr.lower()
        score = int(risk_score or (75 if is_suspicious else 15))

        # Initialize or update 'from' node
        if from_addr not in self.G:
            meta = self._infer_entity(from_addr, threat_category, is_suspicious, score)
            self.G.add_node(
                from_addr,
                label=meta["label"],
                category=meta["category"],
                riskScore=meta["riskScore"],
                total_sent=float(value_eth),
                total_received=0.0,
                tx_count=1,
            )
        else:
            node = self.G.nodes[from_addr]
            node["total_sent"] = node.get("total_sent", 0.0) + float(value_eth)
            node["tx_count"] = node.get("tx_count", 0) + 1
            if score > node.get("riskScore", 0):
                node["riskScore"] = score

        # Initialize or update 'to' node
        if to_addr not in self.G:
            meta = self._infer_entity(to_addr, threat_category, is_suspicious, score)
            self.G.add_node(
                to_addr,
                label=meta["label"],
                category=meta["category"],
                riskScore=meta["riskScore"],
                total_sent=0.0,
                total_received=float(value_eth),
                tx_count=1,
            )
        else:
            node = self.G.nodes[to_addr]
            node["total_received"] = node.get("total_received", 0.0) + float(value_eth)
            node["tx_count"] = node.get("tx_count", 0) + 1
            if score > node.get("riskScore", 0):
                node["riskScore"] = score

        # Add or update directed edge
        self.G.add_edge(
            from_addr,
            to_addr,
            value=float(value_eth),
            tx_hash=tx_hash,
            block_number=block_number,
            risk_score=score,
            severity=severity or ("CRITICAL" if score >= 80 else ("HIGH" if score >= 60 else "LOW")),
            is_suspicious=is_suspicious,
        )

    def has_address(self, address: str) -> bool:
        return address.lower() in self.G

    def get_subgraph_for_address(self, root_address: str, max_hops: int = 2) -> Dict[str, Any]:
        root = root_address.lower()
        if root not in self.G:
            return {"nodes": [], "edges": []}

        if nx:
            subgraph = nx.ego_graph(self.G, root, radius=max_hops, undirected=True)
            subgraph_nodes = set(subgraph.nodes())
            distances = nx.single_source_shortest_path_length(
                subgraph.to_undirected(), root
            )
        else:
            # Fallback BFS
            distances = {root: 0}
            queue = [root]
            while queue:
                curr = queue.pop(0)
                d = distances[curr]
                if d >= max_hops:
                    continue
                neighbors = set()
                for (u, v) in self.G.edges():
                    if u == curr:
                        neighbors.add(v)
                    elif v == curr:
                        neighbors.add(u)
                for nbr in neighbors:
                    if nbr not in distances:
                        distances[nbr] = d + 1
                        queue.append(nbr)
            subgraph_nodes = set(distances.keys())

        if len(subgraph_nodes) <= 1:
            return {"nodes": [], "edges": []}

        # Group nodes by hop distance
        hop_levels: Dict[int, List[str]] = {}
        for node, dist in distances.items():
            hop_levels.setdefault(dist, []).append(node)

        # Coordinate positioning
        root_x = 580
        root_y = 40
        positions: Dict[str, Dict[str, int]] = {root: {"x": root_x, "y": root_y}}

        # Hop 1 (direct counterparties)
        hop1_nodes = hop_levels.get(1, [])
        hop1_spacing = 420
        start_hop1_x = int(root_x - ((len(hop1_nodes) - 1) * hop1_spacing) / 2)
        hop1_y = 270

        for idx, node in enumerate(hop1_nodes):
            positions[node] = {
                "x": start_hop1_x + (idx * hop1_spacing),
                "y": hop1_y,
            }

        # Hop 2 (2nd degree)
        hop2_nodes = hop_levels.get(2, [])
        hop2_spacing = 220
        start_hop2_x = int(root_x - ((len(hop2_nodes) - 1) * hop2_spacing) / 2)
        hop2_y = 520

        for idx, node in enumerate(hop2_nodes):
            positions[node] = {
                "x": start_hop2_x + (idx * hop2_spacing),
                "y": hop2_y,
            }

        # Additional hops if requested
        for hop in range(3, max_hops + 1):
            nodes_at_hop = hop_levels.get(hop, [])
            spacing = 200
            start_x = int(root_x - ((len(nodes_at_hop) - 1) * spacing) / 2)
            y = 520 + (hop - 2) * 220
            for idx, node in enumerate(nodes_at_hop):
                positions[node] = {
                    "x": start_x + (idx * spacing),
                    "y": y,
                }

        # Build React Flow nodes
        nodes = []
        for node in subgraph_nodes:
            n_data = self.G.nodes.get(node, {})
            is_target = node == root
            label = n_data.get("label", f"{node[:6]}...{node[-4:]}")
            category = "target" if is_target else n_data.get("category", "wallet")
            risk = n_data.get("riskScore", 15)
            pos = positions.get(node, {"x": root_x, "y": root_y})

            total_flow = n_data.get("total_sent", 0.0) + n_data.get("total_received", 0.0)
            eth_str = f"{total_flow:.2f} ETH" if total_flow > 0 else None

            nodes.append({
                "id": node,
                "type": "flowNode",
                "position": pos,
                "draggable": True,
                "data": {
                    "label": label,
                    "address": node,
                    "category": category,
                    "riskScore": risk,
                    "ethAmount": eth_str,
                    "isTarget": is_target,
                },
            })

        # Build React Flow edges from original directed graph
        edges = []
        for u, v, data in self.G.edges(data=True):
            if u in subgraph_nodes and v in subgraph_nodes:
                val = float(data.get("value", 0.0))
                tx_hash = data.get("tx_hash", "")
                edges.append({
                    "id": f"{u}-{v}-{tx_hash[:8]}",
                    "source": u,
                    "target": v,
                    "label": f"{val:.2f} ETH",
                    "type": "smoothstep",
                    "animated": True,
                    "data": {
                        "tx_hash": tx_hash,
                        "risk_score": data.get("risk_score", 15),
                        "is_suspicious": data.get("is_suspicious", False),
                    },
                })

        return {"nodes": nodes, "edges": edges}


graph_service = MoneyFlowGraphService()