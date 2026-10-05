from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db

router = APIRouter(prefix="/api/meta", tags=["meta"])


@router.get("/events")
def list_events(db: Session = Depends(get_db)):
    return {"events": crud.distinct_events(db)}


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {"counts": crud.status_counts(db)}
