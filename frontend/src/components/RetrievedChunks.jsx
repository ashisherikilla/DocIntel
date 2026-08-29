import { useState } from "react"

function RetrievedChunks({ chunks = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!chunks.length) {
    return null
  }

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <div>
          <p className="text-sm font-medium text-zinc-300">
            View retrieved context
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            {chunks.length} retrieved knowledge{" "}
            {chunks.length === 1 ? "chunk" : "chunks"}
          </p>
        </div>

        <span className="text-zinc-500">
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-white/10 p-4">
          <div className="space-y-4">
            {chunks.map((chunk, index) => (
              <div
                key={`${chunk?.chunk_id ?? index}-${index}`}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  {chunk?.source && (
                    <span className="text-[10px] text-zinc-500">
                      {chunk.source}
                    </span>
                  )}

                  {chunk?.page !== undefined && (
                    <span className="text-[10px] text-zinc-600">
                      Page {chunk.page}
                    </span>
                  )}

                  {chunk?.chunk_id !== undefined && (
                    <span className="text-[10px] text-zinc-600">
                      Chunk {chunk.chunk_id}
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-xs leading-6 text-zinc-500">
                  {chunk?.content || "No content available."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RetrievedChunks