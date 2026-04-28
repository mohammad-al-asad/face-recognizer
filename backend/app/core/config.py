"""
Application configuration module.
Loads settings from environment variables with sensible defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "face-recognizer-secret-key-2026")
    DEBUG = os.getenv("FLASK_ENV", "production") == "development"

    # MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/face_recognizer")
    DB_NAME = os.getenv("DB_NAME", "face_recognizer")

    # JWT Auth
    JWT_SECRET = os.getenv("JWT_SECRET", SECRET_KEY)
    JWT_EXPIRY_SECONDS = int(os.getenv("JWT_EXPIRY_SECONDS", "86400"))  # 24 hours

    # Admin credentials (default)
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

    # ML Configuration
    SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.55"))
    DETECTOR_BACKEND = os.getenv("DETECTOR_BACKEND", "retinaface")
    MODEL_NAME = os.getenv("MODEL_NAME", "ArcFace")

    # Image Processing
    MAX_IMAGE_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
    MAX_IMAGE_DIMENSION = int(os.getenv("MAX_IMAGE_DIMENSION", "640"))

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

    # Enrollment
    MIN_ENROLLMENT_IMAGES = int(os.getenv("MIN_ENROLLMENT_IMAGES", "1"))
    MAX_ENROLLMENT_IMAGES = int(os.getenv("MAX_ENROLLMENT_IMAGES", "10"))
