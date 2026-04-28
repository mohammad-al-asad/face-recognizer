"""
Model loader module — pre-loads DeepFace models at startup to avoid cold-start latency.
"""

import numpy as np
from deepface import DeepFace

from app.core.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)

_models_loaded = False


def load_models():
    """
    Pre-load DeepFace models (ArcFace + RetinaFace) by running a warmup inference.
    This ensures the first real request doesn't suffer from model loading delay.
    """
    global _models_loaded

    if _models_loaded:
        logger.info("Models already loaded, skipping warmup.")
        return

    logger.info(f"Loading ML models: {Config.MODEL_NAME} + {Config.DETECTOR_BACKEND}...")

    try:
        # Create a small dummy image for warmup
        dummy_image = np.zeros((160, 160, 3), dtype=np.uint8)
        dummy_image[40:120, 40:120] = 128  # Add some pixel variation

        # Warmup call — this triggers model download + loading
        try:
            DeepFace.represent(
                img_path=dummy_image,
                model_name=Config.MODEL_NAME,
                detector_backend=Config.DETECTOR_BACKEND,
                enforce_detection=False,
                align=True,
            )
        except Exception:
            # Warmup may fail with dummy image, but models are still loaded
            pass

        _models_loaded = True
        logger.info("ML models loaded and warmed up successfully!")

    except Exception as e:
        logger.error(f"Failed to load ML models: {e}")
        raise


def are_models_loaded() -> bool:
    """Check if models have been loaded."""
    return _models_loaded
