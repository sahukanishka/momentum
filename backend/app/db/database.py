from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import text
from app.core.config import settings
import logging
import os
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

# Convert sync URL to async URL for PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )

# Create async engine
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# init db
async def init_db():
    try:
        async with engine.begin() as conn:
            # Test the connection
            await conn.execute(text("SELECT 1"))
            logger.info("Database connected successfully")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing DB: {str(e)}")
        raise


# close db
async def close_db():
    try:
        await engine.dispose()
        logger.info("Database closed successfully")
    except Exception as e:
        logger.error(f"Error closing DB: {str(e)}")
        raise
