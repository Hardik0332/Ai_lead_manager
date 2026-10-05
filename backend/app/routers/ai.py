from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas import AiFollowupOut, AiSummaryOut, FollowupRequest
from ..services import ai

router = APIRouter(prefix="/api", tags=["ai"])


@router.post("/leads/{lead_id}/summary", response_model=AiSummaryOut)
async def summarize_lead(lead_id: int, db: Session = Depends(get_db)):
    """Summarize a lead's interaction notes with AI and cache the result."""
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    try:
        result = await ai.summarize_notes(lead.notes)
    except Exception as exc:  # network / provider failure
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    lead.ai_summary = result.text
    db.commit()
    return AiSummaryOut(lead_id=lead_id, summary=result.text, source=result.source)


@router.post("/leads/{lead_id}/followup", response_model=AiFollowupOut)
async def draft_followup(
    lead_id: int, payload: FollowupRequest | None = None, db: Session = Depends(get_db)
):
    """Draft a follow-up message for a lead. Not persisted — the user may edit it."""
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    tone = payload.tone if payload else "friendly"
    try:
        result = await ai.draft_followup(lead, tone)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    return AiFollowupOut(lead_id=lead_id, message=result.text, source=result.source)
