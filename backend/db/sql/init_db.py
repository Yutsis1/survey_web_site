"""
Database initialization and table creation.
"""
from sqlalchemy import create_engine 
from sqlalchemy.ext.asyncio import create_async_engine
from backend.config import settings
from backend.models.db.sql.auth import Base
import logging
import asyncio

logger = logging.getLogger(__name__)

async def init_database(max_retries: int = 10, retry_delay: int = 3):
    """Initialize the database and create all tables with retry logic for Railway deployment."""
    
    # # Increase retries in production environments
    # if os.getenv("ENVIRONMENT", "development") == "production":
    #     max_retries = 15
    #     retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to initialize database (attempt {attempt + 1}/{max_retries})...")
            
            # Use async engine for async operations
            engine = create_async_engine(
                settings.DATABASE_URL,
                echo=False,
                pool_pre_ping=True,  # Verify connections before using them
                pool_recycle=3600,   # Recycle connections after 1 hour
            )
            
            # Create all tables asynchronously
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            await engine.dispose()
            logger.info("Database tables created successfully")
            return
            
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"Database connection failed (attempt {attempt + 1}/{max_retries}): {type(e).__name__}: {str(e)[:100]}")
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"Failed to initialize database after {max_retries} attempts")
                logger.error(f"Final error: {type(e).__name__}: {e}")
                # Don't raise - allow app to start without database
                logger.warning("Starting application without database initialization. Tables must exist.")
                return

def create_tables_sync():
    """Synchronous version for direct execution."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        engine.dispose()
    except Exception as e:
        print(f"Failed to create tables: {e}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(init_database())