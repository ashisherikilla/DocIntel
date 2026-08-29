from langchain_core.documents import Document

from app.rag.vector_service import VectorService


class RetrievalService:
    """
    Performs semantic similarity search over the DocIntel
    ChromaDB vector store.
    """

    def __init__(self):
        self.vector_service = VectorService()

    def search(
        self,
        query: str,
        k: int = 3,
    ) -> list[Document]:
        """
        Return the top-k most relevant document chunks.
        """

        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")

        if k <= 0:
            raise ValueError("k must be greater than zero.")

        results = self.vector_service.vector_store.similarity_search(
            query,
            k=k,
        )

        return results