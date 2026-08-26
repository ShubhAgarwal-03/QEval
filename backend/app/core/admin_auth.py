"""
Minimal admin authentication for the question-management endpoints.

This is intentionally simple (a single shared secret compared against a
request header) rather than a full user/auth system, since question
management is an internal/back-office concern for the MVP. Swap this out
for real auth (JWT, SSO, etc.) if /admin ever needs multiple admin users
or audit trails per-editor.
"""

from fastapi import Header, HTTPException

from app.core.config import get_settings


def require_admin(x_admin_key: str = Header(default="")) -> None:
    settings = get_settings()

    if not settings.admin_api_key:
        raise HTTPException(
            status_code=503,
            detail="Admin access is not configured on this server (ADMIN_API_KEY unset).",
        )

    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing admin key.")