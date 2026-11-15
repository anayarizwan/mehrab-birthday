"""
Configuration for Mehrab's Little Universe.

All sensitive values are read from environment variables so that no
real credentials ever live in the source code. Copy `.env.example` to
`.env` and fill in your own values before running the app.
"""

import os
import secrets
from pathlib import Path

# Base directory of the project (the folder that contains app.py)
BASE_DIR = Path(__file__).resolve().parent


def _env_bool(name: str, default: bool) -> bool:
    """Read a boolean from the environment."""
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    """Flask configuration. Override anything with environment variables."""

    # ------------------------------------------------------------------ #
    # Security
    # ------------------------------------------------------------------ #
    # Flask session signing key. MUST be set to a long random string in
    # production (see .env.example). Never commit a real key to git.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me-before-deploy")

    # Werkzeug hash strength. 'pbkdf2:sha256' is fine for a personal site.
    PASSWORD_HASH_METHOD = "pbkdf2:sha256"
    PASSWORD_HASH_SALT_LEN = 16

    # Session cookie hardening
    SESSION_COOKIE_HTTPONLY = True          # JS cannot read the cookie
    SESSION_COOKIE_SAMESITE = "Lax"         # Mild CSRF mitigation
    PERMANENT_SESSION_LIFETIME = int(os.environ.get("SESSION_LIFETIME_HOURS", "12")) * 3600
    REMEMBER_COOKIE_DURATION = int(os.environ.get("SESSION_LIFETIME_HOURS", "12")) * 3600

    # When deployed behind HTTPS, set SESSION_COOKIE_SECURE=true
    SESSION_COOKIE_SECURE = _env_bool("SESSION_COOKIE_SECURE", False)

    # Flask debug mode. NEVER enable debug in production.
    DEBUG = _env_bool("FLASK_DEBUG", False)

    # ------------------------------------------------------------------ #
    # Authentication
    # ------------------------------------------------------------------ #
    # Default password for development only. Change it before deploying
    # by setting BIRTHDAY_PASSWORD in your environment / .env file.
    DEFAULT_PASSWORD = os.environ.get("BIRTHDAY_PASSWORD") or secrets.token_urlsafe(32)

    # ------------------------------------------------------------------ #
    # File paths
    # ------------------------------------------------------------------ #
    # Personal photos live OUTSIDE the public static directory so they
    # can never be downloaded without authentication.
    PRIVATE_UPLOADS_DIR = BASE_DIR / "private_uploads"
    PLACEHOLDER_IMAGES_DIR = BASE_DIR / "static" / "images" / "placeholders"

    # Allowed image extensions for the protected image endpoint.
    ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}

    # ------------------------------------------------------------------ #
    # CSRF
    # ------------------------------------------------------------------ #
    # We implement a lightweight CSRF token ourselves in app.py (no
    # Flask-WTF dependency needed) so this setting is informational only.
    WTF_CSRF_ENABLED = True


# A single allowed user for this personal site. In a real multi-user
# app you would replace this with a database lookup.
USERNAME = "mehrab"


# Security headers applied to every response (see `after_request` hook).
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    # A small CSP: allow inline styles/scripts (this site uses them) and
    # Google Fonts. Tighten further if you remove inline scripts.
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob:; "
        "media-src 'self'; "
        "connect-src 'self'"
    ),
}
