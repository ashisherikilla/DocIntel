import { useEffect, useState } from "react"
import {
  checkHealth,
  getDocumentStats,
  getDocuments,
} from "./api/api"

import UploadPanel from "./components/UploadPanel"
import DocumentList from "./components/DocumentList"
import ChatWindow from "./components/ChatWindow"

function App() {
  const [documents, setDocuments] = useState([])
  const [documentCount, setDocumentCount] = useState(0)
  const [chunkCount, setChunkCount] = useState(0)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const loadDashboardData = async () => {
    setIsLoadingData(true)

    try {
      const [
        documentsResult,
        statsResult,
        healthResult,
      ] = await Promise.all([
        getDocuments(),
        getDocumentStats(),
        checkHealth(),
      ])

      const loadedDocuments = Array.isArray(
        documentsResult?.documents
      )
        ? documentsResult.documents
        : []

      setDocuments(loadedDocuments)

      setDocumentCount(
        statsResult?.documents ??
          documentsResult?.count ??
          loadedDocuments.length
      )

      setChunkCount(statsResult?.vectors ?? 0)

      setIsBackendOnline(
        healthResult?.status === "healthy"
      )
    } catch (error) {
      console.error(
        "Failed to load dashboard data:",
        error
      )

      setIsBackendOnline(false)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
              D
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">
                DocIntel
              </p>

              <p className="hidden truncate text-[11px] text-zinc-500 sm:block">
                Intelligent Document Analysis
              </p>
            </div>
          </div>

          <div
            className={`flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 sm:px-3 ${
              isBackendOnline
                ? "border-emerald-400/20 bg-emerald-400/5"
                : "border-red-400/20 bg-red-400/5"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isBackendOnline
                  ? "bg-emerald-400"
                  : "bg-red-400"
              }`}
            />

            <span
              className={`text-[11px] font-medium sm:text-xs ${
                isBackendOnline
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              <span className="hidden sm:inline">
                {isBackendOnline
                  ? "System Online"
                  : "Backend Offline"}
              </span>

              <span className="sm:hidden">
                {isBackendOnline ? "Online" : "Offline"}
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[11px] text-zinc-400 sm:text-xs">
              RAG-powered document intelligence
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ask your documents.
            <span className="block text-zinc-500">
              Get grounded answers.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base lg:text-lg">
            Upload a PDF, let DocIntel index its content,
            and ask questions using semantic retrieval and
            AI-generated answers grounded in your documents.
          </p>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          <StatCard
            label="Documents"
            value={
              isLoadingData ? "—" : documentCount
            }
            description="Indexed documents"
          />

          <StatCard
            label="Chunks"
            value={
              isLoadingData ? "—" : chunkCount
            }
            description="Indexed knowledge units"
          />

          <StatCard
            label="Backend"
            value={
              isLoadingData ? "—" : isBackendOnline ? "Online" : "Offline"
            }
            description="FastAPI service"
            status={isBackendOnline}
          />
        </section>

        {/* Documents */}
        <section className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <div className="mb-5">
              <p className="text-sm font-medium text-zinc-300">
                Document workspace
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Upload documents
              </h2>

              <p className="mt-2 text-xs leading-6 text-zinc-500 sm:text-sm">
                Add PDF files to build your searchable
                knowledge base.
              </p>
            </div>

            <UploadPanel
              onUploadSuccess={loadDashboardData}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  Knowledge base
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  Your documents
                </h2>
              </div>

              <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-zinc-500 sm:text-[11px]">
                {documentCount} indexed
              </span>
            </div>

            <DocumentList
              documents={documents}
              onDocumentsChange={loadDashboardData}
            />
          </div>
        </section>

        {/* Chat */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:mt-8 sm:p-7 lg:p-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

              <span className="text-[11px] font-medium text-zinc-400">
                RAG assistant
              </span>
            </div>

            <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
              Ask your documents
            </h2>

            <p className="mt-2 text-xs leading-6 text-zinc-500 sm:text-sm">
              Retrieve relevant context and generate a
              grounded answer with traceable sources.
            </p>
          </div>

          <ChatWindow
            hasDocuments={documents.length > 0}
          />
        </section>

        {/* Pipeline */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:mt-8 sm:p-7">
          <div className="mb-5">
            <p className="text-sm font-medium text-zinc-300">
              How DocIntel works
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Transparent retrieval-augmented generation
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PipelineStep
              number="01"
              title="Upload"
              description="PDF ingestion"
            />

            <PipelineStep
              number="02"
              title="Retrieve"
              description="Semantic search"
            />

            <PipelineStep
              number="03"
              title="Generate"
              description="Grounded Gemini answer"
            />

            <PipelineStep
              number="04"
              title="Cite"
              description="Sources & pages"
            />
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11px] text-zinc-600 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
          <p>
            DocIntel — RAG-Powered Intelligent Document Analyst
          </p>

          <p>
            FastAPI · React · ChromaDB · Gemini
          </p>
        </footer>
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  description,
  status = false,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {label}
        </p>

        {label === "Backend" && (
          <span
            className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] ${
              status
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status
                  ? "bg-emerald-400"
                  : "bg-red-400"
              }`}
            />

            {status ? "Healthy" : "Unavailable"}
          </span>
        )}
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  )
}

function PipelineStep({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-600">
          {number}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-300">
            {title}
          </p>

          <p className="mt-0.5 text-[11px] text-zinc-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App