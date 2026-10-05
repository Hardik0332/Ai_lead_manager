# Even8 Full Stack Intern Assignment — Build Plan

> **Assignment:** AI Event Lead Manager · Even8 (AI Native Full Stack Intern)
> **Source:** `Even8_AI_Native_Full_Stack_Intern.pdf` (page 2)
> **Recommended effort per Even8:** 4–6 hours — focus on clear decisions and a working product, not feature count.

---

## 1. What Even8 asked for (verbatim requirements)

Build a small full-stack application that helps a team capture and follow up with people met at business events.

**Core requirements**
- [ ] Add, edit, delete, search, and filter event leads
- [ ] Store: name, company, email, event, notes, follow-up status
- [ ] Save the data in a database
- [ ] Use AI to summarize interaction notes **or** draft a follow-up message (we'll do both)
- [ ] Clean and responsive interface

**Submission**
- [ ] Public GitHub repository
- [ ] Live deployed application link
- [ ] Short README with setup instructions and key decisions
- [ ] Optional demo video (skip unless time permits)

**Evaluation criteria** (these drive every decision below)
functionality · code quality · UI clarity · database & API design · AI integration · documentation · ability to explain choices

---

## 2. Tech stack & key decisions

| Layer | Choice | Why (this is the "explain your choices" part) |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript + Tailwind CSS** | The JD explicitly says React & Next.js. Tailwind gives a clean responsive UI fast. |
| Backend | **Python FastAPI** | The JD explicitly says FastAPI. Auto OpenAPI docs at `/docs` show API design for free. |
| Database | **SQLite via SQLAlchemy ORM** | Explicitly allowed by the assignment. Zero-config, single file, perfect for a demo. SQLAlchemy keeps the code portable — switching to PostgreSQL is a one-line `DATABASE_URL` change (Even8's own stack), and that's documented. |
| AI layer | **OpenAI-compatible API with a deterministic offline fallback** | `OPENAI_API_KEY` (and optional `OPENAI_BASE_URL`) → real LLM. **No key? The app still fully works** — a built-in heuristic summarizer + template-based follow-up drafter takes over. Reviewers can run the demo with zero setup, and the LLM path is production-shaped (async, timeouts, error handling). |
| Validation | **Pydantic v2 schemas on every endpoint** | FastAPI-native; makes the API design self-documenting. |

---

## 3. Architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│  Next.js frontend       │  HTTP  │  FastAPI backend         │
│  (port 3000)            │ ─────► │  (port 8000)             │
│                         │  JSON  │                          │
│  - Leads table/cards    │        │  /api/leads CRUD         │
│  - Add/Edit modal       │        │  /api/leads search+filter│
│  - Search + filter bar  │        │  /api/ai/summarize       │
│  - AI panels (per lead) │        │  /api/ai/followup        │
│  - Stats header         │        │        │                 │
└─────────────────────────┘        │        ▼                 │
                                   │  SQLite (leads.db)       │
                                   │  + AI service            │
                                   │    (LLM or fallback)     │
                                   └──────────────────────────┘
```

CORS enabled for localhost:3000 during dev. In production the frontend calls one configurable `NEXT_PUBLIC_API_URL`.

---

## 4. Data model

Single table `leads` (YAGNI — one entity is all the assignment needs; done well beats done big):

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, autoincrement |
| name | VARCHAR(120) | NOT NULL |
| company | VARCHAR(120) | NOT NULL |
| email | VARCHAR(200) | NOT NULL, validated by Pydantic `EmailStr` |
| event_name | VARCHAR(160) | NOT NULL |
| notes | TEXT | default '' |
| status | VARCHAR(20) | one of: `new`, `contacted`, `meeting_booked`, `closed` (default `new`) |
| ai_summary | TEXT | nullable — cached AI output |
| created_at | DATETIME | server default utcnow |
| updated_at | DATETIME | auto-updates on edit |

Follow-up status lifecycle: **new → contacted → meeting_booked → closed** — matches how a sales/team member actually works a lead after an event.

---

## 5. API design (REST, JSON)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness + which AI mode is active (llm / fallback) |
| GET | `/api/leads?search=&event=&status=&sort=` | List with search + filters (search hits name/company/email/notes) |
| POST | `/api/leads` | Create (validated) |
| GET | `/api/leads/{id}` | Detail |
| PUT | `/api/leads/{id}` | Full update (edit) |
| DELETE | `/api/leads/{id}` | Delete |
| POST | `/api/leads/{id}/summary` | AI: summarize the lead's notes → saved to `ai_summary` |
| POST | `/api/leads/{id}/followup` | AI: draft a follow-up message → returned (tone option) |
| GET | `/api/meta/events` | Distinct event names (for filter dropdown) |

Errors: `422` for validation, `404` for missing lead, `502` if the LLM call fails (frontend surfaces a friendly message).

---

## 6. UI plan (clean + responsive)

- **Header:** app name + small stats strip (total leads, per-status counts).
- **Toolbar:** free-text search box, status filter chips, event dropdown, "+ Add Lead" button.
- **Lead list:** table on desktop → card layout on mobile (Tailwind responsive classes). Each row: name, company, email, event, status badge, quick actions (edit, delete, AI).
- **Add/Edit:** one modal form, inline validation, status select.
- **AI drawer/section per lead:** two tabs — *Summary* (button → generates & caches) and *Follow-up draft* (button → editable textarea + copy button). Clearly labeled which mode produced it (LLM vs offline fallback) — honest AI UX.
- Delete asks for confirmation. Empty states + loading states included.

## 7. AI integration detail

`backend/app/services/ai.py` — one service, two implementations behind one interface:
1. **LLM mode:** async call to OpenAI-compatible `/chat/completions`, model from env (`AI_MODEL`, default `gpt-4o-mini`), 20s timeout, JSON-ish structured prompts (system prompt constrains output; asks for ≤3 bullet summary / ≤120-word email).
2. **Fallback mode (no key):** extractive summary (top sentences by keyword score) + structured follow-up email template (references event, company, a note fragment, and a proposed next step). Deterministic, instant, works offline.

Both endpoints always respond — the `source: "llm" | "fallback"` field tells the UI what produced it.

---

## 8. Repository structure

```
Even8_Assignment/
├── PLAN.md                ← this file (how & what)
├── README.md              ← submission README (setup + key decisions)
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, CORS, routers
│   │   ├── models.py      # SQLAlchemy model
│   │   ├── schemas.py     # Pydantic request/response
│   │   ├── database.py    # engine/session
│   │   ├── crud.py        # DB operations
│   │   └── routers/       # leads.py, ai.py, meta.py
│   │   └── services/ai.py # LLM + fallback
│   ├── seed.py            # demo data so the app isn't empty on first run
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/app/…          # Next.js App Router pages
│   ├── src/components/…   # LeadsTable, LeadModal, AiPanel, Filters…
│   ├── src/lib/api.ts     # typed API client
│   └── .env.local.example
└── .gitignore
```

## 9. Order of work

1. Backend skeleton: DB, model, schemas, CRUD endpoints + search/filter → verify with curl
2. AI service (LLM + fallback) + AI endpoints → verify both modes
3. Seed script for realistic demo data
4. Frontend: API client, layout, leads table, filters/search, add/edit modal, delete
5. Frontend: AI panel (summary + follow-up draft + copy)
6. Polish: loading/empty/error states, responsive pass
7. End-to-end test in browser (via dev servers), fix issues
8. README.md (setup, decisions, API table, deployment)
9. Deployment prep (configs + instructions — Vercel for frontend, Render/Railway for backend; actual deploy needs your accounts, so you'll run 2 commands)

## 10. Out of scope (deliberately)

Auth/users, file uploads, CSV import, pagination (small dataset), real-time, tests beyond a smoke script — the assignment explicitly rewards *clear decisions and a working product* over feature count. Each of these would be the first thing I'd add in the real role, and the README says so.

---

*Plan written before implementation, per assignment workflow. Decisions above are the "key decisions" section of the README in long form.*
