"""
Application settings and configuration.
"""
import os
from dotenv import load_dotenv

path_to_env = os.path.join(os.path.dirname(__file__), "../../.env")
load_dotenv(path_to_env)

# JWT Configuration
JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-here-change-in-production")
JWT_ALG: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_EXPIRE_MIN: int = int(os.getenv("ACCESS_EXPIRE_MIN", "15"))  # 15 minutes
REFRESH_EXPIRE_DAYS: int = int(os.getenv("REFRESH_EXPIRE_DAYS", "7"))  # 7 days

# Cookie Configuration
COOKIE_NAME: str = os.getenv("COOKIE_NAME", "refresh_token")

# Database Configuration
DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/survey_auth")

# MongoDB Configuration
MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "surveys_db")
MONGO_MIGRATION_STRATEGY: str = os.getenv("MONGO_MIGRATION_STRATEGY", os.getenv("MIGRATION_STRATEGY", "delete"))  # Options: 'update', 'delete', or 'safe'

# SQL Migration Configuration
SQL_MIGRATION_STRATEGY: str = os.getenv("SQL_MIGRATION_STRATEGY", os.getenv("MIGRATION_STRATEGY", "delete"))  # Options: 'update', 'delete', or 'safe'

# Security Configuration
SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")

# Application Configuration
DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

# CORS Configuration
ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")


# def validate_settings():
#     """Validate critical settings on startup."""
#     if JWT_SECRET == "your-secret-key-here-change-in-production" and ENVIRONMENT == "production":
#         raise ValueError("JWT_SECRET must be changed in production!")
    
#     if SECRET_KEY == "your-secret-key-change-in-production" and ENVIRONMENT == "production":
#         raise ValueError("SECRET_KEY must be changed in production!")

# # Call validation when module is imported (uncommented)
# validate_settings()