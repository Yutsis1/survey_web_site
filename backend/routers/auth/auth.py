"""
Router to manage user authentication: registration, login, token refresh.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie, Header
from sqlalchemy import func
from backend.db.sql.sql_driver import get_db
from backend.models.api.auth import AccessOut, RegisterIn
from backend.models.db.sql.auth import RefreshToken, User
import uuid

from backend.routers.auth.security_utl import *


router = APIRouter(
    prefix="/surveys",
    tags=["surveys"]
)

REFRESH_COOKIE = settings.COOKIE_NAME

def set_refresh_cookie(resp: Response, token: str):
    resp.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=True,      # False only for local http
        samesite="lax",
        path="/auth/refresh",
        max_age=settings.REFRESH_EXPIRE_DAYS * 86400,
    )

def clear_refresh_cookie(resp: Response):
    resp.delete_cookie(REFRESH_COOKIE, path="/auth/refresh")


@router.post("/auth/register", response_model=AccessOut)
def register(payload: RegisterIn, resp: Response, db=Depends(get_db)):
    email = payload.email.lower().strip()
    if db.query(User).filter(func.lower(User.email) == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)

    refresh_jwt, jti = make_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_id=jti)); db.commit()
    set_refresh_cookie(resp, refresh_jwt)

    access = make_access_token(user.id, user.role, user.token_version)
    return {"access_token": access}

@router.post("/auth/login", response_model=AccessOut)
def login(payload: LoginIn, resp: Response, db=Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    refresh_jwt, jti = make_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_id=jti)); db.commit()
    set_refresh_cookie(resp, refresh_jwt)

    access = make_access_token(user.id, user.role, user.token_version)
    return {"access_token": access}

@router.post("/auth/refresh", response_model=AccessOut)
def refresh(request: Request, resp: Response, db=Depends(get_db), refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh cookie")
    try:
        data = decode(refresh_token)
        jti = uuid.UUID(data["jti"])
        user_id = uuid.UUID(data["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh")

    rt = db.query(RefreshToken).filter(RefreshToken.token_id == jti, RefreshToken.revoked == False).first()
    if not rt:
        raise HTTPException(status_code=401, detail="Refresh revoked or not found")

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")