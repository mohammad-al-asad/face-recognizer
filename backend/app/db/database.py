"""
MongoDB database connection module.
Provides a singleton MongoClient and database access.
"""

from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import Config

_client: MongoClient | None = None
_db: Database | None = None


def get_client() -> MongoClient:
    """Get the singleton MongoDB client."""
    global _client
    if _client is None:
        _client = MongoClient(Config.MONGO_URI)
    return _client


def get_db() -> Database:
    """Get the application database instance."""
    global _db
    if _db is None:
        client = get_client()
        _db = client[Config.DB_NAME]
    return _db


def init_db():
    """Initialize the database with required indexes."""
    db = get_db()

    # Users collection — unique name index
    db.users.create_index("name", unique=True)

    # Embeddings collection — index on user_id for fast lookups
    db.embeddings.create_index("user_id")

    # Admin users collection
    db.admin_users.create_index("username", unique=True)

    print("[DB] MongoDB initialized with indexes.")


def close_db():
    """Close the MongoDB client connection."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        print("[DB] MongoDB connection closed.")
