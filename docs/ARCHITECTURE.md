# DocIntel Architecture

## 1. Architecture Overview

DocIntel follows a layered full-stack architecture built around a Retrieval-Augmented Generation (RAG) pipeline.

The system separates:

* User interface
* API communication
* Document ingestion
* Embedding generation
* Vector storage
* Semantic retrieval
* Answer generation
* Source attribution

The high-level architecture is:

```text
                         USER
                           │
                           ▼
                ┌─────────────────────┐
                │   React Frontend    │
                │ React + Vite        │
                │ Tailwind CSS        │
                └──────────┬──────────┘
                           │
                        Axios
                           │
                           ▼
                ┌─────────────────────┐
                │     FastAPI         │
                │     API Layer       │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐        ┌────────────────┐
     │ Document APIs  │        │    Chat API    │
     └───────┬────────┘        └───────┬────────┘
             │                         │
             ▼                         ▼
     ┌────────────────┐        ┌────────────────┐
     │    Ingestion   │        │   RAG Service  │
     │    Service     │        └───────┬────────┘
     └───────┬────────┘                │
             │                 ┌───────┴────────┐
             ▼                 ▼                ▼
        Chunking          Retrieval         Generation
             │                 │                │
             ▼                 ▼                ▼
        Embeddings         ChromaDB          Gemini
             │
             ▼
          ChromaDB
```

---

# 2. Architectural Layers

DocIntel can be understood as five major layers.

```text
┌─────────────────────────────────────────┐
│              Presentation               │
│          React + Tailwind CSS           │
├─────────────────────────────────────────┤
│             API Communication           │
│                  Axios                  │
├─────────────────────────────────────────┤
│                API Layer                │
│                 FastAPI                 │
├─────────────────────────────────────────┤
│              RAG Services               │
│ Ingestion → Embedding → Retrieval → RAG │
├─────────────────────────────────────────┤
│         Infrastructure / Storage        │
│        ChromaDB + Gemini API            │
└─────────────────────────────────────────┘
```

Each layer has a specific responsibility.

---

# 3. Frontend Layer

The frontend is implemented using:

* React
* Vite
* Tailwind CSS
* Axios
* React Markdown

Its responsibility is to provide the user interface.

The frontend handles:

* PDF selection
* PDF upload
* Upload progress
* Document listing
* Document deletion
* Question input
* Loading states
* Answer rendering
* Source rendering
* Retrieved-context inspection
* Error and empty states

The frontend does not perform:

* PDF parsing
* Embedding generation
* Vector search
* Prompt construction
* Gemini API calls

This keeps AI and document-processing logic outside the browser.

---

# 4. React API Client

The frontend communicates with FastAPI through a dedicated API client.

Conceptually:

```text
React Components
       │
       ▼
   api.js
       │
       ▼
    Axios
       │
       ▼
   FastAPI
```

The API client provides a central location for backend communication.

This prevents individual React components from having to repeatedly construct HTTP requests.

For example:

```text
UploadPanel
     │
     ▼
documents API
     │
     ▼
POST /api/documents/upload
```

and:

```text
ChatWindow
     │
     ▼
chat API
     │
     ▼
POST /api/chat
```

---

# 5. FastAPI API Layer

FastAPI acts as the backend boundary between the frontend and internal application services.

The API layer exposes HTTP endpoints for:

* Health checks
* Document upload
* Document listing
* Document statistics
* Document deletion
* Question answering

The API layer is responsible for:

1. Receiving HTTP requests.
2. Validating request data.
3. Calling the appropriate service.
4. Returning structured responses.
5. Handling API-level errors.

It should not contain the complete RAG implementation itself.

Instead, complex processing is delegated to services.

---

# 6. Document API

The document API manages the document lifecycle.

Supported operations include:

```text
Upload
   ↓
Validate
   ↓
Process
   ↓
Index
   ↓
List
   ↓
Delete
```

The major endpoints are:

```http
POST /api/documents/upload
GET /api/documents
GET /api/documents/stats
DELETE /api/documents/{source}
```

---

# 7. Ingestion Service

The ingestion service converts an uploaded PDF into structured text chunks.

Its responsibility is document preprocessing.

The pipeline is:

```text
PDF
 │
 ▼
Validation
 │
 ▼
Text Extraction
 │
 ▼
Page-Level Metadata
 │
 ▼
Text Splitting
 │
 ▼
Chunks
```

Each chunk retains metadata that can later be used for source attribution.

Typical metadata includes:

```text
document/source
page
chunk identifier
```

This metadata is essential because the system must be able to answer:

> "Where did this information come from?"

---

# 8. Chunking

Large documents cannot efficiently be treated as one giant text block.

DocIntel therefore splits extracted text into smaller chunks.

```text
Large PDF
    ↓
Pages
    ↓
Text
    ↓
Chunks
    ↓
Embeddings
```

Chunking improves semantic retrieval because the vector database can search smaller, focused sections of the document.

