function SourceCard({ source }) {
  const sourceName =
    source?.source ||
    source?.filename ||
    source?.name ||
    "Unknown document"

  const page = source?.page
  const chunkId = source?.chunk_id ?? source?.chunkId

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/5">
          <svg
            className="h-4 w-4 text-red-300"
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
            title={sourceName}
          >
            {sourceName}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {page !== undefined && (
              <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-500">
                Page {page}
              </span>
            )}

            {chunkId !== undefined && (
              <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-500">
                Chunk {chunkId}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourceCard