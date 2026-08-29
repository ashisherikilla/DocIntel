from pathlib import Path

from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class PDFIngestionService:
    """
    Handles PDF text extraction and chunking for DocIntel.
    """

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def extract_pages(self, pdf_path: str) -> list[Document]:
        """
        Extract text from a PDF page by page.
        """

        path = Path(pdf_path)

        if not path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        if path.suffix.lower() != ".pdf":
            raise ValueError("The provided file is not a PDF.")

        try:
            reader = PdfReader(str(path))
        except Exception as exc:
            raise ValueError(f"Unable to read PDF: {exc}") from exc

        if len(reader.pages) == 0:
            raise ValueError("The PDF contains no pages.")

        documents = []

        for page_number, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text() or ""
            except Exception:
                text = ""

            text = text.strip()

            # Ignore pages with no extractable text.
            if not text:
                continue

            documents.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": path.name,
                        "page": page_number,
                    },
                )
            )

        if not documents:
            raise ValueError(
                "No extractable text was found in the PDF."
            )

        return documents

    def split_documents(
        self,
        documents: list[Document],
    ) -> list[Document]:
        """
        Split page-level documents into smaller chunks.
        """

        chunks = self.text_splitter.split_documents(documents)

        for chunk_id, chunk in enumerate(chunks):
            chunk.metadata["chunk_id"] = chunk_id

        return chunks

    def ingest_pdf(self, pdf_path: str) -> list[Document]:
        """
        Complete PDF ingestion pipeline:
        PDF → pages → chunks.
        """

        pages = self.extract_pages(pdf_path)

        chunks = self.split_documents(pages)

        return chunks