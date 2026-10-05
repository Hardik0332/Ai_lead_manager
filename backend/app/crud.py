from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .models import Lead

SORT_OPTIONS = ("recent", "name", "company", "status")


def list_leads(
    db: Session,
    search: str | None = None,
    event: str | None = None,
    status: str | None = None,
    sort: str = "recent",
) -> list[Lead]:
    stmt = select(Lead)

    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Lead.name.ilike(like),
                Lead.company.ilike(like),
                Lead.email.ilike(like),
                Lead.notes.ilike(like),
                Lead.event_name.ilike(like),
            )
        )
    if event:
        stmt = stmt.where(Lead.event_name == event)
    if status:
        stmt = stmt.where(Lead.status == status)

    order = {
        "name": Lead.name.asc(),
        "company": Lead.company.asc(),
        "status": Lead.status.asc(),
    }.get(sort, Lead.updated_at.desc())
    stmt = stmt.order_by(order, Lead.id.desc())

    return list(db.scalars(stmt).all())


def get_lead(db: Session, lead_id: int) -> Lead | None:
    return db.get(Lead, lead_id)


def create_lead(db: Session, data: dict) -> Lead:
    lead = Lead(**data)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def update_lead(db: Session, lead: Lead, data: dict) -> Lead:
    for key, value in data.items():
        setattr(lead, key, value)
    db.commit()
    db.refresh(lead)
    return lead


def delete_lead(db: Session, lead: Lead) -> None:
    db.delete(lead)
    db.commit()


def distinct_events(db: Session) -> list[str]:
    rows = db.scalars(select(Lead.event_name).distinct().order_by(Lead.event_name)).all()
    return list(rows)


def status_counts(db: Session) -> dict[str, int]:
    rows = db.execute(select(Lead.status, func.count(Lead.id)).group_by(Lead.status)).all()
    counts = {status: 0 for status in ("new", "contacted", "meeting_booked", "closed")}
    for status, count in rows:
        counts[status] = count
    return counts
