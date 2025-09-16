from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException
from jose import jwt, JWTError
from bson import ObjectId

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

@router.post("", status_code=201, response_model=WorkerOut)
async def create_worker(
    body: WorkerCreate,
    authorization: str | None = Header(default=None),
    db = Depends(get_db),
):
    admin_id = require_admin(authorization)

    doc = {**body.dict(), "adminId": ObjectId(admin_id), "createdAt": datetime.utcnow()}
    res = await db.workers.insert_one(doc)
    return WorkerOut(id=str(res.inserted_id))
