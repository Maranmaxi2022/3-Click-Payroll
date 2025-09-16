from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGODB_URI, MONGODB_DB

client: AsyncIOMotorClient | None = None


async def get_db():
    from .db import client  # local import to avoid circulars in type-checkers
    if client is None:
        raise RuntimeError("Mongo client not initialized")
    return client[MONGODB_DB]


async def init_db():
    """Initialize Mongo client and ensure required indexes exist."""
    global client
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]

    # --- indexes ---
    # Admins: unique email
    await db.admins.create_index("email", unique=True)

    # Workers: useful lookups (non-unique email; also index by adminId)
    await db.workers.create_index("email")
    await db.workers.create_index("adminId")


async def close_db():
    global client
    if client:
        client.close()
        client = None
