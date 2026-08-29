import { useRef, useState } from "react"
import { uploadDocument } from "../api/api"

function UploadPanel({ onUploadSuccess }) {
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const validateFile = (file) => {
    if (!file) {
      return false
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      setErrorMessage("Only PDF files can be uploaded.")
      setSelectedFile(null)
      return false
    }

    setErrorMessage("")
    return true
  }

  const handleFileSelect = (file) => {
    setSuccessMessage("")
    setErrorMessage("")
    setProgress(0)

    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      handleFileSelect(file)
    }

    event.target.value = ""
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleBrowse = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return
    }

    setIsUploading(true)
    setProgress(0)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const result = await uploadDocument(
        selectedFile,
        (event) => {
          if (event.total) {
            const percentage = Math.round(
              (event.loaded * 100) / event.total
            )

            setProgress(percentage)
          }
        }
      )

      setProgress(100)

      setSuccessMessage(
        `${result.source || selectedFile.name} indexed successfully. ${
          result.chunks ?? 0
        } chunks created.`
      )

      setSelectedFile(null)

      if (onUploadSuccess) {
        await onUploadSuccess(result)
      }
    } catch (error) {
      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message

      setErrorMessage(
        backendMessage ||
          "Unable to upload the document. Please try again."
      )
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB"
    }

    const megabytes = bytes / (1024 * 1024)

    if (megabytes >= 1) {
      return `${megabytes.toFixed(2)} MB`
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={handleBrowse}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex min-h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition ${
            isDragging
              ? "border-white/40 bg-white/[0.06]"
              : "border-white/15 bg-black/20 hover:border-white/25 hover:bg-white/[0.025]"
          }`}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <svg
              className="h-5 w-5 text-zinc-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"
              />
            </svg>
          </div>

          <p className="text-sm font-medium text-zinc-200">
            {isDragging
              ? "Drop your PDF here"
              : "Drop your PDF here"}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            or choose a file from your device
          </p>

          <span className="mt-5 rounded-lg border border-white/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
            Browse files
          </span>

          <p className="mt-4 text-[11px] text-zinc-600">
            PDF files only
          </p>
        </button>
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-start gap-4">
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
              <p className="truncate text-sm font-medium text-zinc-200">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatFileSize(selectedFile.size)} · PDF
              </p>
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  setProgress(0)
                  setErrorMessage("")
                  setSuccessMessage("")
                }}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                aria-label="Remove selected file"
              >
                ×
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {progress < 100
                    ? "Uploading document..."
                    : "Processing document..."}
                </span>

                <span className="text-zinc-500">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-zinc-600">
                Extracting, chunking, embedding, and indexing
                your document.
              </p>
            </div>
          )}

          {!isUploading && (
            <button
              type="button"
              onClick={handleUpload}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Index document
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <p className="text-xs leading-5 text-emerald-300">
            ✓ {successMessage}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
          <p className="text-xs leading-5 text-red-300">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  )
}

export default UploadPanel