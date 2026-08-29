import { useState } from "react"
import { askQuestion } from "../api/api"

import AnswerCard from "./AnswerCard"
import SourceCard from "./SourceCard"
import RetrievedChunks from "./RetrievedChunks"

function ChatWindow({ hasDocuments = false }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState([])
  const [chunks, setChunks] = useState([])

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (event) => {
    event?.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isLoading) {
      return
    }

    if (!hasDocuments) {
      setErrorMessage(
        "Upload and index a document before asking a question."
      )
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    setAnswer("")
    setSources([])
    setChunks([])

    try {
      const result = await askQuestion(trimmedQuestion)

      setAnswer(result?.answer || "")

      setSources(
        Array.isArray(result?.sources)
          ? result.sources
          : []
      )

      setChunks(
        Array.isArray(result?.chunks)
          ? result.chunks
          : []
      )
    } catch (error) {
      console.error(
        "Failed to process question:",
        error
      )

      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.message

      setErrorMessage(
        backendMessage ||
          "Unable to process your question. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  const handleClear = () => {
    if (isLoading) {
      return
    }

    setQuestion("")
    setAnswer("")
    setSources([])
    setChunks([])
    setErrorMessage("")
  }

  return (
    <div className="mt-7">
      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!hasDocuments && (
        <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
              <svg
                className="h-4 w-4 text-zinc-500"
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

            <div>
              <p className="text-sm font-medium text-zinc-300">
                Upload a document to get started
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Once a PDF is indexed, you can ask questions
                and inspect the retrieved context.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          QUESTION INPUT
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition focus-within:border-white/20"
      >
        <textarea
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={isLoading || !hasDocuments}
          rows={4}
          placeholder={
            hasDocuments
              ? "Ask anything about your indexed documents..."
              : "Upload a document first..."
          }
          className="w-full resize-none bg-transparent px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Question"
        />

        <div className="flex flex-col gap-3 border-t border-white/5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

            <p className="text-[11px] text-zinc-600">
              Enter to ask · Shift + Enter for a new line
            </p>
          </div>

          <div className="flex gap-2">
            {(answer || question) && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                !question.trim() ||
                !hasDocuments
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Generating...
                </>
              ) : (
                <>
                  Ask
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* =====================================================
          PROCESSING STATE
      ====================================================== */}

      {isLoading && (
        <div className="mt-5 rounded-xl border border-purple-400/10 bg-purple-400/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-400/10 bg-purple-400/5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-300">
                Analyzing your documents
              </p>

              <p className="mt-0.5 text-[11px] text-zinc-600">
                Retrieving relevant context and generating a
                grounded answer...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {errorMessage && !isLoading && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-xs font-semibold text-red-300">
              !
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-red-300">
                Unable to process your question
              </p>

              <p className="mt-1 text-xs leading-5 text-red-400/80">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ANSWER + SOURCES
      ====================================================== */}

      {!isLoading && answer && (
        <div className="mt-7">
          <AnswerCard answer={answer} />

          {/* Sources */}
          {sources.length > 0 && (
            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Sources
                  </span>
                </div>

                <span className="text-[11px] text-zinc-600">
                  {sources.length}{" "}
                  {sources.length === 1
                    ? "source"
                    : "sources"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {sources.map((source, index) => (
                  <SourceCard
                    key={`${source?.source || "source"}-${index}`}
                    source={source}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Retrieved context */}
          <RetrievedChunks chunks={chunks} />
        </div>
      )}
    </div>
  )
}

export default ChatWindow