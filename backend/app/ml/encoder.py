"""
Face encoding module — extracts face embeddings using DeepFace (ArcFace backend).
"""

import numpy as np
from deepface import DeepFace

from app.core.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)


def encode_face(image_array: np.ndarray) -> np.ndarray | None:
    """
    Extract a 512-dimensional face embedding from an image.

    Args:
        image_array: BGR numpy array (OpenCV format)

    Returns:
        Normalized 512-d embedding vector, or None if no face detected
    """
    try:
        embeddings = DeepFace.represent(
            img_path=image_array,
            model_name=Config.MODEL_NAME,
            detector_backend=Config.DETECTOR_BACKEND,
            enforce_detection=True,
            align=True,
        )

        if not embeddings or len(embeddings) == 0:
            logger.warning("No face detected in the image.")
            return None

        # Take the first (most prominent) face
        embedding = np.array(embeddings[0]["embedding"], dtype=np.float32)

        # Normalize the embedding vector (L2 normalization)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        logger.info(f"Face encoded successfully. Embedding shape: {embedding.shape}")
        return embedding

    except ValueError as e:
        logger.warning(f"Face detection failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Face encoding error: {e}")
        return None


def encode_multiple_faces(images: list[np.ndarray]) -> list[np.ndarray]:
    """
    Encode multiple face images and return their embeddings.

    Args:
        images: List of BGR numpy arrays

    Returns:
        List of normalized embedding vectors (only successful ones)
    """
    embeddings = []
    for i, img in enumerate(images):
        embedding = encode_face(img)
        if embedding is not None:
            embeddings.append(embedding)
            logger.info(f"Encoded face {i + 1}/{len(images)}")
        else:
            logger.warning(f"Failed to encode face {i + 1}/{len(images)}")
    return embeddings


def compute_average_embedding(embeddings: list[np.ndarray]) -> np.ndarray:
    """
    Compute the average embedding from multiple face embeddings.
    This provides a more robust representation of a person's face.
    """
    if not embeddings:
        raise ValueError("No embeddings provided for averaging.")

    avg = np.mean(embeddings, axis=0)
    # Re-normalize after averaging
    norm = np.linalg.norm(avg)
    if norm > 0:
        avg = avg / norm
    return avg
