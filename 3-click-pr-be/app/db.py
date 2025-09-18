from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGODB_URI, MONGODB_DB
from pymongo.errors import OperationFailure

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

    # Workers:
    #  - simple lookup by email
    await db.workers.create_index("email")

    #  - migrate: drop old unique index (adminId,email) if present
    try:
        await db.workers.drop_index("uniq_admin_email")
    except OperationFailure:
        pass  # index didn't exist; ignore

    #  - unique per (adminId, email, workerType); sparse allows docs with no email
    await db.workers.create_index(
        [("adminId", 1), ("email", 1), ("workerType", 1)],
        unique=True,
        sparse=True,
        name="uniq_admin_email_type",
    )


async def close_db():
    global client
    if client:
        client.close()
        client = None
