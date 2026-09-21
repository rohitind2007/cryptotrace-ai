import sys
from pathlib import Path

# Add backend directory to Python path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

# Import your FastAPI app from backend/app/main.py
from app.main import app