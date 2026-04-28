"""
Flask application factory — main entry point for the Face Recognizer API.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from app.core.config import Config
from app.api.routes import register_blueprints
from app.db.database import init_db, close_db
from app.ml.model import load_models
from app.api.auth_routes import seed_admin_user
from app.utils.logger import get_logger, setup_request_logging

logger = get_logger(__name__)


def create_app() -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS ─────────────────────────────────────────────
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    # ── Request logging ──────────────────────────────────
    setup_request_logging(app)

    # ── Register blueprints ──────────────────────────────
    register_blueprints(app)

    # ── Error handlers ───────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "message": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(413)
    def payload_too_large(e):
        return jsonify({"error": "Payload too large"}), 413

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    # ── Startup initialization ───────────────────────────
    with app.app_context():
        logger.info("=" * 50)
        logger.info("🚀 Face Recognizer API starting up...")
        logger.info("=" * 50)

        # Initialize MongoDB
        logger.info("Connecting to MongoDB...")
        init_db()

        # Seed default admin user
        seed_admin_user()

        # Pre-load ML models
        logger.info("Loading ML models (this may take a moment)...")
        load_models()

        logger.info("=" * 50)
        logger.info("✅ Face Recognizer API is ready!")
        logger.info("=" * 50)

    # ── Shutdown cleanup ─────────────────────────────────
    @app.teardown_appcontext
    def shutdown(exception=None):
        pass  # MongoDB client handles connection pooling

    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
