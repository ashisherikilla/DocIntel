from app.core.config import GEMINI_API_KEY
from app.rag.vector_service import GeminiEmbeddings


def main():
    embeddings = GeminiEmbeddings(GEMINI_API_KEY)

    text = "Strong software engineering fundamentals are required."

    vector = embeddings.embed_query(text)

    print("Embedding generated successfully.")
    print("Embedding dimensions:", len(vector))
    print("First 5 values:", vector[:5])


if __name__ == "__main__":
    main()