import os
from typing import Any

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

from app.rag.retrieval_service import RetrievalService


# Load environment variables from backend/.env
load_dotenv()


class RAGService:
    """
    Core Retrieval-Augmented Generation service.

    Responsibilities:
    1. Retrieve relevant document chunks.
    2. Construct context from retrieved chunks.
    3. Build a grounded RAG prompt.
    4. Send the prompt to the Gemini LLM.
    5. Extract a clean text answer.
    6. Return the answer together with source metadata.
    """

    def __init__(self, k: int = 3):
        """
        Initialize the RAG service.

        Args:
            k: Number of document chunks to retrieve.
        """

        if k <= 0:
            raise ValueError("k must be greater than zero.")

        self.k = k

        # --------------------------------------------------------
        # Retrieval layer
        # --------------------------------------------------------

        self.retrieval_service = RetrievalService()

        # --------------------------------------------------------
        # Gemini API configuration
        # --------------------------------------------------------

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Please check backend/.env."
            )

        # --------------------------------------------------------
        # Gemini LLM
        # --------------------------------------------------------

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.6-flash",
            google_api_key=api_key,
        )

    # ============================================================
    # RESPONSE EXTRACTION
    # ============================================================

    def extract_answer(self, response: Any) -> str:
        """
        Normalize the Gemini/LangChain response into plain text.

        Depending on the installed LangChain/Gemini version,
        response.content may be:

        1. A plain string
        2. A list of structured content blocks
        """

        content = response.content

        # --------------------------------------------------------
        # Case 1: Plain string
        # --------------------------------------------------------

        if isinstance(content, str):
            return content.strip()

        # --------------------------------------------------------
        # Case 2: Structured content blocks
        # --------------------------------------------------------

        if isinstance(content, list):

            text_parts = []

            for block in content:

                # Example:
                # "generated text"
                if isinstance(block, str):
                    text_parts.append(block)

                # Example:
                # {
                #     "type": "text",
                #     "text": "generated text"
                # }
                elif isinstance(block, dict):

                    if block.get("type") == "text":

                        text = block.get("text")

                        if text:
                            text_parts.append(text)

            return "\n".join(text_parts).strip()

        # --------------------------------------------------------
        # Fallback
        # --------------------------------------------------------

        return str(content).strip()

    # ============================================================
    # CONTEXT CONSTRUCTION
    # ============================================================

    def build_context(self, documents) -> str:
        """
        Construct the context supplied to the LLM.

        Each retrieved LangChain Document contains:

        page_content

        and metadata:

        source
        page
        chunk_id
        """

        context_parts = []

        for index, document in enumerate(documents, start=1):

            source = document.metadata.get(
                "source",
                "Unknown source"
            )

            page = document.metadata.get(
                "page",
                "Unknown page"
            )

            chunk_id = document.metadata.get(
                "chunk_id",
                "Unknown chunk"
            )

            content = document.page_content.strip()

            context_parts.append(
                f"""
--- Retrieved Chunk {index} ---
Source: {source}
Page: {page}
Chunk ID: {chunk_id}

Content:
{content}
""".strip()
            )

        return "\n\n".join(context_parts)

    # ============================================================
    # PROMPT CONSTRUCTION
    # ============================================================

    def build_prompt(
        self,
        question: str,
        context: str,
    ) -> str:
        """
        Build the grounded RAG prompt.

        The LLM is explicitly instructed to answer ONLY
        from the supplied document context.
        """

        return f"""
You are DocIntel, a document question-answering assistant.

Your task is to answer the user's question using ONLY the
information contained in the provided document context.

IMPORTANT RULES:

1. Use only the supplied document context.
2. Do not use outside knowledge.
3. Do not invent information.
4. Do not make assumptions.
5. Do not make unsupported claims.
6. If the answer cannot be found in the supplied context,
   respond exactly with:

The information was not found in the provided documents.

7. Give a concise and direct answer.
8. If multiple retrieved chunks contain relevant information,
   combine them carefully.
9. Do not mention information that is not supported by the
   supplied context.

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{question}

ANSWER:
""".strip()

    # ============================================================
    # SOURCE EXTRACTION
    # ============================================================

    def extract_sources(self, documents) -> list[dict]:
        """
        Extract source metadata from retrieved documents.

        Sources are associated with a successful grounded answer.
        """

        sources = []

        seen = set()

        for document in documents:

            source = document.metadata.get(
                "source",
                "Unknown source"
            )

            page = document.metadata.get(
                "page",
                "Unknown page"
            )

            chunk_id = document.metadata.get(
                "chunk_id",
                "Unknown chunk"
            )

            source_key = (
                source,
                page,
                chunk_id,
            )

            if source_key in seen:
                continue

            seen.add(source_key)

            sources.append(
                {
                    "source": source,
                    "page": page,
                    "chunk_id": chunk_id,
                }
            )

        return sources

    # ============================================================
    # CHUNK EXTRACTION
    # ============================================================

    def extract_chunks(self, documents) -> list[dict]:
        """
        Convert retrieved LangChain Documents into a
        clean serializable structure.

        These are the actual chunks returned by
        semantic similarity search.
        """

        chunks = []

        for document in documents:

            chunks.append(
                {
                    "content": document.page_content,
                    "source": document.metadata.get(
                        "source"
                    ),
                    "page": document.metadata.get(
                        "page"
                    ),
                    "chunk_id": document.metadata.get(
                        "chunk_id"
                    ),
                }
            )

        return chunks

    # ============================================================
    # MAIN RAG PIPELINE
    # ============================================================

    def ask(self, question: str) -> dict:
        """
        Execute the complete RAG pipeline.

        Flow:

        User Question
             ↓
        Query Embedding
             ↓
        ChromaDB Similarity Search
             ↓
        Top-K Documents
             ↓
        Context Construction
             ↓
        Grounded RAG Prompt
             ↓
        Gemini LLM
             ↓
        Generated Answer
             ↓
        Sources + Retrieved Chunks
        """

        # --------------------------------------------------------
        # 1. Validate question
        # --------------------------------------------------------

        if not question or not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        question = question.strip()

        # --------------------------------------------------------
        # 2. Retrieve relevant chunks
        # --------------------------------------------------------

        documents = self.retrieval_service.search(
            question,
            k=self.k,
        )

        # --------------------------------------------------------
        # 3. Handle no retrieved documents
        # --------------------------------------------------------

        if not documents:

            return {
                "answer": (
                    "The information was not found "
                    "in the provided documents."
                ),
                "sources": [],
                "chunks": [],
            }

        # --------------------------------------------------------
        # 4. Construct context
        # --------------------------------------------------------

        context = self.build_context(
            documents
        )

        # --------------------------------------------------------
        # 5. Construct grounded prompt
        # --------------------------------------------------------

        prompt = self.build_prompt(
            question=question,
            context=context,
        )

        # --------------------------------------------------------
        # 6. Generate answer using Gemini
        # --------------------------------------------------------

        response = self.llm.invoke(
            prompt
        )

        # --------------------------------------------------------
        # 7. Normalize Gemini response
        # --------------------------------------------------------

        answer = self.extract_answer(
            response
        )

        # --------------------------------------------------------
        # 8. Detect grounded "not found" response
        # --------------------------------------------------------

        not_found_message = (
            "The information was not found "
            "in the provided documents."
        )

        if not_found_message.lower() in answer.lower():

            return {
                "answer": not_found_message,
                "sources": [],
                "chunks": self.extract_chunks(
                    documents
                ),
            }

        # --------------------------------------------------------
        # 9. Extract sources
        # --------------------------------------------------------

        sources = self.extract_sources(
            documents
        )

        # --------------------------------------------------------
        # 10. Return final RAG response
        # --------------------------------------------------------

        return {
            "answer": answer,
            "sources": sources,
            "chunks": self.extract_chunks(
                documents
            ),
        }