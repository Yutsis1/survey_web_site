"""
Router to manage user authentication: registration, login, token refresh.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, Request, Cookie
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.sql.sql_driver import get_async_db
from backend.models.api.auth import AccessOut, LoginIn, RegisterIn
from backend.models.db.sql.auth import RefreshToken, User
from backend.config import settings
import uuid

from backend.routers.auth.security_utl import *


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

REFRESH_COOKIE = settings.COOKIE_NAME


def set_refresh_cookie(resp: Response, token: str):
    resp.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=True,      # False only for local http
        samesite="lax",
        path="/refresh",
        max_age=settings.REFRESH_EXPIRE_DAYS * 86400,
    )


def clear_refresh_cookie(resp: Response):
    resp.delete_cookie(REFRESH_COOKIE, path="/refresh")


@router.post("/register", response_model=AccessOut)
async def register(payload: RegisterIn, resp: Response, db: AsyncSession = Depends(get_async_db)):
    """
    Register a new user with the provided email and password.
    This function handles user registration by validating the email, hashing the password,
    creating a new user in the database, generating refresh and access tokens, and setting
    the refresh token as a cookie in the response.
    Args:
        payload (RegisterIn): The input payload containing the user's email and password.
        resp (Response): The HTTP response object to set the refresh token cookie.
        db (Session): The database session dependency for querying and committing data.
    Returns:
        dict: A dictionary containing the access token with key "access_token".
    Raises:
        HTTPException: If the email is already registered, raises a 400 status code with
                       detail "Email already registered".
    """
    email = payload.email.lower().strip()
    stmt = select(User).where(func.lower(User.email) == email)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    refresh_jwt, jti = make_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_id=jti))
    await db.commit()
    set_refresh_cookie(resp, refresh_jwt)

    access = make_access_token(user.id, user.role, user.token_version)
    return {"access_token": access}


@router.post("/login", response_model=AccessOut)
async def login(payload: LoginIn, resp: Response, db: AsyncSession = Depends(get_async_db)):
    email = payload.email.lower().strip()
    user = await db.execute(select(User).where(func.lower(User.email) == email))
    user = user.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    refresh_jwt, jti = make_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_id=jti))
    await db.commit()
    set_refresh_cookie(resp, refresh_jwt)

    access = make_access_token(user.id, user.role, user.token_version)
    return {"access_token": access}


@router.post("/refresh", response_model=AccessOut)
async def refresh(request: Request, resp: Response, db: AsyncSession = Depends(get_async_db), refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh cookie")
    try:
        data = decode(refresh_token)
        jti = uuid.UUID(data["jti"])
        user_id = uuid.UUID(data["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh")

    rt = await db.execute(select(RefreshToken).where(RefreshToken.token_id == jti, RefreshToken.revoked == False))
    rt = rt.scalar_one_or_none()
    if not rt:
        raise HTTPException(
            status_code=401, detail="Refresh revoked or not found")

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")
