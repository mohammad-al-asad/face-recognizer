"""
Image utility functions — base64 decoding, resizing, and validation.
"""

import base64
import io

import cv2
import numpy as np
from PIL import Image

from app.core.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)


def decode_base64_image(base64_string: str) -> np.ndarray | None:
    """
    Decode a base64-encoded image string into a BGR numpy array.

    Supports both raw base64 and data URI format (data:image/...;base64,...).

    Returns:
        BGR numpy array (OpenCV format), or None on failure
    """
    try:
        # Strip data URI prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        # Decode base64
        image_bytes = base64.b64decode(base64_string)

        # Convert to PIL Image first (handles more formats)
        pil_image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if needed
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")

        # Convert to numpy array (RGB)
        image_array = np.array(pil_image)

        # Convert RGB to BGR for OpenCV
        image_bgr = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

        logger.debug(f"Decoded image: {image_bgr.shape}")
        return image_bgr

    except Exception as e:
        logger.error(f"Failed to decode base64 image: {e}")
        return None


def resize_image(image: np.ndarray, max_dim: int | None = None) -> np.ndarray:
    """
    Resize an image so its largest dimension doesn't exceed max_dim.
    Maintains aspect ratio.
    """
    if max_dim is None:
        max_dim = Config.MAX_IMAGE_DIMENSION

    height, width = image.shape[:2]
    if max(height, width) <= max_dim:
        return image

    if width > height:
        new_width = max_dim
        new_height = int(height * (max_dim / width))
    else:
        new_height = max_dim
        new_width = int(width * (max_dim / height))

    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    logger.debug(f"Resized image from {width}x{height} to {new_width}x{new_height}")
    return resized


def validate_base64_size(base64_string: str) -> bool:
    """Check if the base64 string is within the allowed size limit."""
    # Base64 inflates size by ~33%
    estimated_bytes = len(base64_string) * 3 / 4
    max_bytes = Config.MAX_IMAGE_SIZE_MB * 1024 * 1024

    if estimated_bytes > max_bytes:
        logger.warning(
            f"Image too large: ~{estimated_bytes / (1024*1024):.1f}MB "
            f"(max: {Config.MAX_IMAGE_SIZE_MB}MB)"
        )
        return False
    return True


def preprocess_image(base64_string: str) -> np.ndarray | None:
    """
    Full preprocessing pipeline: validate → decode → resize.

    Returns:
        Preprocessed BGR numpy array, or None on failure
    """
    if not validate_base64_size(base64_string):
        return None

    image = decode_base64_image(base64_string)
    if image is None:
        return None

    image = resize_image(image)
    return image
