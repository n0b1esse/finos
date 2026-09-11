"""HTTP Basic Auth enforced by the API itself.

Docker deployments get their password gate from nginx
(frontend/docker-entrypoint.d/20-basic-auth.sh), but a backend running
anywhere else — Render/Railway/Fly behind a Vercel-hosted frontend — has
nothing in front of it, so the app enforces the same credentials itself
when FINOS_BASIC_AUTH_USER and FINOS_BASIC_AUTH_PASSWORD are both set.
Semantics mirror the nginx script exactly: both set means every /api/*
route needs them, with two deliberate holes — GET /api/health (Docker
HEALTHCHECK and uptime monitors must stay able to reach it) and CORS
preflights (OPTIONS never carries credentials by spec, so answering 401
there would break every cross-origin call before it starts).
"""
import base64
import secrets

from fastapi import Request
from fastapi.responses import JSONResponse

REALM = "FinOS"


def basic_auth_middleware(username: str, password: str):
    # Expected header precomputed once: per-request work is a single
    # constant-time compare, and the password never sits in the
    # comparison branch itself.
    expected = "Basic " + base64.b64encode(f"{username}:{password}".encode("utf-8")).decode("ascii")

    async def enforce_basic_auth(request: Request, call_next):
        path = request.url.path
        if request.method == "OPTIONS" or path == "/api/health" or not path.startswith("/api"):
            return await call_next(request)
        # compare_digest rejects non-ASCII str input with TypeError (headers
        # decode as latin-1, so anything goes) — anything that isn't plain
        # ASCII can't be the expected header anyway, so reject it as 401
        # instead of blowing up into a 500.
        given = request.headers.get("authorization", "")
        if given.isascii() and secrets.compare_digest(given, expected):
            return await call_next(request)
        return JSONResponse(
            status_code=401,
            content={"detail": "Authentication required"},
            headers={"WWW-Authenticate": f'Basic realm="{REALM}"'},
        )

    return enforce_basic_auth
