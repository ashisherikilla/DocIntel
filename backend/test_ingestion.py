from app.services.ingestion_service import PDFIngestionService


PDF_PATH = "sample.pdf"


def main():
    service = PDFIngestionService(
        chunk_size=1000,
        chunk_overlap=200,
    )

    try:
        chunks = service.ingest_pdf(PDF_PATH)

        print(f"\nTotal chunks: {len(chunks)}")

        for chunk in chunks:
            print("\n" + "=" * 70)

            print(f"Chunk ID : {chunk.metadata['chunk_id']}")
            print(f"Source   : {chunk.metadata['source']}")
            print(f"Page     : {chunk.metadata['page']}")

            print("\nContent:")
            print(chunk.page_content)

        print("\n" + "=" * 70)
        print("Ingestion test completed successfully.")

    except Exception as exc:
        print(f"\nIngestion failed: {exc}")


if __name__ == "__main__":
    main()