from app.rag.retrieval_service import RetrievalService
from app.rag.vector_service import VectorService


def main():
    print("=" * 70)
    print("DOCINTEL PHASE 2 VERIFICATION")
    print("=" * 70)

    # ---------------------------------------------------------
    # 1. Verify ChromaDB persistence
    # ---------------------------------------------------------

    vector_service = VectorService()

    count = vector_service.get_collection_count()

    print(f"\nStored vectors: {count}")

    if count == 0:
        print("FAIL: No vectors found in ChromaDB.")
        return

    print("PASS: Persistent vectors found.")

    # ---------------------------------------------------------
    # 2. Semantic retrieval test
    # ---------------------------------------------------------

    retrieval_service = RetrievalService()

    questions = [
        "What technical abilities does this engineer need?",
        "What programming knowledge should the candidate possess?",
        "What engineering practices are expected from the candidate?",
    ]

    for number, question in enumerate(questions, start=1):

        print("\n" + "-" * 70)
        print(f"TEST {number}")
        print(f"Question: {question}")
        print("-" * 70)

        results = retrieval_service.search(
            query=question,
            k=3,
        )

        if not results:
            print("FAIL: No results returned.")
            continue

        print(f"Retrieved chunks: {len(results)}")

        for index, result in enumerate(results, start=1):

            source = result.metadata.get("source")
            page = result.metadata.get("page")
            chunk_id = result.metadata.get("chunk_id")

            print(f"\nResult {index}")
            print(f"Source: {source}")
            print(f"Page: {page}")
            print(f"Chunk ID: {chunk_id}")
            print(f"Text preview: {result.page_content[:150]}...")

            if source and page and chunk_id is not None:
                print("Metadata: PASS")
            else:
                print("Metadata: FAIL")

    print("\n" + "=" * 70)
    print("PHASE 2 VERIFICATION COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()