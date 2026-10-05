"""Seed the database with realistic demo leads (skips if leads already exist)."""

from app.database import Base, SessionLocal, engine
from app.models import Lead

DEMO_LEADS = [
    {
        "name": "Priya Sharma",
        "company": "Nimbus Analytics",
        "email": "priya.sharma@nimbusanalytics.io",
        "event_name": "SaaS Summit 2026",
        "notes": (
            "Met at the afternoon networking session. She leads a 12-person data team and "
            "complained that event ROI reporting takes them two weeks of manual spreadsheet "
            "work after every tradeshow. Asked whether we can auto-attribute closed deals "
            "to specific conversations. Wants a demo focused on attribution dashboards. "
            "Follow up with pricing for the Teams tier."
        ),
        "status": "contacted",
    },
    {
        "name": "Arjun Mehta",
        "company": "Northwind Logistics",
        "email": "arjun.mehta@northwindlog.com",
        "event_name": "SaaS Summit 2026",
        "notes": (
            "Stopped by our booth on day one. Ops manager, evaluating tools for their sales "
            "team of 40. Currently using spreadsheets and WhatsApp to track event contacts. "
            "Budget cycle starts next quarter. Send the one-pager and case study."
        ),
        "status": "new",
    },
    {
        "name": "Sara Kim",
        "company": "Helios Ventures",
        "email": "sara.kim@heliosvc.com",
        "event_name": "GrowthX Connect",
        "notes": (
            "Introduced by Rahul from Delta Labs. Investor, interested in the events-tech "
            "space and our traction numbers. Asked about retention and pipeline coverage. "
            "No immediate buying intent but a great connection for the future. Send quarterly "
            "updates."
        ),
        "status": "meeting_booked",
    },
    {
        "name": "Daniel Okafor",
        "company": "Brightpath Edu",
        "email": "d.okafor@brightpathedu.co",
        "event_name": "GrowthX Connect",
        "notes": (
            "Chatted during the panel lunch. Runs partnerships at an edtech company. They "
            "host ~30 webinars a year and struggle to follow up with attendees afterwards. "
            "Curious about automated follow-up drafts. Booked a call for next Tuesday."
        ),
        "status": "meeting_booked",
    },
    {
        "name": "Meera Iyer",
        "company": "Trellis Health",
        "email": "meera.iyer@trellishealth.in",
        "event_name": "MedTech Expo 2026",
        "notes": (
            "Long conversation at the coffee stand. Head of growth. Their field teams meet "
            "hundreds of clinicians at conferences and lose the contacts in personal notebooks. "
            "Wants a shared team workspace with search. Security review required — needs SOC2 "
            "docs before anything else."
        ),
        "status": "contacted",
    },
    {
        "name": "Tom Alvarez",
        "company": "Bluepeak Retail",
        "email": "tom.alvarez@bluepeakretail.com",
        "event_name": "Retail Tech Live",
        "notes": (
            "Quick booth conversation, seemed in a hurry. Store ops lead. Took a brochure "
            "and scanned our QR code. Main question was cost per seat. Not a strong fit right "
            "now — mark as low priority."
        ),
        "status": "closed",
    },
    {
        "name": "Ananya Rao",
        "company": "Foxglove PR",
        "email": "ananya@foxglovepr.agency",
        "event_name": "Retail Tech Live",
        "notes": (
            "Met at the speaker dinner. Agency founder, repping several consumer brands. "
            "Interested in white-label event reporting for clients. Asked for referral terms. "
            "Warm intro potential is high — handle carefully."
        ),
        "status": "new",
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.query(Lead).count() > 0:
            print("Database already has leads — skipping seed.")
            return
        db.add_all([Lead(**lead) for lead in DEMO_LEADS])
        db.commit()
        print(f"Seeded {len(DEMO_LEADS)} demo leads.")


if __name__ == "__main__":
    seed()
