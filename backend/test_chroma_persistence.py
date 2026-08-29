from app.rag.vector_service import VectorService


def main():
    vector_service = VectorService()

    count = vector_service.get_collection_count()

    print("ChromaDB persistence test")
    print("-------------------------")
    print(f"Vectors found after restart: {count}")

    if count > 0:
        print("Persistence test passed.")
    else:
        print("Persistence test failed.")


if __name__ == "__main__":
    main()