The chunks also become the units of context supplied to the generation model.

---

# 9. Embedding Layer

The embedding layer converts text into numerical vector representations.

DocIntel uses:

```text
gemini-embedding-001
```

The embedding process is used for both:

### Document Embeddings

```text
PDF Chunk
   ↓
Embedding Model
   ↓
Vector
   ↓
ChromaDB
```

### Query Embeddings

```text
User Question
   ↓
Embedding Model
   ↓
Query Vector
   ↓
ChromaDB Search
```

Because the document chunks and queries are represented in the same semantic vector space, the system can compare their semantic similarity.

---

# 10. Vector Service

The vector service manages communication with ChromaDB.

Its responsibilities include:

* Creating/accessing the collection
* Adding document vectors
* Storing metadata
* Querying vectors
* Deleting document vectors
* Maintaining persistent vector storage

The conceptual relationship is:

```text
Embedding
    │
    ▼
ChromaDB
    │
    ├── Vector
    ├── Document
    ├── Metadata
    └── Chunk information
```

ChromaDB acts as the application's semantic index.

---

# 11. Retrieval Service

The retrieval service is responsible for finding the most relevant chunks for a user question.

The process is:

```text
User Question
      ↓
Query Embedding
      ↓
ChromaDB Similarity Search
      ↓
Top-K Relevant Chunks
```

The retrieval service does not generate the final answer.

Its job is to answer:

> "Which pieces of the indexed documents are most relevant to this question?"

The retrieved chunks are then passed to the RAG service.

---

# 12. RAG Service

The RAG service connects retrieval with answer generation.

Its responsibility is to orchestrate the complete question-answering workflow.

```text
Question
   ↓
Query Embedding
   ↓
Semantic Retrieval
   ↓
Relevant Chunks
   ↓
Context Construction
   ↓
Grounded Prompt
   ↓
Gemini
   ↓
Generated Answer
   ↓
Source Extraction
   ↓
Final Response
```

The RAG service therefore acts as the central orchestration layer for question answering.

---

# 13. Context Construction

The retrieved chunks are transformed into context for the generation model.

Conceptually:

```text
Retrieved Chunk 1
Retrieved Chunk 2
Retrieved Chunk 3
       │
       ▼
Context Construction
       │
       ▼
Grounded Prompt
```

The model receives the relevant document information along with the user's question.

This is the core mechanism that makes the application retrieval-augmented.

---

# 14. Grounded Generation

DocIntel uses:

```text
gemini-3.6-flash
```

for answer generation.

The model receives:

```text
User Question
+
Retrieved Document Context
```

rather than relying only on its general pre-trained knowledge.

The desired behavior is:

```text
Relevant information exists
        ↓
Generate answer from retrieved context
```

and:

```text
Relevant information does not exist
        ↓
Indicate that the information
was not found in the documents
```

This provides a more controlled document-question-answering workflow.

---

# 15. Source Attribution

Source tracking begins during document ingestion.

When text is extracted, page-level metadata is preserved.

```text
PDF
 │
 ├── Page 1
 │     └── Chunk A
 │
 ├── Page 2
 │     ├── Chunk B
 │     └── Chunk C
 │
 └── Page 3
       └── Chunk D
```

When a chunk is retrieved, its metadata is available to the RAG response.

Therefore the frontend can display:

```text
Source
Document: example.pdf
Page: 2
Chunk: B
```

This creates a traceable relationship between:

```text
Answer
  ↓
Retrieved Chunk
  ↓
Page
  ↓
Document
```

---

# 16. Chat API

The chat API exposes the question-answering capability.

Endpoint:

```http
POST /api/chat
```

Request:

```json
{
  "question": "What role does this company offer?"
}
```

The request enters the RAG pipeline:

```text
POST /api/chat
       ↓
RAG Service
       ↓
Query Embedding
       ↓
Retrieval
       ↓
Context Construction
       ↓
Gemini
       ↓
Response
```

The response contains the generated answer and retrieval information.

Conceptually:

```json
{
  "answer": "...",
  "sources": [...],
  "chunks": [...]
}
```

---

# 17. Complete Upload Flow

When a user uploads a PDF:

```text
React UploadPanel
       ↓
Axios
       ↓
POST /api/documents/upload
       ↓
FastAPI
       ↓
Ingestion Service
       ↓
PDF Extraction
       ↓
Chunking
       ↓
Embedding Generation
       ↓
ChromaDB
       ↓
Response
       ↓
React DocumentList
```

The document then becomes available for semantic retrieval.

---

# 18. Complete Question Flow

When a user asks a question:

```text
React ChatWindow
       ↓
Axios
       ↓
POST /api/chat
       ↓
FastAPI
       ↓
RAG Service
       ↓
Query Embedding
       ↓
ChromaDB
       ↓
Relevant Chunks
       ↓
Context Construction
       ↓
Gemini
       ↓
Answer + Sources + Chunks
       ↓
FastAPI Response
       ↓
React AnswerCard
       ↓
SourceCard
       ↓
RetrievedChunks
```

