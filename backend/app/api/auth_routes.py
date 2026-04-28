"""
Authentication API routes.
Handles login, token refresh, and health checks.
"""

from flask import Blueprint, request, jsonify

from app.core.config import Config
from app.core.security import (
    generate_token,
    verify_password,
    verify_token,
    hash_password,
)
from app.db.models import get_admin_user, create_admin_user
from app.utils.logger import get_logger

logger = get_logger(__name__)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate with username and password, returns JWT access token.

    Request body:
        { "username": "admin", "password": "admin123" }

    Response:
        { "access_token": "eyJ...", "token_type": "bearer", "expires_in": 86400 }
    """
    data = request.get_json()

    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400

    username = data["username"]
    password = data["password"]

    # Find admin user in database
    admin = get_admin_user(username)

    if admin is None:
        logger.warning(f"Login attempt for unknown user: {username}")
        return jsonify({"error": "Invalid username or password"}), 401

    # Verify password
    if not verify_password(password, admin["password"]):
        logger.warning(f"Invalid password for user: {username}")
        return jsonify({"error": "Invalid username or password"}), 401

    # Generate access token
    token_data = generate_token(
        user_id=str(admin["_id"]),
        username=admin["username"],
    )

    logger.info(f"User logged in: {username}")
    return jsonify(token_data), 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    """
    Refresh an existing (valid) access token.

    Headers:
        Authorization: Bearer <current_token>

    Response:
        { "access_token": "eyJ...", "token_type": "bearer", "expires_in": 86400 }
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing Authorization header"}), 401

    token = auth_header.split("Bearer ")[1]
    payload = verify_token(token)

    if payload is None:
        return jsonify({"error": "Invalid or expired token"}), 401

    # Generate new token
    token_data = generate_token(
        user_id=payload.get("sub"),
        username=payload.get("username"),
    )

    logger.info(f"Token refreshed for user: {payload.get('username')}")
    return jsonify(token_data), 200


@auth_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint (no authentication required)."""
    return jsonify({
        "status": "healthy",
        "service": "Face Recognizer API",
        "version": "1.0.0",
    }), 200


def seed_admin_user():
    """Create the default admin user if it doesn't exist."""
    admin = get_admin_user(Config.ADMIN_USERNAME)
    if admin is None:
        hashed = hash_password(Config.ADMIN_PASSWORD)
        create_admin_user(Config.ADMIN_USERNAME, hashed)
        logger.info(f"Default admin user created: {Config.ADMIN_USERNAME}")
    else:
        logger.info(f"Admin user already exists: {Config.ADMIN_USERNAME}")
