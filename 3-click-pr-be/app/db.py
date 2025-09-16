from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGODB_URI, MONGODB_DB

client: AsyncIOMotorClient | None = None

async def get_db():
    from .db import client
    if client is None:
        raise RuntimeError("Mongo client not initialized")
    return client[MONGODB_DB]

async def init_db():
    global client
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]
    # Ensure unique email for admins
    await db.admins.create_index("email", unique=True)

async def close_db():
    global client
    if client:
        client.close()
        client = None
