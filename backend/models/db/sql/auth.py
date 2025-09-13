"""Returns the current UTC datetime with timezone information."""
"""SQLAlchemy model representing a user in the authentication system.
Attributes:
    id (UUID): Unique identifier for the user.
    email (str): User's email address, indexed and unique (case-insensitive).
    password_hash (str): Hashed password for the user.
    is_active (bool): Indicates if the user account is active.
    role (str): User's role in the system, defaults to 'user'.
    token_version (int): Version number for token invalidation.
"""
"""SQLAlchemy model representing a refresh token for user authentication.
Attributes:
    id (UUID): Unique identifier for the refresh token.
    user_id (UUID): Foreign key referencing the associated user.
    token_id (UUID): Unique token identifier (JTI), used for JWT.
    created_at (datetime): Timestamp when the token was created.
    revoked (bool): Indicates if the token has been revoked.
    user (User): Relationship to the User model.
"""

from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Index, func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

Base = declarative_base()

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    """
    Represents a user in the system.
    This SQLAlchemy model defines the structure of the 'users' table in the database.
    It includes fields for user identification, authentication, and role management.
    Attributes:
        id (UUID): Unique identifier for the user, automatically generated.
        email (str): User's email address, must be unique (case-insensitive).
        password_hash (str): Hashed password for authentication.
        is_active (bool): Indicates if the user account is active (default: True).
        role (str): User's role in the system (default: "user").
        token_version (int): Version number for token invalidation (default: 0).
    Table Constraints:
        - Unique index on lowercased email for case-insensitive uniqueness.
    """
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, index=True)   # unique via functional index below
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    role = Column(String, nullable=False, default="user")
    token_version = Column(Integer, nullable=False, default=0)

    # Unique on lower(email) for case-insensitive uniqueness (no citext extension)
    __table_args__ = (
        Index("uq_users_email_lower", func.lower(email), unique=True),
    )

class RefreshToken(Base):
    """
    Represents a refresh token in the database for JWT authentication.
    This model stores refresh tokens associated with users, including a unique
    token identifier (JTI), creation timestamp, and revocation status. It supports
    cascading deletion when the associated user is deleted.
    Attributes:
        id (UUID): Primary key, auto-generated unique identifier.
        user_id (UUID): Foreign key referencing the User model, with cascade delete.
        token_id (UUID): Unique identifier for the token (JTI), used in JWT claims.
        created_at (DateTime): Timestamp of token creation, in UTC.
        revoked (Boolean): Flag indicating if the token has been revoked.
        user (relationship): Relationship to the User model.
    Table Arguments:
        Indexes on user_id and created_at for efficient querying.
    """
    __tablename__ = "refresh_tokens"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_id = Column(UUID(as_uuid=True), nullable=False, unique=True)  # JTI
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    revoked = Column(Boolean, nullable=False, default=False)

    user = relationship("User")

    __table_args__ = (
        Index("ix_refresh_tokens_user_id", "user_id"),
        Index("ix_refresh_tokens_created_at", "created_at"),
    )
