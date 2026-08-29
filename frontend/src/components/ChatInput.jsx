import { useState } from "react"

function ChatInput({ onSubmit, isLoading, disabled = false }) {
  const [question, setQuestion] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isLoading || disabled) {
      return
    }

    await onSubmit(trimmedQuestion)
    setQuestion("")
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="rounded-xl border border-white/10 bg-black/30 p-2 transition focus-within:border-white/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            rows={2}
            placeholder={
              disabled
                ? "Upload a document to start asking questions..."
                : "Ask anything about your documents..."
            }
            className="min-h-14 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={
              isLoading ||
              disabled ||
              !question.trim()
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Asking
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

      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-[11px] text-zinc-600">
          Press Enter to ask
        </p>

        <p className="text-[11px] text-zinc-700">
          Answers are grounded in indexed documents
        </p>
      </div>
    </form>
  )
}

export default ChatInput