import asyncio
import types
import uuid
import pytest
from types import SimpleNamespace
from fastapi import Response, Request
from starlette.datastructures import Headers
from backend.routers.auth import auth as auth_mod

# ----------------------------
# Fakes & monkeypatch helpers
# ----------------------------

class FakeUser:
    def __init__(self, email, password_hash, role="user", token_version=0, is_active=True, id=None):
        self.id = id or uuid.uuid4()
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.token_version = token_version
        self.is_active = is_active

class FakeRefreshToken:
    def __init__(self, user_id, token_id, revoked=False):
        self.user_id = user_id
        self.token_id = token_id
        self.revoked = revoked

class FakeSelect:
    def __init__(self, model):
        self.model = model
        self._where = tuple()

    def where(self, *conds):
        # Store any conditions (they're opaque to us, but our fakes will pack necessary values in them)
        self._where = tuple(conds)
        return self

class FakeFunc:
    class _Lower:
        def __init__(self, col):
            self.col = col
            self._eq = None
        def __eq__(self, other):
            # Pack email for later retrieval by FakeSession.execute
            self._eq = other
            return ("LOWER_EQ", other)

    def lower(self, col):
        return FakeFunc._Lower(col)

class FakeColumn:
    def __init__(self, name):
        self.name = name
    def __eq__(self, other):
        return ("EQ", self.name, other)

class FakeSession:
    """
    Minimal async "session" that supports the methods used by the router:
    - add
    - commit
    - refresh
    - execute(...).scalar_one_or_none()
    - get(model, pk)
    """
    def __init__(self):
        self.users_by_email = {}   # email -> FakeUser
        self.users_by_id = {}      # uuid -> FakeUser
        self.refresh_tokens = {}   # jti -> FakeRefreshToken

    class _Result:
        def __init__(self, value):
            self._value = value
        def scalar_one_or_none(self):
            return self._value

    async def execute(self, stmt):
        # SELECT User WHERE lower(User.email) == email
        if isinstance(stmt, FakeSelect) and stmt.model is auth_mod.User:
            # Find email packed inside ("LOWER_EQ", email)
            email = None
            for cond in stmt._where:
                if isinstance(cond, tuple) and len(cond) == 2 and cond[0] == "LOWER_EQ":
                    email = cond[1]
            user = self.users_by_email.get(email)
            return FakeSession._Result(user)

        # SELECT RefreshToken WHERE token_id == jti AND revoked == False
        if isinstance(stmt, FakeSelect) and stmt.model is auth_mod.RefreshToken:
            # Expect cond like ("EQ", "token_id", jti) and ("EQ", "revoked", False)
            jti = None
            revoked_val = None
            for cond in stmt._where:
                if isinstance(cond, tuple) and len(cond) == 3:
                    tag, field, value = cond
                    if tag == "EQ" and field == "token_id":
                        jti = value
                    if tag == "EQ" and field == "revoked":
                        revoked_val = value
            rt = self.refresh_tokens.get(jti)
            if rt and revoked_val is False and rt.revoked is False:
                return FakeSession._Result(rt)
            return FakeSession._Result(None)

        # Fallback: nothing found
        return FakeSession._Result(None)

    async def get(self, model, pk):
        if model is auth_mod.User:
            return self.users_by_id.get(pk)
        return None

    def add(self, obj):
        if isinstance(obj, FakeUser):
            self.users_by_email[obj.email] = obj
            self.users_by_id[obj.id] = obj
        elif isinstance(obj, FakeRefreshToken):
            self.refresh_tokens[obj.token_id] = obj

    async def commit(self):
        return

    async def refresh(self, obj):
        return


