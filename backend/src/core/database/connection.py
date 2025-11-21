import logging
from typing import Generator

from sqlalchemy import create_engine, Engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from src.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()


class DatabaseConnection:
    """Manages database engine and session creation."""
    
    def __init__(self):
        self.engine: Engine | None = None
        self.SessionLocal: sessionmaker | None = None
        self._initialized = False
    
    def init_db(self) -> None:
        """Initialize the database engine and session maker."""
        if self._initialized:
            logger.warning("Database already initialized. Skipping re-initialization.")
            return
        
        database_url = str(settings.DATABASE_URL)
        
        if not database_url:
            raise ValueError("DATABASE_URL is not set. Please configure it in your .env file.")
        
        # Configure connection pool to keep connections warm
        self.engine = create_engine(
            database_url,
            pool_size=5,  # Keep 5 connections ready
            max_overflow=10,  # Allow up to 10 more if needed
            pool_pre_ping=True,  # Check connection health before using
            pool_recycle=3600,  # Recycle connections after 1 hour
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._initialized = True
        
        # Pre-warm the connection pool by creating initial connections
        self._warmup_connections()
        
        logger.info(f"Database initialized (environment: {settings.ENVIRONMENT})")
    
    def _warmup_connections(self) -> None:
        """Pre-warm the connection pool to avoid cold start delays."""
        try:
            # Create a few connections to wake up Neon if it's sleeping
            connections_to_warm = 3
            for i in range(connections_to_warm):
                conn = self.engine.connect()
                # Execute a simple query to wake up Neon if it's sleeping
                conn.execute(text("SELECT 1"))
                conn.close()
            logger.info(f"Warmed up {connections_to_warm} database connections")
        except Exception as e:
            logger.warning(f"Failed to warm up connections: {e}. This is okay, connections will be created on demand.")
    
    def close_db(self) -> None:
        """Close the database engine and cleanup resources."""
        if self.engine is not None:
            self.engine.dispose()
            self.engine = None
            self.SessionLocal = None
            self._initialized = False
            logger.info("Database closed")
    
    def get_db(self) -> Generator[Session, None, None]:
        """FastAPI dependency to get database sessions."""
        if self.SessionLocal is None:
            raise RuntimeError("Database not initialized. Ensure init_db() is called at startup.")
        
        db = self.SessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
    
    def get_engine(self) -> Engine:
        """Get the database engine."""
        if self.engine is None:
            raise RuntimeError("Database not initialized. Ensure init_db() is called first.")
        return self.engine


# Global instance
db_connection = DatabaseConnection()
