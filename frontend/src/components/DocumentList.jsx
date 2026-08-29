import { useState } from "react"
import { deleteDocument } from "../api/api"

function DocumentList({
  documents = [],
  onDocumentsChange,
}) {
  const [deletingSource, setDeletingSource] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [confirmSource, setConfirmSource] = useState(null)

  const handleDeleteRequest = (source) => {
    if (!source || deletingSource) {
      return
    }

    setErrorMessage("")
    setConfirmSource(source)
  }

  const handleDelete = async () => {
    if (!confirmSource || deletingSource) {
      return
    }

    const source = confirmSource

    try {
      setDeletingSource(source)
      setErrorMessage("")

      await deleteDocument(source)

      setConfirmSource(null)

      if (onDocumentsChange) {
        await onDocumentsChange()
      }
    } catch (error) {
      console.error(
        "Failed to delete document:",
        error
      )

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to delete the document. Please try again."
      )
    } finally {
      setDeletingSource(null)
    }
  }

  if (!documents.length) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-white/5 bg-black/20 px-6 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <svg
            className="h-5 w-5 text-zinc-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 3h7l4 4v14H7V3Z"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 3v5h5"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-zinc-300">
          No documents indexed yet
        </p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-600">
          Upload a PDF to create your first searchable
          document.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((document, index) => {
          const source =
            document.source ||
            document.name ||
            document.filename ||
            `Document ${index + 1}`

          const chunks =
            document.chunks ??
            document.chunk_count ??
            document.chunkCount ??
            0

          const isDeleting =
            deletingSource === source

          return (
            <div
              key={`${source}-${index}`}
              className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-white/15"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/5">
                  <svg
                    className="h-5 w-5 text-red-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 3h7l4 4v14H7V3Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 3v5h5"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-zinc-200"
                    title={source}
                  >
                    {source}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-zinc-500">
                      {chunks} chunks
                    </span>

                    <span className="text-zinc-700">
                      •
                    </span>

                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Indexed
                    </span>
                  </div>
                </div>

                <span className="hidden rounded-lg border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-medium text-emerald-300 sm:inline-flex">
                  Ready
                </span>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    handleDeleteRequest(source)
                  }
                  className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>

              {confirmSource === source && (
                <div className="mt-4 rounded-lg border border-red-400/10 bg-red-400/[0.03] p-3">
                  <p className="text-xs text-zinc-400">
                    Remove this document and its indexed
                    chunks from DocIntel?
                  </p>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmSource(null)
                      }
                      disabled={isDeleting}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="rounded-lg bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/15 disabled:opacity-50"
                    >
                      {isDeleting
                        ? "Removing..."
                        : "Confirm delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {errorMessage && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2">
            <p className="text-xs text-red-300">
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default DocumentList