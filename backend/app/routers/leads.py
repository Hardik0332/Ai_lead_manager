from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..models import Lead
from ..schemas import LeadCreate, LeadOut, LeadUpdate, VALID_STATUSES

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=list[LeadOut])
def list_leads(
    search: str | None = Query(default=None, max_length=200),
    event: str | None = Query(default=None, max_length=160),
    status: str | None = Query(default=None),
    sort: str = Query(default="recent", pattern="^(recent|name|company|status)$"),
    db: Session = Depends(get_db),
):
    if status and status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"status must be one of {VALID_STATUSES}")
    return crud.list_leads(db, search=search, event=event, status=status, sort=sort)


@router.post("", response_model=LeadOut, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    return crud.create_lead(db, payload.model_dump())


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: int, payload: LeadUpdate, db: Session = Depends(get_db)):
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return crud.update_lead(db, lead, payload.model_dump())


@router.delete("/{lead_id}", status_code=204)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    crud.delete_lead(db, lead)
