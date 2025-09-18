from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from jose import jwt, JWTError
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from ..db import get_db
from ..models import WorkerCreate, WorkerOut
from ..config import JWT_SECRET

router = APIRouter(prefix="/workers", tags=["workers"])


def require_admin(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        admin_id = payload.get("sub")
        if not admin_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return admin_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/exists")
async def worker_exists(
    email: str = Query(..., description="Email to check"),
    workerType: str = Query(..., description="direct | contract | agent"),
    authorization: str | None = Header(default=None),
    db = Depends(get_db),
):
    """Lightweight existence check scoped to the signed-in admin and worker type."""
    admin_id = require_admin(authorization)
    norm = email.strip().lower()
    found = await db.workers.find_one({
        "adminId": ObjectId(admin_id),
        "email": norm,
        "workerType": workerType,
    })
    return {"exists": bool(found)}


@router.post("", status_code=201, response_model=WorkerOut)
async def create_worker(
    body: WorkerCreate,
    authorization: str | None = Header(default=None),
    db = Depends(get_db),
):
    """Create a worker; prevent duplicates by (adminId, email, workerType)."""
    admin_id = require_admin(authorization)

    doc = body.dict()
    # normalize email if provided
    if doc.get("email"):
        doc["email"] = doc["email"].strip().lower()

    doc["adminId"] = ObjectId(admin_id)
    doc["createdAt"] = datetime.utcnow()

    # Optional pre-check for clearer error (still rely on unique index)
    if doc.get("email"):
        exists = await db.workers.find_one({
            "adminId": ObjectId(admin_id),
            "email": doc["email"],
            "workerType": doc.get("workerType"),
        })
        if exists:
            raise HTTPException(status_code=409, detail="Worker with this email already exists for this type")

    try:
        res = await db.workers.insert_one(doc)
    except DuplicateKeyError:
        # Unique index caught a race
        raise HTTPException(status_code=409, detail="Worker with this email already exists for this type")

    return WorkerOut(id=str(res.inserted_id))
