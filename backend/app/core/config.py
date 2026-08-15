import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    ETH_WSS_URL: str = os.getenv("ETHEREUM_WSS_URL", "wss://ethereum-rpc.publicnode.com")
    ETH_HTTP_RPC: str = os.getenv("ETHEREUM_HTTP_RPC", "https://eth.llamarpc.com")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/eth_sentinel")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()