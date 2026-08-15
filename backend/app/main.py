import asyncio
from contextlib import asynccontextmanager, suppress
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from app.engine.listener import start_live_eth_stream
from app.services.graph_service import graph_service

class WebSocketHub:
    def __init__(self):
        self.active_sockets: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_sockets.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_sockets:
            self.active_sockets.remove(ws)

    async def _send_safe(self, ws: WebSocket, data: dict):
        try:
            await ws.send_json(data)
        except Exception:
            self.disconnect(ws)

    async def broadcast(self, data: dict):
        if not self.active_sockets:
            return
        # Broadcast concurrently across all active frontend clients
        await asyncio.gather(
            *(self._send_safe(ws, data) for ws in list(self.active_sockets)),
            return_exceptions=True
        )

hub = WebSocketHub()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start live Ethereum ingestion in the background
    stream_task = asyncio.create_task(start_live_eth_stream(hub.broadcast))
    yield
    # Clean shutdown
    stream_task.cancel()
    with suppress(asyncio.CancelledError):
        await stream_task

app = FastAPI(
    title="Ethereum AML & Fraud Sentinel Core API",
    version="1.0.0",
    lifespan=lifespan
)

# Allow frontend access (React / Vite / Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await hub.connect(websocket)
    try:
        while True:
            # Keeps connection alive while receiving client pings
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        hub.disconnect(websocket)

@app.get("/api/graph/{address}")
def get_wallet_money_flow_graph(address: str, hops: int = Query(default=2, ge=1, le=4)):
    """Returns nodes and edges formatted directly for React Flow."""
    return graph_service.get_subgraph_for_address(address, max_hops=hops)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "chain": "Ethereum Mainnet",
        "ai_engine": "IsolationForest + Google Gemini",
        "active_ws_connections": len(hub.active_sockets)
    }