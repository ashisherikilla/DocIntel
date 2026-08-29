from pathlib import Path

from google import genai
from google.genai import types

from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_chroma import Chroma

from app.core.config import GEMINI_API_KEY


# ============================================================
# GEMINI EMBEDDINGS
# ============================================================

class GeminiEmbeddings(Embeddings):
    """
    LangChain-compatible embedding adapter for Gemini.
    """

    MODEL_NAME = "gemini-embedding-001"
    OUTPUT_DIMENSIONALITY = 768

    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key
        )

    # ========================================================
    # DOCUMENT EMBEDDINGS
    # ========================================================

    def embed_documents(
        self,
        texts: list[str]
    ) -> list[list[float]]:
        """
        Generate embeddings for document chunks.
        """

        if not texts:
            return []

        response = self.client.models.embed_content(
            model=self.MODEL_NAME,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=self.OUTPUT_DIMENSIONALITY,
            ),
        )

        return [
            embedding.values
            for embedding in response.embeddings
        ]

    # ========================================================
    # QUERY EMBEDDING
    # ========================================================

    def embed_query(
        self,
        text: str
    ) -> list[float]:
        """
        Generate an embedding for a user query.
        """

        response = self.client.models.embed_content(
            model=self.MODEL_NAME,
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=self.OUTPUT_DIMENSIONALITY,
            ),
        )

        return response.embeddings[0].values


# ============================================================
# VECTOR SERVICE
# ============================================================

class VectorService:
    """
    Handles Gemini embedding generation and persistent
    ChromaDB storage.

    Responsibilities:

    1. Generate document embeddings.
    2. Store document chunks in ChromaDB.
    3. Retrieve collection statistics.
    4. List indexed documents.
    5. Delete documents.
    """

    COLLECTION_NAME = "docintel_documents"

    def __init__(self):

        # ----------------------------------------------------
        # Persistent ChromaDB directory
        # ----------------------------------------------------

        self.persist_directory = (
            Path(__file__).resolve().parents[2]
            / "data"
            / "chroma"
        )

        self.persist_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        # ----------------------------------------------------
        # Gemini embeddings
        # ----------------------------------------------------

        self.embeddings = GeminiEmbeddings(
            api_key=GEMINI_API_KEY
        )

        # ----------------------------------------------------
        # ChromaDB
        # ----------------------------------------------------

        self.vector_store = Chroma(
            collection_name=self.COLLECTION_NAME,
            embedding_function=self.embeddings,
            persist_directory=str(
                self.persist_directory
            ),
        )

    # ========================================================
    # ADD DOCUMENTS
    # ========================================================

    def add_documents(
        self,
        chunks: list[Document]
    ) -> None:
        """
        Generate embeddings for document chunks and store
        them in ChromaDB.
        """

        if not chunks:
            raise ValueError(
                "No document chunks provided."
            )

        ids = []

        for chunk in chunks:

            source = chunk.metadata.get(
                "source",
                "unknown"
            )

            chunk_id = chunk.metadata.get(
                "chunk_id",
                0
            )

            document_id = (
                f"{source}_{chunk_id}"
            )

            ids.append(
                document_id
            )

        self.vector_store.add_documents(
            documents=chunks,
            ids=ids,
        )

    # ========================================================
    # COLLECTION COUNT
    # ========================================================

    def get_collection_count(self) -> int:
        """
        Return the total number of stored vectors.
        """

        return self.vector_store._collection.count()

    # ========================================================
    # LIST DOCUMENTS
    # ========================================================

    def list_documents(self) -> list[dict]:
        """
        Return a unique list of indexed PDF documents.

        Example:

        [
            {
                "source": "sample.pdf",
                "chunks": 4
            }
        ]
        """

        collection_data = (
            self.vector_store._collection.get(
                include=["metadatas"]
            )
        )

        metadatas = (
            collection_data.get(
                "metadatas",
                []
            )
        )

        documents = {}

        for metadata in metadatas:

            if not metadata:
                continue

            source = metadata.get(
                "source"
            )

            if not source:
                continue

            if source not in documents:

                documents[source] = {
                    "source": source,
                    "chunks": 0,
                }

            documents[source]["chunks"] += 1

        return list(
            documents.values()
        )

    # ========================================================
    # DELETE DOCUMENT
    # ========================================================

    def delete_document(
        self,
        source: str
    ) -> int:
        """
        Delete all chunks belonging to a document.

        Returns:
            Number of deleted chunks.
        """

        if not source or not source.strip():
            raise ValueError(
                "Document source cannot be empty."
            )

        source = source.strip()

        collection_data = (
            self.vector_store._collection.get(
                where={
                    "source": source
                },
                include=["metadatas"]
            )
        )

        ids = collection_data.get(
            "ids",
            []
        )

        if not ids:
            return 0

        self.vector_store._collection.delete(
            ids=ids
        )

        return len(ids)