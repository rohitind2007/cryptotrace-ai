import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as e:
    import traceback
    err_trace = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend initialization failed",
                "detail": str(e),
                "trace": err_trace
            }
        )