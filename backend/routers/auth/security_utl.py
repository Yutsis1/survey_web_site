from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.hash import bcrypt
import uuid

def hash_password(pw: str) -> str: return bcrypt.hash(pw)
def verify_password(pw: str, pw_hash: str) -> bool: return bcrypt.verify(pw, pw_hash)

def make_access_token(user_id: uuid.UUID, role: str, token_version: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "tv": token_version,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.ACCESS_EXPIRE_MIN)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def make_refresh_token(user_id: uuid.UUID) -> tuple[str, uuid.UUID]:
    now = datetime.now(timezone.utc)
    jti = uuid.uuid4()
    payload = {
        "sub": str(user_id),
        "jti": str(jti),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.REFRESH_EXPIRE_DAYS)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG), jti

def decode(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
