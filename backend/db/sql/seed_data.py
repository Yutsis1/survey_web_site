"""
Seed helpers for SQL-backed authentication entities.
"""
import logging

from sqlalchemy import func, select

from backend.db.sql.sql_driver import AsyncSessionLocal
from backend.models.db.sql.auth import User
from backend.routers.auth.security_utl import hash_password

logger = logging.getLogger(__name__)

DEMO_USER_EMAIL = "kek@lol.com"
DEMO_USER_PASSWORD = "Test@1234"


async def seed_demo_user() -> User | None:
    """
    Idempotently seed a demo user account.

    Returns the demo user when available; returns None when seeding fails.
    """
    email = DEMO_USER_EMAIL.lower().strip()

    async with AsyncSessionLocal() as session:
        try:
            existing = (
                await session.execute(select(User).where(func.lower(User.email) == email))
            ).scalar_one_or_none()
            if existing:
                return existing

            user = User(email=email, password_hash=hash_password(DEMO_USER_PASSWORD))
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user
        except Exception:
            await session.rollback()
            logger.exception("Failed to seed demo SQL user")
            return None
