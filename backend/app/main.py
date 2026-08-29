from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.documents import router as document_router

# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="DocIntel API",
    description="RAG-Powered Intelligent Document Analyst",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

# Allowed frontend origins.
#
# Local development:
#   http://localhost:5173
#   http://127.0.0.1:5173
#
# Production:
#   https://docintel-frontend-mocha.vercel.app
#
# The frontend communicates only with FastAPI.
# Gemini credentials remain server-side.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://docintel-rag-based.vercel.app",
        "https://docintel-irvc851bv-erikilla-ashishs-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(chat_router)

app.include_router(document_router)


# ============================================================
# HEALTH CHECK
# ============================================================


@app.get("/health")
def health_check():
    """
    Basic API health check.
    """

    return {
        "status": "healthy",
        "service": "DocIntel API",
    }
