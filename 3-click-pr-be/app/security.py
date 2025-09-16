from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from .config import JWT_SECRET

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGO = "HS256"
ACCESS_EXPIRE_DAYS = 7

def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_context.verify(pw, hashed)

def create_access_token(sub: str, email: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": sub,
        "email": email,
        "role": "admin",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=ACCESS_EXPIRE_DAYS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGO)
