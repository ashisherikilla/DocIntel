import axios from "axios"

const API_BASE_URL = "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
})

/**
 * Check whether the FastAPI backend is healthy.
 */
export const checkHealth = async () => {
  const response = await api.get("/health")
  return response.data
}

/**
 * Upload a PDF document.
 */
export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData()

  formData.append("file", file)

  const response = await api.post(
    "/api/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }
  )

  return response.data
}

/**
 * Fetch all indexed documents.
 */
export const getDocuments = async () => {
  const response = await api.get("/api/documents")
  return response.data
}

/**
 * Fetch document/vector statistics.
 */
export const getDocumentStats = async () => {
  const response = await api.get("/api/documents/stats")
  return response.data
}

/**
 * Delete an indexed document.
 */
export const deleteDocument = async (source) => {
  const response = await api.delete(
    `/api/documents/${encodeURIComponent(source)}`
  )

  return response.data
}

/**
 * Ask a question about indexed documents.
 */
export const askQuestion = async (question) => {
  const response = await api.post("/api/chat", {
    question,
  })

  return response.data
}

export default api