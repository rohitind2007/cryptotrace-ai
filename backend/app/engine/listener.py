import asyncio
from web3 import Web3
from app.core.config import settings
from app.engine.detector import FullFledgedFraudEngine
from app.services.graph_service import graph_service

FALLBACK_RPCS = [
    settings.ETH_HTTP_RPC,
    "https://eth.merkle.io",
    "https://1rpc.io/eth",
    "https://ethereum.publicnode.com",
]

def get_working_w3():
    for rpc in FALLBACK_RPCS:
        try:
            provider = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 10}))
            if provider.is_connected():
                return provider, rpc
        except Exception:
            continue
    return Web3(Web3.HTTPProvider("https://eth.merkle.io")), "https://eth.merkle.io"

async def start_live_eth_stream(broadcast_callback):
    """Polls live Ethereum blocks using multi-RPC fallback."""
    w3, active_rpc = get_working_w3()
    last_processed_block = None

    print(f"Connected to Ethereum Node via {active_rpc}")

    while True:
        try:
            current_block = w3.eth.block_number

            if last_processed_block is None:
                last_processed_block = current_block - 1

            if current_block > last_processed_block:
                for b_num in range(last_processed_block + 1, current_block + 1):
                    block = w3.eth.get_block(b_num, full_transactions=True)
                    tx_list = block.transactions
                    print(f"Processing Block #{b_num} ({len(tx_list)} txs)")

                    # Process up to 15 transactions per block for live streaming
                    for tx in tx_list[:15]:
                        val_eth = float(Web3.from_wei(tx.get("value", 0), "ether"))
                        gas_gwei = float(Web3.from_wei(tx.get("gasPrice", 0), "gwei"))

                        tx_record = {
                            "tx_hash": tx["hash"].hex(),
                            "block_number": b_num,
                            "from": tx["from"].lower(),
                            "to": tx["to"].lower() if tx.get("to") else None,
                            "value_eth": val_eth,
                            "gas_price_gwei": gas_gwei,
                            "gas_limit": tx.get("gas", 21000),
                            "nonce": tx.get("nonce", 0)
                        }

                        # Update Graph Service
                        graph_service.add_transaction(
                            tx_record["from"],
                            tx_record["to"] or "",
                            val_eth,
                            tx_record["tx_hash"]
                        )

                        # Run Fraud & ML Anomaly Detection
                        analysis = await FullFledgedFraudEngine.analyze_transaction(tx_record)
                        payload = {**tx_record, **analysis}

                        # Broadcast to UI
                        await broadcast_callback(payload)

                    last_processed_block = b_num

            await asyncio.sleep(4)

        except Exception as err:
            print(f"RPC Error ({err}). Cycling to backup node...")
            w3, active_rpc = get_working_w3()
            print(f"Switched to {active_rpc}")
            await asyncio.sleep(4)