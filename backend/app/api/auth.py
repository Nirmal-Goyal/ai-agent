import os
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

router = APIRouter(tags=["auth"])

GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "").strip()
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "").strip()
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000").rstrip("/")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")


@router.get("/auth/login")
def auth_login():
    """Redirect to GitHub OAuth authorization page."""
    if not GITHUB_CLIENT_ID:
        return RedirectResponse(url=f"{FRONTEND_URL}#error=OAuth+not+configured")
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "scope": "repo",
        "redirect_uri": f"{BACKEND_URL}/auth/callback",
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return RedirectResponse(url=url)


@router.get("/auth/callback")
async def auth_callback(request: Request, code: str | None = None, error: str | None = None):
    """Exchange OAuth code for token and redirect to frontend with token in hash."""
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}#error={error}")
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}#error=no_code")
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        return RedirectResponse(url=f"{FRONTEND_URL}#error=oauth_not_configured")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{BACKEND_URL}/auth/callback",
            },
        )
    data = resp.json()
    token = data.get("access_token")
    if not token:
        err = data.get("error_description", data.get("error", "unknown"))
        return RedirectResponse(url=f"{FRONTEND_URL}#error={err}")

    return RedirectResponse(url=f"{FRONTEND_URL}#token={token}")
