"""
Blueprint registration aggregator.
Registers all API blueprints with the Flask app.
"""

from flask import Flask

from app.api.face_routes import face_bp
from app.api.auth_routes import auth_bp


def register_blueprints(app: Flask):
    """Register all API blueprints."""
    app.register_blueprint(face_bp)
    app.register_blueprint(auth_bp)
