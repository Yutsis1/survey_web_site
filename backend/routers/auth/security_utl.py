from jose import jwt
from datetime import datetime, timedelta, timezone
from passlib.hash import bcrypt
import uuid
from backend.config import settings

def hash_password(pw: str) -> str: return bcrypt.hash(pw)
def verify_password(pw: str, pw_hash: str) -> bool: return bcrypt.verify(pw, pw_hash)

def make_access_token(user_id: uuid.UUID, role: str, token_version: int) -> str:
    """
    Generate a JWT access token for a user.

    This function creates a JSON Web Token (JWT) containing the user's ID, role, token version,
    issued at time, and expiration time. The token is signed using the configured secret and algorithm.

    Args:
        user_id (uuid.UUID): The unique identifier of the user.
        role (str): The role of the user (e.g., 'admin', 'user').
        token_version (int): The version of the token for invalidation purposes.

    Returns:
        str: The encoded JWT access token as a string.

    Raises:
        ValueError: If encoding fails due to invalid payload or settings.
    """
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
    """
    Generates a JWT refresh token for the given user ID.
    This function creates a JSON Web Token (JWT) with a payload containing the user ID,
    a unique token ID (JTI), issued at time (IAT), and expiration time (EXP). The token
    is encoded using the configured JWT secret and algorithm.
    Args:
        user_id (uuid.UUID): The unique identifier of the user for whom the token is being generated.
    Returns:
        tuple[str, uuid.UUID]: A tuple containing the encoded JWT string and the JTI (token ID) as a UUID.
    Raises:
        Any exceptions raised by jwt.encode or datetime operations are not handled here and should be managed by the caller.
    """

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

# OAuth2 dependency functions
async def get_current_user_id(token: str) -> uuid.UUID:
    """
    Extract and validate user ID from JWT access token.
    
    Args:
        token (str): The JWT access token
        
    Returns:
        uuid.UUID: The user ID from the token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    from fastapi import HTTPException
    
    try:
        payload = decode(token)
        user_id = uuid.UUID(payload.get("sub"))
        return user_id
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

async def verify_token_version(user_id: uuid.UUID, token_version: int, db) -> bool:
    """
    Verify that the token version matches the user's current token version.
    
    Args:
        user_id (uuid.UUID): The user ID
        token_version (int): The token version from the JWT
        db: Database session
        
    Returns:
        bool: True if token version is valid
    """
    from backend.models.db.sql.auth import User
    
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        return False
    
    return user.token_version == token_version
