"""
Database models and CRUD operations for users and face embeddings.
Uses MongoDB collections with pymongo.
"""

from datetime import datetime, timezone
from bson import ObjectId

from app.db.database import get_db


# ──────────────────────────── Users ────────────────────────────


def add_user(name: str) -> dict:
    """Add a new user. Returns the created user document."""
    db = get_db()
    now = datetime.now(timezone.utc)
    user_doc = {
        "name": name,
        "created_at": now,
        "updated_at": now,
    }
    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


def get_user_by_name(name: str) -> dict | None:
    """Find a user by name (case-insensitive)."""
    db = get_db()
    return db.users.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})


def get_user_by_id(user_id: str) -> dict | None:
    """Find a user by their ObjectId."""
    db = get_db()
    return db.users.find_one({"_id": ObjectId(user_id)})


def get_all_users() -> list[dict]:
    """Get all users with their embedding counts."""
    db = get_db()
    pipeline = [
        {
            "$lookup": {
                "from": "embeddings",
                "localField": "_id",
                "foreignField": "user_id",
                "as": "face_embeddings",
            }
        },
        {
            "$project": {
                "name": 1,
                "created_at": 1,
                "updated_at": 1,
                "embedding_count": {"$size": "$face_embeddings"},
            }
        },
        {"$sort": {"created_at": -1}},
    ]
    return list(db.users.aggregate(pipeline))


def delete_user(user_id: str) -> bool:
    """Delete a user and all associated embeddings."""
    db = get_db()
    oid = ObjectId(user_id)

    # Delete embeddings first
    db.embeddings.delete_many({"user_id": oid})

    # Delete user
    result = db.users.delete_one({"_id": oid})
    return result.deleted_count > 0


# ──────────────────────────── Embeddings ────────────────────────────


def add_embedding(user_id: str, embedding: list[float]) -> dict:
    """Store a face embedding for a user."""
    db = get_db()
    doc = {
        "user_id": ObjectId(user_id),
        "embedding": embedding,
        "created_at": datetime.now(timezone.utc),
    }
    result = db.embeddings.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def get_embeddings_for_user(user_id: str) -> list[dict]:
    """Get all embeddings for a specific user."""
    db = get_db()
    return list(db.embeddings.find({"user_id": ObjectId(user_id)}))


def get_all_embeddings() -> list[dict]:
    """Get all embeddings with their associated user info."""
    db = get_db()
    pipeline = [
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user",
            }
        },
        {"$unwind": "$user"},
        {
            "$project": {
                "embedding": 1,
                "user_id": 1,
                "user_name": "$user.name",
            }
        },
    ]
    return list(db.embeddings.aggregate(pipeline))


# ──────────────────────────── Admin Users ────────────────────────────


def get_admin_user(username: str) -> dict | None:
    """Find an admin user by username."""
    db = get_db()
    return db.admin_users.find_one({"username": username})


def create_admin_user(username: str, hashed_password: str) -> dict:
    """Create an admin user (for initial setup)."""
    db = get_db()
    doc = {
        "username": username,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc),
    }
    result = db.admin_users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc
