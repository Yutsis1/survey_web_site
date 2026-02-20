"""
Migration utilities for SQL (PostgreSQL) database.
Handles demo user password synchronization and other schema/data migrations.
"""
import logging
from sqlalchemy import func, select, update, delete

from backend.config.settings import SQL_MIGRATION_STRATEGY, ENVIRONMENT
from backend.db.sql.sql_driver import AsyncSessionLocal
from backend.models.db.sql.auth import User, RefreshToken
from backend.routers.auth.security_utl import hash_password

logger = logging.getLogger(__name__)

DEMO_USER_EMAIL = "kek@lol.com"
DEMO_USER_PASSWORD = "Test@1234"


async def _reset_auth_data() -> None:
    """
    Remove all auth data in non-production when delete strategy is selected.
    This is intended for local/dev test environments to ensure a clean slate.
    """
    if ENVIRONMENT.lower() == "production":
        logger.warning("Skipping auth reset in production environment.")
        return

    async with AsyncSessionLocal() as session:
        try:
            await session.execute(delete(RefreshToken))
            await session.execute(delete(User))
            await session.commit()
            logger.info("Deleted all auth users and refresh tokens.")
        except Exception:
            await session.rollback()
            logger.exception("Failed to reset auth data")


async def _sync_demo_user_password() -> None:
    """
    Synchronize demo user password to the default password.
    Handles cases where demo user exists but with a different password.
    """
    email = DEMO_USER_EMAIL.lower().strip()
    expected_password_hash = hash_password(DEMO_USER_PASSWORD)

    async with AsyncSessionLocal() as session:
        try:
            existing = (
                await session.execute(select(User).where(func.lower(User.email) == email))
            ).scalar_one_or_none()

            if not existing:
                logger.info("Demo user does not exist; no password sync needed.")
                return

            if existing.password_hash == expected_password_hash:
                logger.info("Demo user password already matches expected value.")
                return

            logger.warning(
                "Demo user password mismatch detected for %s. "
                "Using migration strategy '%s'.",
                email,
                SQL_MIGRATION_STRATEGY,
            )

            if SQL_MIGRATION_STRATEGY == "update":
                await session.execute(
                    update(User)
                    .where(func.lower(User.email) == email)
                    .values(password_hash=expected_password_hash)
                )
                await session.commit()
                logger.info("Updated demo user password to default value.")

            elif SQL_MIGRATION_STRATEGY == "delete":
                await session.execute(delete(User).where(func.lower(User.email) == email))
                await session.commit()
                logger.info("Deleted demo user with mismatched password.")
                logger.info("Demo user will be recreated on next startup with default password.")

            else:
                logger.info(
                    "Migration strategy '%s' does not apply password sync; no action taken.",
                    SQL_MIGRATION_STRATEGY,
                )

        except Exception:
            await session.rollback()
            logger.exception("Failed to sync demo user password")


async def run_migrations() -> None:
    """
    Run all SQL database migrations.
    Ensures demo user password is synchronized to the expected default.
    """
    logger.info("Running SQL migrations with strategy '%s'.", SQL_MIGRATION_STRATEGY)
    if SQL_MIGRATION_STRATEGY == "delete":
        await _reset_auth_data()
    await _sync_demo_user_password()
    logger.info("SQL migrations completed successfully!")
