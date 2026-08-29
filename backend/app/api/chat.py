from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rag.rag_service import RAGService


router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ChatRequest(BaseModel):
    """
    Request body for the chat endpoint.
    """

    question: str = Field(
        ...,
        min_length=1,
        description="Natural-language question about the documents.",
    )


# ============================================================
# RESPONSE MODEL
# ============================================================

class Source(BaseModel):
    """
    Source information associated with a grounded answer.
    """

    source: str
    page: int | str
    chunk_id: int | str


class RetrievedChunk(BaseModel):
    """
    A chunk returned by semantic retrieval.
    """

    content: str
    source: str | None
    page: int | None
    chunk_id: int | None


class ChatResponse(BaseModel):
    """
    Response returned by the RAG chat endpoint.
    """

    answer: str
    sources: list[Source]
    chunks: list[RetrievedChunk]


# ============================================================
# RAG SERVICE
# ============================================================

rag_service = RAGService(k=3)


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(request: ChatRequest):
    """
    Execute the complete DocIntel RAG pipeline.

    Flow:

    User Question
        ↓
    FastAPI
        ↓
    RAGService
        ↓
    RetrievalService
        ↓
    ChromaDB
        ↓
    Top-K Chunks
        ↓
    Context Construction
        ↓
    Gemini
        ↓
    Grounded Answer
        ↓
    JSON Response
    """

    try:

        result = rag_service.ask(
            request.question
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            f"RAG pipeline error: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An error occurred while "
                "processing the question."
            ),
        )