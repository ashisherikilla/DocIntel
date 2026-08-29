import ReactMarkdown from "react-markdown"

function AnswerCard({ answer }) {
  if (!answer) {
    return null
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          AI Answer
        </span>
      </div>

      <div className="text-sm leading-7 text-zinc-300">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="mb-3 mt-5 text-xl font-semibold text-white">
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2 className="mb-3 mt-5 text-lg font-semibold text-white">
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="mb-2 mt-4 text-base font-semibold text-white">
                {children}
              </h3>
            ),

            p: ({ children }) => (
              <p className="mb-3 leading-7 text-zinc-300">
                {children}
              </p>
            ),

            strong: ({ children }) => (
              <strong className="font-semibold text-white">
                {children}
              </strong>
            ),

            ul: ({ children }) => (
              <ul className="mb-4 ml-5 list-disc space-y-1.5 text-zinc-300">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-zinc-300">
                {children}
              </ol>
            ),

            li: ({ children }) => (
              <li className="pl-1 leading-7">
                {children}
              </li>
            ),

            code: ({ children }) => (
              <code className="rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 text-xs text-zinc-200">
                {children}
              </code>
            ),

            blockquote: ({ children }) => (
              <blockquote className="my-4 border-l-2 border-purple-400/40 pl-4 text-zinc-400">
                {children}
              </blockquote>
            ),
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default AnswerCard