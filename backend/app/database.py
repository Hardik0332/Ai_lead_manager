import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite by default (zero-config, assignment-approved). Set DATABASE_URL to a
# Postgres DSN to run the same code on Postgres, e.g.
# postgresql+psycopg://user:pass@host:5432/leads
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./leads.db")

engine_kwargs: dict = {}
if DATABASE_URL.startswith("sqlite"):
    # FastAPI may touch the session across threads; SQLite needs this opt-in.
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
