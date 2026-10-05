import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import ai, leads, meta
from .schemas import HealthOut
from .services import ai as ai_service

load_dotenv()

app = FastAPI(
    title="Even8 Lead Manager API",
    description="Backend for the AI Event Lead Manager assignment.",
    version="1.0.0",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in frontend_origin.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(ai.router)
app.include_router(meta.router)


@app.get("/api/health", response_model=HealthOut, tags=["meta"])
def health():
    return HealthOut(status="ok", ai_mode=ai_service.ai_mode())


Base.metadata.create_all(bind=engine)
