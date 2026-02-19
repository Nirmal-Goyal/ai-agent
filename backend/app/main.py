from pathlib import Path

from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.run import router as run_router
from app.api.auth import router as auth_router

app = FastAPI(title="CI/CD Healing Agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(run_router, prefix="/api", tags=["run"])
app.include_router(auth_router)


@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "ok",
        "llm_required": False,
        "backend_version": "0.1.0",
    }


@app.get("/check")
@app.get("/api/check")
def check_config():
    """Verify backend config. No API key required (rule-based fixes only)."""
    return {
        "llm_required": False,
        "backend_version": "0.1.0",
    }
