"""
Face matching module — cosine similarity comparison against stored embeddings.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import Config
from app.utils.logger import get_logger

logger = get_logger(__name__)


def find_match(
    query_embedding: np.ndarray,
    known_embeddings: list[dict],
) -> tuple[str | None, float]:
    """
    Find the best matching user for a given face embedding.

    Args:
        query_embedding: 512-d normalized face embedding
        known_embeddings: List of dicts with 'embedding', 'user_id', 'user_name'

    Returns:
        Tuple of (matched_name, confidence_score)
        Returns (None, 0.0) if no match above threshold
    """
    if not known_embeddings:
        logger.warning("No known embeddings in database for matching.")
        return None, 0.0

    query = query_embedding.reshape(1, -1)

    best_name = None
    best_score = 0.0
    best_user_id = None

    # Group embeddings by user for averaged comparison
    user_embeddings: dict[str, list] = {}
    user_names: dict[str, str] = {}

    for entry in known_embeddings:
        uid = str(entry["user_id"])
        user_names[uid] = entry["user_name"]
        if uid not in user_embeddings:
            user_embeddings[uid] = []
        user_embeddings[uid].append(np.array(entry["embedding"], dtype=np.float32))

    # Compare against each user's average embedding
    for uid, embeddings_list in user_embeddings.items():
        # Compute average embedding for this user
        avg_embedding = np.mean(embeddings_list, axis=0).reshape(1, -1)

        # Normalize
        norm = np.linalg.norm(avg_embedding)
        if norm > 0:
            avg_embedding = avg_embedding / norm

        # Cosine similarity
        similarity = cosine_similarity(query, avg_embedding)[0][0]

        logger.debug(f"Similarity with {user_names[uid]}: {similarity:.4f}")

        if similarity > best_score:
            best_score = similarity
            best_name = user_names[uid]
            best_user_id = uid

    # Check against threshold
    if best_score >= Config.SIMILARITY_THRESHOLD:
        logger.info(
            f"Match found: {best_name} (confidence: {best_score:.4f}, "
            f"threshold: {Config.SIMILARITY_THRESHOLD})"
        )
        return best_name, float(best_score)
    else:
        logger.info(
            f"No match above threshold. Best: {best_name} "
            f"({best_score:.4f} < {Config.SIMILARITY_THRESHOLD})"
        )
        return None, float(best_score)


def compute_similarity(embedding_a: np.ndarray, embedding_b: np.ndarray) -> float:
    """Compute cosine similarity between two embeddings."""
    a = embedding_a.reshape(1, -1)
    b = embedding_b.reshape(1, -1)
    return float(cosine_similarity(a, b)[0][0])
