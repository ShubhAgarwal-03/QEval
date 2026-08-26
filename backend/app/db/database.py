from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import get_settings

settings = get_settings()

# Render (and some other hosts) hand out "postgres://" URLs, but SQLAlchemy 2.x
# requires the "postgresql://" scheme - normalize it here so deploys don't break.
_db_url = settings.database_url
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

# check_same_thread is only needed for SQLite (used in local dev).
connect_args = {"check_same_thread": False} if _db_url.startswith("sqlite") else {}

engine = create_engine(_db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called once on app startup for local/dev use.
    In production, prefer Alembic migrations instead of this."""
    # Import models here so they're registered on Base before create_all runs.
    from app.models import question, session, attempt  # noqa: F401

    Base.metadata.create_all(bind=engine)