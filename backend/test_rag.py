from app.rag.rag_service import RAGService


def print_result(title: str, result: dict):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)

    print("\nANSWER:")
    print(result["answer"])

    print("\nSOURCES:")

    for source in result["sources"]:
        print(
            f"- {source['source']} | "
            f"Page {source['page']} | "
            f"Chunk {source['chunk_id']}"
        )

    print("\nRETRIEVED CHUNKS:")

    for index, chunk in enumerate(
        result["chunks"],
        start=1,
    ):
        print(f"\n--- Chunk {index} ---")

        print(
            f"Source: {chunk['source']}\n"
            f"Page: {chunk['page']}\n"
            f"Chunk ID: {chunk['chunk_id']}"
        )

        print("\nContent:")
        print(chunk["content"])


def main():

    rag = RAGService(k=3)

    # --------------------------------------------------
    # TEST A
    # Answer should exist in sample.pdf
    # --------------------------------------------------

    question_1 = (
        "What technical skills are required "
        "for this position?"
    )

    result_1 = rag.ask(question_1)

    print_result(
        "TEST A — ANSWER EXISTS",
        result_1,
    )

    # --------------------------------------------------
    # TEST B
    # Answer should NOT exist in sample.pdf
    # --------------------------------------------------

    question_2 = (
        "What is the company's annual leave policy?"
    )

    result_2 = rag.ask(question_2)

    print_result(
        "TEST B — ANSWER DOES NOT EXIST",
        result_2,
    )


if __name__ == "__main__":
    main()