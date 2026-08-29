from app.rag.retrieval_service import RetrievalService


def print_results(question: str, results):
    print("\n" + "=" * 70)
    print(f"QUESTION: {question}")
    print("=" * 70)

    for index, result in enumerate(results, start=1):
        print(f"\nResult {index}")
        print("-" * 40)

        print("Source:", result.metadata.get("source"))
        print("Page:", result.metadata.get("page"))
        print("Chunk ID:", result.metadata.get("chunk_id"))

        print("\nText:")
        print(result.page_content)


def main():
    retrieval_service = RetrievalService()

    questions = [
        "What technical skills are required for this position?",
        "What programming and software engineering knowledge should the candidate have?",
        "What development tools and engineering practices are expected?",
    ]

    for question in questions:
        results = retrieval_service.search(
            query=question,
            k=3,
        )

        print_results(question, results)


if __name__ == "__main__":
    main()