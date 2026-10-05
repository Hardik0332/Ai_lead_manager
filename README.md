# LeadLoop — AI Event Lead Manager

A small full-stack app that helps a team capture and follow up with people met at business events. Built for the Even8 **AI Native Full Stack Intern** technical assignment.

**Live app:** _[deploy — see Deployment below]_ · **API docs:** once the backend is running, open `http://localhost:8000/docs` for interactive OpenAPI docs.

---

## Features

- **Full lead CRUD** — add, edit, and delete leads with inline validation and confirmation before delete
- **Search & filter** — debounced free-text search across name / company / email / event / notes, plus event dropdown, status filter chips with live counts, and sorting
- **Follow-up pipeline** — statuses `new → contacted → meeting_booked → closed`, changeable inline from any row
- **AI note summary** — turns raw interaction notes into a 3-bullet recap, cached on the lead
- **AI follow-up drafts** — generates a ready-to-send follow-up email in three tones (friendly / formal / short), editable in place with one-click copy
- **Clean responsive UI** — data table on desktop, stacked cards on mobile

## The interesting decision: AI that never breaks the demo

The AI layer (`backend/app/services/ai.py`) has **two implementations behind one interface**:

| Mode | When | Behavior |
|---|---|---|
| `llm` | `OPENAI_API_KEY` is set | Async call to any OpenAI-compatible `/chat/completions` endpoint (OpenAI, Groq, OpenRouter, local Ollama — configurable via `OPENAI_BASE_URL` + `AI_MODEL`), with a timeout and proper error surfaced as HTTP 502 |
| `fallback` | no key configured | A deterministic extractive summarizer (sentence ranking by keyword/actionability) + structured follow-up email templates that reference the event, the most actionable note, and the company |

The header badge and each AI output are labeled with the mode that produced them (`LLM` vs `offline fallback`) — the UI is honest about what generated the text. **The result: the app is fully functional with zero API keys**, and switches to a real LLM with one env var. This mirrors how I'd ship: the product works degraded-but-useful, never dead.

## Stack & key decisions

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4** | The role works with React & Next.js daily. TypeScript for API-boundary safety; Tailwind for a consistent responsive UI without a design-system detour. |
| Backend | **Python FastAPI** | Explicitly requested in the JD. Pydantic validation on every endpoint (bad email → `422` with a helpful message), and free interactive API docs at `/docs`. |
| Database | **SQLite via SQLAlchemy 2.0 ORM** | Explicitly allowed and zero-config — right-sized for a lead-capture demo. Because all access goes through the ORM, moving to PostgreSQL is a one-line `DATABASE_URL` change (Even8 runs Postgres; the code is ready). |
| AI | **OpenAI-compatible client + offline fallback** | See above. One service interface, two implementations. |
| Validation | Pydantic v2 (`EmailStr`, length limits, status enum) | Rejected at the API boundary, mirrored by light client-side checks for fast feedback. |

**Deliberately out of scope** (the assignment rewards a working product over feature count): auth/multi-user, pagination, CSV import, file uploads, automated tests. Each would be first on my list in the real codebase.

## Project structure

```
backend/
  app/
    main.py            # FastAPI app, CORS, router wiring
    models.py          # SQLAlchemy Lead model
    schemas.py         # Pydantic request/response schemas
    database.py        # engine/session (SQLite default, Postgres-ready)
    crud.py            # all DB queries (search/filter/sort live here)
    routers/leads.py   # CRUD endpoints
    routers/ai.py      # summary + follow-up endpoints
    routers/meta.py    # events + stats
    services/ai.py     # LLM + fallback implementations
  seed.py              # 7 realistic demo leads
frontend/
  src/app/page.tsx     # main screen (list, filters, stats)
  src/components/      # LeadCard, LeadModal, AiPanel, Toolbar, StatsBar, Toast
  src/lib/api.ts       # typed API client
```

## Running locally

**Prereqs:** Python 3.11+, Node 18+.

**Backend** (port 8000):

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Windows
# .venv/bin/pip install -r requirements.txt     # macOS/Linux
cp .env.example .env                            # optional — edit to add an API key
.venv/Scripts/python seed.py                    # demo data (skips if DB not empty)
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

**Frontend** (port 3000):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. Without an API key you'll see the `AI: offline fallback` badge and everything still works; add `OPENAI_API_KEY` to `backend/.env` and restart to switch to a real LLM.

## API summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness + active AI mode |
| GET | `/api/leads?search=&event=&status=&sort=` | list with search/filter/sort |
| POST | `/api/leads` | create (validated) |
| GET/PUT/DELETE | `/api/leads/{id}` | detail / update / delete |
| POST | `/api/leads/{id}/summary` | AI summary of notes (cached to `ai_summary`) |
| POST | `/api/leads/{id}/followup` | AI follow-up draft, `{"tone": "friendly\|formal\|short"}` |
| GET | `/api/meta/events`, `/api/meta/stats` | filter options, status counts |

## Deployment

Two small services, deployed separately:

- **Backend → Render / Railway** (free tiers both work):
  1. New "Web Service" from the repo, root directory `backend`
  2. Build: `pip install -r requirements.txt` · Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  3. Env: `FRONTEND_ORIGIN=https://your-frontend.vercel.app` (plus optional `OPENAI_API_KEY`). SQLite persists on the service disk; set `DATABASE_URL` to a hosted Postgres for durability.
- **Frontend → Vercel**: import the repo, root directory `frontend`, set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`.

## What I'd improve next

1. Swap SQLite → Postgres and add Alembic migrations (schema is already ORM-defined)
2. Per-lead activity history (status changes, emails sent) — the current `updated_at` only hints at it
3. Bulk import from event apps / CSV, and a "draft follow-ups for all new leads" batch action
4. Vitest/Playwright tests around the search/filter contract and the AI fallback logic
