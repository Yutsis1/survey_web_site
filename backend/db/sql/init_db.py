"""
Database initialization and table creation.
"""
from sqlalchemy import create_engine
from backend.config import settings
from backend.models.db.sql.auth import Base
import logging

logger = logging.getLogger(__name__)

async def init_database():
    """Initialize the database and create all tables."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def create_tables_sync():
    """Synchronous version for direct execution."""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

if __name__ == "__main__":
    create_tables_sync()