"""AI service: LLM-backed when configured, deterministic fallback otherwise.

Both modes implement the same two operations:
- summarize_notes(notes)   -> short, bullet-style summary of interaction notes
- draft_followup(lead)     -> a ready-to-send follow-up message

The rest of the app never branches on which mode is active; it just renders
whatever text comes back along with a `source` tag ("llm" or "fallback") so the
UI can label it honestly.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT_SECONDS", "20"))


def ai_mode() -> str:
    return "llm" if API_KEY else "fallback"


@dataclass
class AiResult:
    text: str
    source: str  # "llm" | "fallback"


# --------------------------------------------------------------------------
# LLM mode (any OpenAI-compatible /chat/completions endpoint)
# --------------------------------------------------------------------------

async def _chat(system_prompt: str, user_prompt: str) -> str:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": 400,
    }
    headers = {"Authorization": f"Bearer {API_KEY}"}
    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        resp = await client.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


# --------------------------------------------------------------------------
# Fallback mode (no API key) — deterministic, offline, honest
# --------------------------------------------------------------------------

_STOPWORDS = set(
    """a about after all also an and any are as at be been but by can could did do
    for from get got had has have he her him his how i if in into is it its just
    me more my no not of on or our out said she so some than that the their them
    then there they this to too us very was we were what when which who will with
    would you your""".split()
)

_SUMMARY_OPENERS = (
    "met", "discussed", "asked", "interested", "wants", "need", "follow",
    "demo", "budget", "team", "next", "week", "introduce", "talked",
)


def _sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [p.strip() for p in parts if len(p.strip()) >= 12]


def _keyword_score(sentence: str) -> float:
    words = re.findall(r"[a-zA-Z']+", sentence.lower())
    if not words:
        return 0.0
    hits = sum(1 for w in words if w in _STOPWORDS)
    actionable = sum(1 for w in words if w in _SUMMARY_OPENERS)
    length_penalty = abs(len(words) - 12) * 0.05
    return (len(words) - hits) / len(words) + actionable * 0.5 - length_penalty


def _fallback_summary(notes: str, limit: int = 3) -> str:
    notes = notes.strip()
    if not notes:
        return "No interaction notes recorded yet."
    sentences = _sentences(notes)
    if not sentences:
        return f"Notes: {notes[:180]}"
    ranked = sorted(sentences, key=_keyword_score, reverse=True)[:limit]
    # keep original order of sentences for readability
    chosen = [s for s in sentences if s in ranked]
    return "\n".join(f"- {s.rstrip('.')}" for s in chosen)


def _fallback_followup(lead, tone: str) -> str:
    first_name = lead.name.split()[0]
    note_hint = ""
    sentences = _sentences(lead.notes or "")
    if sentences:
        best = max(sentences, key=_keyword_score).rstrip(".")
        note_hint = f'You mentioned wanting to follow up on: "{best}"'

    if tone == "formal":
        return (
            f"Subject: Following up — {lead.event_name}\n\n"
            f"Dear {lead.name},\n\n"
            f"It was a pleasure to meet you at {lead.event_name}. "
            f"{note_hint}\n\n"
            f"I would welcome the opportunity to continue the conversation and explore "
            f"how we might support {lead.company}'s goals. Would you be available for a "
            f"brief call in the coming week?\n\n"
            f"Kind regards,\n[Your name]"
        )
    if tone == "short":
        return (
            f"Hi {first_name},\n\n"
            f"Great meeting you at {lead.event_name}! "
            f"{note_hint}\n\n"
            f"Open to a quick 15-minute call this week?\n\n"
            f"Best,\n[Your name]"
        )
    return (
        f"Hi {first_name},\n\n"
        f"It was great meeting you at {lead.event_name}! "
        f"{note_hint}\n\n"
        f"I'd love to continue the conversation about how we could help the team at "
        f"{lead.company}. Would you be open to a short call next week? I'm flexible on "
        f"time, so feel free to suggest what works for you.\n\n"
        f"Looking forward to hearing from you.\n\n"
        f"Best regards,\n[Your name]"
    )


# --------------------------------------------------------------------------
# Public interface
# --------------------------------------------------------------------------

async def summarize_notes(notes: str) -> AiResult:
    if ai_mode() == "llm":
        system = (
            "You summarize business-event interaction notes for a sales/team member. "
            "Reply with at most 3 concise bullet lines, each starting with '- '. "
            "Capture who the person is, what was discussed, and any agreed next step. "
            "No preamble, no closing remarks."
        )
        text = await _chat(system, notes.strip() or "No notes provided.")
        return AiResult(text=text, source="llm")
    return AiResult(text=_fallback_summary(notes), source="fallback")


async def draft_followup(lead, tone: str = "friendly") -> AiResult:
    if ai_mode() == "llm":
        tone_guides = {
            "friendly": "warm and professional",
            "formal": "formal and courteous",
            "short": "very brief (under 60 words)",
        }
        system = (
            "You write follow-up emails after business events. "
            f"Tone: {tone_guides.get(tone, tone_guides['friendly'])}. "
            "Start with a 'Subject:' line, keep it under 120 words, reference the event "
            "and something specific from the notes, and propose one clear next step. "
            "Sign off as [Your name]. Output only the email text."
        )
        user = (
            f"Name: {lead.name}\nCompany: {lead.company}\nEmail: {lead.email}\n"
            f"Event: {lead.event_name}\nStatus: {lead.status}\nNotes:\n{lead.notes or '(none)'}"
        )
        text = await _chat(system, user)
        return AiResult(text=text, source="llm")
    return AiResult(text=_fallback_followup(lead, tone), source="fallback")
