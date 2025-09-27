"""
Router to manage user authentication: registration, login, token refresh.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import func, select, update
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

# OAuth2 scheme for token extraction
security = HTTPBearer(auto_error=False)

def set_refresh_cookie(resp: Response, token: str):
    cookie_path = "/"

    # if frontend and API are on different origins, you need SameSite=None + Secure
    cross_site = True  # set from settings/env if you prefer
    same_site = "none" if cross_site else "lax"

    resp.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=True,      # False only for local http
        samesite=same_site,
        path=cookie_path,
        max_age=settings.REFRESH_EXPIRE_DAYS * 86400,
    )


def clear_refresh_cookie(resp: Response):
    resp.delete_cookie(REFRESH_COOKIE, path="/refresh")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """
    OAuth2 dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Authorization credentials containing the JWT token
        db: Database session
        
    Returns:
        User: The authenticated user object
        
    Raises:
        HTTPException: If token is missing, invalid, or user is inactive
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = decode(credentials.credentials)
        user_id = uuid.UUID(payload.get("sub"))
        token_version = payload.get("tv")
        
        if not user_id or token_version is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token version to support token invalidation
    if user.token_version != token_version:
        raise HTTPException(
            status_code=401,
            detail="Token has been invalidated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


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


@router.post("/logout")
async def logout(
    resp: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    # needed only if we want to revoke just current token
    # refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)
):
    """
    Logout the current user by revoking their refresh tokens and clearing cookies.
    
    This function performs a complete logout by:
    1. Revoking all refresh tokens for the user (optional: can revoke just the current one)
    2. Incrementing the user's token version to invalidate all access tokens
    3. Clearing the refresh token cookie
    
    Args:
        resp (Response): The HTTP response object to clear cookies
        current_user (User): The authenticated user from the access token
        db (AsyncSession): Database session
        refresh_token (str | None): The refresh token from cookies (optional)
        
    Returns:
        dict: Success message
    """
    
    # Option 1: Revoke all refresh tokens for the user (more secure)
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == current_user.id)
        .values(revoked=True)
    )
    
    # Option 2: Only revoke the current refresh token (less secure)
    # if refresh_token:
    #     try:
    #         data = decode(refresh_token)
    #         jti = uuid.UUID(data["jti"])
    #         await db.execute(
    #             update(RefreshToken)
    #             .where(RefreshToken.token_id == jti)
    #             .values(revoked=True)
    #         )
    #     except Exception:
    #         pass  # Token might be invalid, but we still want to logout
    
    # Increment token version to invalidate all access tokens
    await db.execute(
        update(User)
        .where(User.id == current_user.id)
        .values(token_version=User.token_version + 1)
    )
    
    await db.commit()
    
    # Clear refresh cookie
    clear_refresh_cookie(resp)
    
    return {"message": "Successfully logged out"}
