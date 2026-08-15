import networkx as nx
from typing import Dict, Any, List


class MoneyFlowGraphService:
    def __init__(self):
        self.G = nx.DiGraph()

    def add_transaction(self, from_addr: str, to_addr: str, value_eth: float, tx_hash: str):
        if not to_addr:
            to_addr = "0x0000000000000000000000000000000000000000"

        self.G.add_node(from_addr, type="wallet")
        self.G.add_node(to_addr,
                        type="contract" if to_addr == "0x0000000000000000000000000000000000000000" else "wallet")

        self.G.add_edge(from_addr, to_addr, value=value_eth, tx_hash=tx_hash)

    def get_subgraph_for_address(self, root_address: str, max_hops: int = 2) -> Dict[str, Any]:
        root = root_address.lower()
        if root not in self.G:
            return {"nodes": [{"id": root, "label": root, "risk": "UNKNOWN"}], "edges": []}

        # Extract ego graph (k-hop neighbors)
        subgraph = nx.ego_graph(self.G, root, radius=max_hops, undirected=False)

        nodes = []
        for node in subgraph.nodes():
            nodes.append({
                "id": node,
                "data": {"label": f"{node[:6]}...{node[-4:]}", "fullAddress": node},
                "position": {"x": 0, "y": 0}  # Frontend layout engine (e.g. Dagre) computes layout
            })

        edges = []
        for u, v, data in subgraph.edges(data=True):
            edges.append({
                "id": f"{u}-{v}-{data.get('tx_hash', '')[:8]}",
                "source": u,
                "target": v,
                "label": f"{data.get('value', 0):.2f} ETH",
                "data": {"tx_hash": data.get("tx_hash")}
            })

        return {"nodes": nodes, "edges": edges}


graph_service = MoneyFlowGraphService()