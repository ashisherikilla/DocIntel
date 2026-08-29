from app.services.ingestion_service import PDFIngestionService
from app.rag.vector_service import VectorService


def main():
    pdf_path = "sample.pdf"

    ingestion_service = PDFIngestionService()
    chunks = ingestion_service.ingest_pdf(pdf_path)

    print(f"Total chunks from Phase 1: {len(chunks)}")

    vector_service = VectorService()
    vector_service.add_documents(chunks)

    count = vector_service.get_collection_count()

    print(f"Vectors stored in ChromaDB: {count}")
    print("Vector storage test completed successfully.")


if __name__ == "__main__":
    main()