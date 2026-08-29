from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.rag.vector_service import VectorService
from app.services.ingestion_service import PDFIngestionService


# ============================================================
# DOCUMENT ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


# ============================================================
# SERVICES
# ============================================================

ingestion_service = PDFIngestionService()

vector_service = VectorService()


# ============================================================
# UPLOAD PDF
# ============================================================

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):
    """
    Upload and index a PDF document.

    Flow:

    PDF
      ↓
    Temporary file
      ↓
    PDF ingestion
      ↓
    Chunking
      ↓
    Gemini embeddings
      ↓
    ChromaDB
    """

    # --------------------------------------------------------
    # 1. Validate filename
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="A file must be provided.",
        )

    filename = Path(
        file.filename
    ).name

    # --------------------------------------------------------
    # 2. Validate extension
    # --------------------------------------------------------

    if Path(filename).suffix.lower() != ".pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    temporary_path = None

    try:

        # ----------------------------------------------------
        # 3. Read uploaded file
        # ----------------------------------------------------

        file_content = await file.read()

        if not file_content:

            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty.",
            )

        # ----------------------------------------------------
        # 4. Handle existing document
        # ----------------------------------------------------
        #
        # If the same PDF name already exists,
        # remove the previous indexed version.
        #
        # This allows safe re-uploading.
        # ----------------------------------------------------

        existing_documents = (
            vector_service.list_documents()
        )

        existing_source = any(
            document["source"] == filename
            for document in existing_documents
        )

        if existing_source:

            vector_service.delete_document(
                filename
            )

        # ----------------------------------------------------
        # 5. Save temporary PDF
        # ----------------------------------------------------

        with NamedTemporaryFile(
            suffix=".pdf",
            delete=False,
        ) as temporary_file:

            temporary_file.write(
                file_content
            )

            temporary_path = (
                temporary_file.name
            )

        # ----------------------------------------------------
        # 6. Run ingestion pipeline
        # ----------------------------------------------------

        chunks = ingestion_service.ingest_pdf(
            temporary_path
        )

        # ----------------------------------------------------
        # 7. Restore original filename
        # ----------------------------------------------------

        for chunk in chunks:

            chunk.metadata["source"] = (
                filename
            )

        # ----------------------------------------------------
        # 8. Store vectors
        # ----------------------------------------------------

        vector_service.add_documents(
            chunks
        )

        # ----------------------------------------------------
        # 9. Return result
        # ----------------------------------------------------

        return {
            "message": (
                "Document uploaded and "
                "indexed successfully."
            ),
            "source": filename,
            "chunks": len(chunks),
            "status": "indexed",
        }

    except HTTPException:
        raise

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Document indexing failed: {exc}"
            ),
        ) from exc

    finally:

        # ----------------------------------------------------
        # 10. Remove temporary file
        # ----------------------------------------------------

        if temporary_path:

            temporary_file_path = Path(
                temporary_path
            )

            if temporary_file_path.exists():

                temporary_file_path.unlink()


# ============================================================
# LIST DOCUMENTS
# ============================================================

@router.get("")
def list_documents():
    """
    Return all documents currently indexed in ChromaDB.
    """

    try:

        documents = (
            vector_service.list_documents()
        )

        return {
            "documents": documents,
            "count": len(documents),
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to list documents: {exc}"
            ),
        ) from exc


# ============================================================
# VECTOR COUNT
# ============================================================

@router.get("/stats")
def document_stats():
    """
    Return vector database statistics.
    """

    try:

        count = (
            vector_service.get_collection_count()
        )

        documents = (
            vector_service.list_documents()
        )

        return {
            "documents": len(documents),
            "vectors": count,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to retrieve statistics: {exc}"
            ),
        ) from exc


# ============================================================
# DELETE DOCUMENT
# ============================================================

@router.delete("/{source}")
def delete_document(
    source: str
):
    """
    Delete a document and all of its chunks
    from ChromaDB.
    """

    try:

        deleted_chunks = (
            vector_service.delete_document(
                source
            )
        )

        if deleted_chunks == 0:

            raise HTTPException(
                status_code=404,
                detail=(
                    f"Document '{source}' "
                    "was not found."
                ),
            )

        return {
            "message": (
                "Document deleted successfully."
            ),
            "source": source,
            "deleted_chunks": deleted_chunks,
            "status": "deleted",
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Document deletion failed: {exc}"
            ),
        ) from exc