@pytest.fixture(autouse=True)
def patch_auth_module(monkeypatch):
    """
    Auto-applied fixture to patch:
    - settings & constants
    - ORM models (User, RefreshToken) columns
    - sqlalchemy helpers (select, func)
    - security utils (hash/verify/make/decode)
    """
    # Patch cookie name & expiry settings
    monkeypatch.setattr(auth_mod, "REFRESH_COOKIE", "rt", raising=False)
    # ensure settings.REFRESH_EXPIRE_DAYS exists
    if not hasattr(auth_mod, "settings"):
        auth_mod.settings = SimpleNamespace()
    auth_mod.settings.REFRESH_EXPIRE_DAYS = 7

    # Patch models with fake columns for filter building
    monkeypatch.setattr(auth_mod, "User", FakeUser, raising=False)
    monkeypatch.setattr(auth_mod, "RefreshToken", FakeRefreshToken, raising=False)
    # attach "columns" for the FakeFunc.lower(...) and equality checks
    auth_mod.User.email = FakeColumn("email")
    auth_mod.RefreshToken.token_id = FakeColumn("token_id")
    auth_mod.RefreshToken.revoked = FakeColumn("revoked")

    # Patch SQL helpers
    monkeypatch.setattr(auth_mod, "select", lambda model: FakeSelect(model), raising=False)
    monkeypatch.setattr(auth_mod, "func", FakeFunc(), raising=False)

    # Patch security utilities
    def fake_hash_password(pw: str) -> str:
        return f"hashed:{pw}"

    def fake_verify_password(pw: str, hashed: str) -> bool:
        return hashed == f"hashed:{pw}"

    def fake_make_refresh_token(user_id):
        jti = uuid.uuid4()
        return ("refresh.jwt", jti)

    def fake_make_access_token(user_id, role, token_version):
        return "access.jwt"

    def fake_decode(token: str):
        # Provide valid minimal payload by default
        # Can be monkeypatched per test to raise/return altered payloads
        return {"jti": str(uuid.uuid4()), "sub": str(uuid.uuid4())}

    monkeypatch.setattr(auth_mod, "hash_password", fake_hash_password, raising=False)
    monkeypatch.setattr(auth_mod, "verify_password", fake_verify_password, raising=False)
    monkeypatch.setattr(auth_mod, "make_refresh_token", fake_make_refresh_token, raising=False)
    monkeypatch.setattr(auth_mod, "make_access_token", fake_make_access_token, raising=False)
    monkeypatch.setattr(auth_mod, "decode", fake_decode, raising=False)


@pytest.fixture
def db():
    return FakeSession()

# ----------------------------
# Tests for register
# ----------------------------

@pytest.mark.asyncio
async def test_register_success_sets_cookie_and_returns_access(db, monkeypatch):
    resp = Response()
    payload = SimpleNamespace(email="NEW@Email.COM  ", password="pw123")

    # call
    out = await auth_mod.register(payload=payload, resp=resp, db=db)

    # response model
    assert "access_token" in out
    assert out["access_token"] == "access.jwt"

    # cookie set correctly
    cookies = resp.headers.get("set-cookie") or ""
    assert "rt=" in cookies, f"cookies: {cookies}"
    assert "Path=/refresh" in cookies, f"cookies: {cookies}"
    assert "HttpOnly" in cookies, f"cookies: {cookies}"
    # secure was True in code
    assert "Secure" in cookies, f"cookies: {cookies}"

    # refresh token persisted
    assert len(db.refresh_tokens) == 1, f"tokens: {db.refresh_tokens}"

@pytest.mark.asyncio
async def test_register_existing_email_returns_400(db):
    # Seed an existing user
    existing = FakeUser(email="someone@example.com", password_hash="hashed:pw")
    db.add(existing)

    resp = Response()
    payload = SimpleNamespace(email="Someone@Example.com", password="newpw")
    with pytest.raises(Exception) as exc:
        await auth_mod.register(payload=payload, resp=resp, db=db)
    assert hasattr(exc.value, "status_code") and exc.value.status_code == 400, f"detail: {exc.value}"
    assert "Email already registered" in str(exc.value.detail), f"detail: {exc.value.detail}"

# ----------------------------
# Tests for login
# ----------------------------

@pytest.mark.asyncio
async def test_login_success_sets_cookie_and_returns_access(db):
    # Seed a valid user
    user = FakeUser(email="u@ex.com", password_hash="hashed:pw")
    db.add(user)

    resp = Response()
    payload = SimpleNamespace(email="  U@EX.COM ", password="pw")
    out = await auth_mod.login(payload=payload, resp=resp, db=db)

    assert out["access_token"] == "access.jwt"
    cookies = resp.headers.get("set-cookie") or ""
    assert "rt=" in cookies, f"cookies: {cookies}"
    assert "Path=/refresh" in cookies

    # refresh token persisted
    assert len(db.refresh_tokens) == 1

