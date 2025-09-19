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
    """
    Asynchronous function to authenticate a user and generate access and refresh tokens.
    This function validates the user's email and password, creates a refresh token stored in the database,
    sets a refresh cookie in the response, and returns an access token.
    Args:
        payload (LoginIn): The login payload containing email and password.
        resp (Response): The HTTP response object to set the refresh cookie.
        db (AsyncSession, optional): The asynchronous database session. Defaults to Depends(get_async_db).
    Returns:
        dict: A dictionary containing the access token, e.g., {"access_token": "jwt_token"}.
    Raises:
        HTTPException: If the credentials are invalid, with status code 401 and detail "Invalid credentials".
    """

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
    """
    Refresh authentication tokens by validating the provided refresh token from cookies.
    This function decodes the refresh token, verifies its validity, checks if it has been revoked,
    and ensures the associated user is active. If all checks pass, it proceeds with token refresh logic
    (not shown in the provided code snippet).
    Parameters:
        request (Request): The incoming HTTP request object.
        resp (Response): The HTTP response object to be modified.
        db (AsyncSession): Asynchronous database session, injected via dependency.
        refresh_token (str | None): The refresh token extracted from cookies, aliased as REFRESH_COOKIE.
    Raises:
        HTTPException: 
            - 401 if refresh_token is missing ("Missing refresh cookie").
            - 401 if token decoding fails ("Invalid refresh").
            - 401 if the refresh token is revoked or not found ("Refresh revoked or not found").
            - 401 if the user is inactive or not found ("User inactive").
    Note:
        This function is asynchronous and relies on JWT decoding and database queries for validation.
    """
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

    # Generate new access token
    access = make_access_token(user.id, user.role, user.token_version)
    return {"access_token": access}
