from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Header
from jose import jwt, JWTError
from pymongo.errors import DuplicateKeyError

from ..db import get_db
from ..models import (
    AdminCreate,
    LoginRequest,
    TokenResponse,
    UserOut,
    ResetRequest,
)
from ..security import hash_password, verify_password, create_access_token
from ..config import JWT_SECRET

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/admin/register", status_code=201)
async def register_admin(input: AdminCreate, db=Depends(get_db)):
    # normalize input
    name = input.name.strip()
    email = input.email.lower().strip()

    doc = {
        "name": name,
        "email": email,
        "passwordHash": hash_password(input.password),
        "createdAt": datetime.utcnow(),
        "role": "admin",
    }
    try:
        res = await db.admins.insert_one(doc)
    except DuplicateKeyError:
        # unique index on admins.email triggers this
        raise HTTPException(status_code=409, detail="Admin already exists")

    return {"id": str(res.inserted_id), "email": email, "name": name}


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db=Depends(get_db)):
    email = body.email.lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(body.password, admin["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(admin["_id"]), admin["email"])
    user = UserOut(id=str(admin["_id"]), email=admin["email"], name=admin["name"])
    return TokenResponse(token=token, user=user)


@router.post("/request-reset")
async def request_reset(_: ResetRequest):
    # Stub for now; FE just needs 200 OK.
    # Later: issue reset token, store, email link.
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(authorization: str | None = Header(default=None), db=Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        admin_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")

    admin = await db.admins.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return UserOut(id=str(admin["_id"]), email=admin["email"], name=admin["name"])