@pytest.mark.asyncio
async def test_login_invalid_credentials_401(db):
    # Seed a user but with different password
    user = FakeUser(email="u@ex.com", password_hash="hashed:other")
    db.add(user)

    resp = Response()
    payload = SimpleNamespace(email="u@ex.com", password="pw")
    with pytest.raises(Exception) as exc:
        await auth_mod.login(payload=payload, resp=resp, db=db)
    assert hasattr(exc.value, "status_code") and exc.value.status_code == 401, f"detail: {exc.value}"
    assert "Invalid credentials" in str(exc.value.detail), f"detail: {exc.value.detail}"

# ----------------------------
# Tests for refresh (error branches)
# ----------------------------

@pytest.mark.asyncio
async def test_refresh_missing_cookie_401(db):
    resp = Response()
    scope = {"type": "http", "headers": []}
    req = Request(scope, receive=lambda: None)

    with pytest.raises(Exception) as exc:
        await auth_mod.refresh(request=req, resp=resp, db=db, refresh_token=None)
    assert exc.value.status_code == 401, f"detail: {exc.value}"
    assert "Missing refresh cookie" in exc.value.detail, f"detail: {exc.value.detail}"

@pytest.mark.asyncio
async def test_refresh_invalid_token_401(db, monkeypatch):
    def bad_decode(_):
        raise ValueError("nope")
    monkeypatch.setattr(auth_mod, "decode", bad_decode, raising=False)

    resp = Response()
    scope = {"type": "http", "headers": []}
    req = Request(scope, receive=lambda: None)

    with pytest.raises(Exception) as exc:
        await auth_mod.refresh(request=req, resp=resp, db=db, refresh_token="bad")
    assert exc.value.status_code == 401, f"detail: {exc.value}"
    assert "Invalid refresh" in exc.value.detail, f"detail: {exc.value.detail}"

@pytest.mark.asyncio
async def test_refresh_revoked_or_not_found_401(db, monkeypatch):
    # decode returns a fixed jti/sub
    jti = uuid.uuid4()
    uid = uuid.uuid4()

    def good_decode(_):
        return {"jti": str(jti), "sub": str(uid)}
    monkeypatch.setattr(auth_mod, "decode", good_decode, raising=False)

    # Do NOT persist any RefreshToken -> should 401 at token check
    resp = Response()
    scope = {"type": "http", "headers": []}
    req = Request(scope, receive=lambda: None)

    with pytest.raises(Exception) as exc:
        await auth_mod.refresh(request=req, resp=resp, db=db, refresh_token="ok")
    assert exc.value.status_code == 401, f"detail: {exc.value}"
    assert "Refresh revoked or not found" in exc.value.detail, f"detail: {exc.value.detail}"

@pytest.mark.asyncio
async def test_refresh_user_inactive_401(db, monkeypatch):
    # Arrange: valid decode, persisted refresh token, but inactive user
    jti = uuid.uuid4()
    uid = uuid.uuid4()

    def good_decode(_):
        return {"jti": str(jti), "sub": str(uid)}
    monkeypatch.setattr(auth_mod, "decode", good_decode, raising=False)

    # Persist token
    db.add(FakeRefreshToken(user_id=uid, token_id=jti, revoked=False))
    # Persist inactive user
    db.add(FakeUser(email="x@y.com", password_hash="hashed:a", is_active=False, id=uid))

    resp = Response()
    scope = {"type": "http", "headers": []}
    req = Request(scope, receive=lambda: None)

    with pytest.raises(Exception) as exc:
        await auth_mod.refresh(request=req, resp=resp, db=db, refresh_token="ok")
    assert exc.value.status_code == 401, f"exc value: {exc.value}"
    assert "User inactive" in exc.value.detail, f"detail: {exc.value.detail}"

# ----------------------------
# Cookie helpers
# ----------------------------

def test_set_and_clear_refresh_cookie_roundtrip():
    resp = Response()
    auth_mod.set_refresh_cookie(resp, "token123")

    cookies = resp.headers.get("set-cookie") or ""
    assert "rt=token123" in cookies, f"cookies: {cookies}"
    assert "Path=/refresh" in cookies, f"cookies: {cookies}"
    assert "HttpOnly" in cookies, f"cookies: {cookies}"
    assert "Secure" in cookies, f"cookies: {cookies}"

    # Clearing should set a deletion cookie
    auth_mod.clear_refresh_cookie(resp)
    cookies2 = resp.headers.getlist("set-cookie")
    # Last cookie should contain Max-Age=0 or an expired date (framework-dependent)
    assert any("rt=" in c and "Path=/refresh" in c for c in cookies2), f"cookies: {cookies2}"