---

# 19. Multi-Document Retrieval

DocIntel supports multiple indexed documents in the same knowledge base.

Conceptually:

```text
Document A
   ├── Chunk A1
   ├── Chunk A2
   └── Chunk A3

Document B
   ├── Chunk B1
   ├── Chunk B2
   └── Chunk B3

Document C
   ├── Chunk C1
   ├── Chunk C2
   └── Chunk C3
```

All indexed chunks are available to the semantic retrieval layer.

For a query:

```text
"What skills are required?"
```

the retrieval system can return:

```text
Document A → Page 2
Document C → Page 4
Document B → Page 1
```

The RAG response preserves the source metadata so that the frontend can show where each retrieved result originated.

---

# 20. Document Deletion

Document deletion must affect both the document representation and its stored vectors.

The conceptual flow is:

```text
Delete Document
      ↓
FastAPI
      ↓
Document Service
      ↓
Vector Store
      ↓
Remove associated vectors
      ↓
Updated Knowledge Base
```

This prevents deleted documents from continuing to participate in retrieval.

---

# 21. Re-indexing

DocIntel also supports re-uploading/re-indexing documents.

The intended lifecycle is:

```text
Existing Document
       ↓
Re-upload
       ↓
Process Again
       ↓
Generate New Chunks
       ↓
Generate Embeddings
       ↓
Update Vector Store
```

This allows the indexed representation to remain synchronized with the uploaded document.

---

# 22. Separation of Concerns

One of the most important architectural decisions in DocIntel is separating responsibilities.

| Component           | Responsibility                       |
| ------------------- | ------------------------------------ |
| React components    | User interface                       |
| `api.js`            | HTTP communication                   |
| FastAPI routes      | API boundary                         |
| `ingestion_service` | PDF processing and chunking          |
| Embedding layer     | Text → vectors                       |
| `vector_service`    | ChromaDB operations                  |
| `retrieval_service` | Relevant chunk retrieval             |
| `rag_service`       | Retrieval + generation orchestration |
| ChromaDB            | Persistent vector storage            |
| Gemini              | Embeddings and answer generation     |

This separation makes the application easier to:

* Understand
* Test
* Debug
* Extend
* Maintain

---

# 23. Why React Does Not Call Gemini Directly

The frontend communicates only with FastAPI.

The architecture is intentionally:

```text
                 ✗
React ───────────────► Gemini
                 │
                 │ Not used
                 ▼

                 ✓
React ─────► FastAPI ─────► Gemini
```

This prevents the Gemini credential from being exposed in browser-side code.

It also centralizes:

* Prompt construction
* Retrieval
* Model selection
* API error handling
* RAG orchestration

inside the backend.

---

# 24. Error Handling

Errors can occur at multiple stages.

```text
Upload
  ↓
Validation Error
  ↓
Processing Error
  ↓
Embedding Error
  ↓
Vector Storage Error
  ↓
Retrieval Error
  ↓
Generation Error
```

The backend converts these failures into API responses.

The React frontend then translates them into user-facing states such as:

```text
Upload failed
Unable to connect to backend
Unable to generate answer
No relevant information found
```

This prevents raw backend exceptions from becoming the primary user experience.

---

# 25. Performance Considerations

The system uses vector-based semantic retrieval rather than scanning every document manually for each query.

The general query process is:

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Top-K Results
   ↓
Generation
```

Only the most relevant retrieved chunks are supplied as context to the generation model.

This keeps the RAG workflow focused on relevant document information.

---

# 26. Security Boundary

The backend is the security boundary for external AI services.

```text
Browser
  │
  │ PDF / Question
  ▼
FastAPI
  │
  ├── Environment variables
  ├── Gemini API
  └── ChromaDB
```

The Gemini API key is never intentionally exposed to the frontend.

The `.env` file is excluded from version control through `.gitignore`.

This is suitable for the current project scope, but the application should not be described as production-grade security without additional controls.

---

# 27. Architectural Summary

DocIntel can be summarized as:

```text
                    DOCUMENT INTELLIGENCE
                           │
             ┌─────────────┴─────────────┐
             │                           │
         Documents                    Questions
             │                           │
             ▼                           ▼
         Ingestion                  Query Embedding
             │                           │
          Chunking                       │
             │                           │
         Embeddings                      │
             │                           │
             └──────────► ChromaDB ◄─────┘
                              │
                              ▼
                       Semantic Retrieval
                              │
                              ▼
                       Relevant Context
                              │
                              ▼
                       Grounded Prompt
                              │
                              ▼
                           Gemini
                              │
                              ▼
                    Answer + Sources
                              │
                              ▼
                       React Frontend
```

The key architectural principle is:

> **Retrieve first, generate second, and preserve the source information throughout the pipeline.**

This is what transforms DocIntel from a simple chatbot into a document-grounded RAG system.
