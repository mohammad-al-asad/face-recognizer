"""
Security module — JWT access token generation, verification, and auth decorators.
"""

import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request, jsonify, g

from app.core.config import Config


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id: str, username: str) -> dict:
    """Generate a signed JWT access token."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "username": username,
        "iat": now,
        "exp": now + timedelta(seconds=Config.JWT_EXPIRY_SECONDS),
    }
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": Config.JWT_EXPIRY_SECONDS,
    }


def verify_token(token: str) -> dict | None:
    """Verify and decode a JWT token. Returns payload or None if invalid."""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator to require a valid Bearer access token on a route."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split("Bearer ")[1]
        payload = verify_token(token)

        if payload is None:
            return jsonify({"error": "Invalid or expired access token"}), 401

        # Attach user info to request context
        g.current_user = {
            "id": payload.get("sub"),
            "username": payload.get("username"),
        }
        return f(*args, **kwargs)

    return decorated


def validate_image_size(base64_string: str) -> bool:
    """Validate that a base64 image string doesn't exceed the size limit."""
    # Base64 encoding inflates size by ~33%, so actual bytes ≈ len * 3/4
    estimated_bytes = len(base64_string) * 3 / 4
    max_bytes = Config.MAX_IMAGE_SIZE_MB * 1024 * 1024
    return estimated_bytes <= max_bytes
