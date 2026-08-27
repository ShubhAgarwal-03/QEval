import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import init_db, SessionLocal
from app.repositories.question_repo import seed_questions_if_empty
from app.api.routes_assessment import router as assessment_router
from app.api.routes_answer import router as answer_router
from app.api.routes_admin import router as admin_router

settings = get_settings()
logging.basicConfig(level=settings.log_level)

app = FastAPI(
    title="AI-Based Question Evaluation System",
    description="Backend for presenting predefined questions and evaluating "
    "free-text answers semantically via Gemini.",
    version="0.1.0",
)

# Origins come from ALLOWED_ORIGINS env var (comma-separated) - see .env.example.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessment_router)
app.include_router(answer_router)
app.include_router(admin_router)


@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        seed_questions_if_empty(db, settings.questions_seed_path)
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}