from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StatusEnum(str, Enum):
    new = "new"
    contacted = "contacted"
    meeting_booked = "meeting_booked"
    closed = "closed"


VALID_STATUSES = [s.value for s in StatusEnum]


class LeadBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: str = Field(min_length=1, max_length=120)
    email: EmailStr
    event_name: str = Field(min_length=1, max_length=160)
    notes: str = Field(default="", max_length=8000)
    status: StatusEnum = StatusEnum.new


class LeadCreate(LeadBase):
    pass


class LeadUpdate(LeadBase):
    pass


class LeadOut(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    ai_summary: str | None
    created_at: datetime
    updated_at: datetime


class AiSummaryOut(BaseModel):
    lead_id: int
    summary: str
    source: str  # "llm" | "fallback"


class FollowupRequest(BaseModel):
    tone: str = Field(default="friendly", pattern="^(friendly|formal|short)$")


class AiFollowupOut(BaseModel):
    lead_id: int
    message: str
    source: str  # "llm" | "fallback"


class HealthOut(BaseModel):
    status: str
    ai_mode: str  # "llm" | "fallback"
    model: str  # configured AI model name (not a secret)
