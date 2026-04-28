"""
Face recognition API routes.
Handles face recognition, enrollment, and user management.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

from app.core.security import require_auth, validate_image_size
from app.ml.encoder import encode_face, encode_multiple_faces
from app.ml.matcher import find_match
from app.db.models import (
    add_user,
    get_user_by_name,
    get_all_users,
    get_all_embeddings,
    add_embedding,
    delete_user,
)
from app.utils.image_utils import preprocess_image
from app.utils.logger import get_logger

logger = get_logger(__name__)

face_bp = Blueprint("face", __name__, url_prefix="/api")


@face_bp.route("/recognize", methods=["POST"])
@require_auth
def recognize_face():
    """
    Recognize a face from a base64-encoded image.

    Request body:
        { "image": "base64_string" }

    Response:
        { "name": "Asad", "status": "authorized", "confidence": 0.89, "timestamp": "..." }
    """
    data = request.get_json()

    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field in request body"}), 400

    image_b64 = data["image"]

    # Validate image size
    if not validate_image_size(image_b64):
        return jsonify({"error": "Image exceeds maximum allowed size"}), 413

    # Preprocess image
    image = preprocess_image(image_b64)
    if image is None:
        return jsonify({"error": "Failed to decode or process image"}), 400

    # Extract face embedding
    embedding = encode_face(image)
    if embedding is None:
        return jsonify({
            "name": None,
            "status": "no_face",
            "confidence": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), 200

    # Get all known embeddings
    known_embeddings = get_all_embeddings()

    # Find the best match
    matched_name, confidence = find_match(embedding, known_embeddings)

    timestamp = datetime.now(timezone.utc).isoformat()

    if matched_name:
        logger.info(f"✓ Recognized: {matched_name} ({confidence:.2%})")
        return jsonify({
            "name": matched_name,
            "status": "authorized",
            "confidence": round(confidence, 4),
            "timestamp": timestamp,
        }), 200
    else:
        logger.info(f"✗ Unauthorized face (best confidence: {confidence:.2%})")
        return jsonify({
            "name": None,
            "status": "unauthorized",
            "confidence": round(confidence, 4),
            "timestamp": timestamp,
        }), 200


@face_bp.route("/add-face", methods=["POST"])
@require_auth
def add_face():
    """
    Enroll a new face into the system.

    Request body:
        { "name": "Asad", "images": ["base64_1", "base64_2", ...] }
        OR
        { "name": "Asad", "image": "base64_string" }  (single image shorthand)

    Response:
        { "message": "...", "user_id": "...", "embeddings_stored": 3 }
    """
    data = request.get_json()

    if not data or "name" not in data:
        return jsonify({"error": "Missing 'name' field in request body"}), 400

    name = data["name"].strip()
    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400

    # Support both single image and multiple images
    images_b64 = data.get("images", [])
    if not images_b64 and "image" in data:
        images_b64 = [data["image"]]

    if not images_b64:
        return jsonify({"error": "Missing 'images' or 'image' field"}), 400

    # Validate sizes
    for i, img_b64 in enumerate(images_b64):
        if not validate_image_size(img_b64):
            return jsonify({"error": f"Image {i+1} exceeds maximum size"}), 413

    # Preprocess all images
    processed_images = []
    for i, img_b64 in enumerate(images_b64):
        img = preprocess_image(img_b64)
        if img is not None:
            processed_images.append(img)
        else:
            logger.warning(f"Failed to process image {i+1}/{len(images_b64)}")

    if not processed_images:
        return jsonify({"error": "No valid images could be processed"}), 400

    # Extract embeddings
    embeddings = encode_multiple_faces(processed_images)

    if not embeddings:
        return jsonify({"error": "No faces detected in the provided images"}), 400

    # Get or create user
    existing_user = get_user_by_name(name)
    if existing_user:
        user_id = str(existing_user["_id"])
        logger.info(f"Adding embeddings to existing user: {name}")
    else:
        user = add_user(name)
        user_id = str(user["_id"])
        logger.info(f"Created new user: {name}")

    # Store embeddings
    stored_count = 0
    for emb in embeddings:
        add_embedding(user_id, emb.tolist())
        stored_count += 1

    logger.info(f"Stored {stored_count} embeddings for user: {name}")

    return jsonify({
        "message": f"Successfully enrolled {name}",
        "user_id": user_id,
        "embeddings_stored": stored_count,
        "total_images_processed": len(processed_images),
    }), 201


@face_bp.route("/users", methods=["GET"])
@require_auth
def list_users():
    """Get all enrolled users."""
    users = get_all_users()

    # Serialize ObjectIds
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "created_at": user["created_at"].isoformat(),
            "embedding_count": user.get("embedding_count", 0),
        })

    return jsonify({"users": result, "total": len(result)}), 200


@face_bp.route("/users/<user_id>", methods=["DELETE"])
@require_auth
def remove_user(user_id: str):
    """Delete a user and all their embeddings."""
    success = delete_user(user_id)

    if success:
        logger.info(f"Deleted user: {user_id}")
        return jsonify({"message": "User deleted successfully"}), 200
    else:
        return jsonify({"error": "User not found"}), 404
