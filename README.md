# DocIntel — RAG-Powered Intelligent Document Analyst

> An intelligent document analysis system that transforms PDF documents into a searchable semantic knowledge base and generates grounded answers with transparent source and page-level citations.

---

## Overview

**DocIntel** is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents, semantically search their contents, and ask natural-language questions about the information contained within them.

Instead of relying only on an LLM's internal knowledge, DocIntel retrieves relevant passages from the uploaded documents and provides them to the generation model as grounded context.

Every generated answer can be inspected through its associated:

* Document name
* Page number
* Retrieved chunk
* Source information

This makes the system more transparent and reduces the risk of unsupported or hallucinated answers.

---


## 🌐 Try DocIntel

**Live Demo:** https://docintel-rag-based.vercel.app/

**Source Code:** https://github.com/ashisherikilla/DocIntel

> Upload a PDF → Ask questions → Retrieve relevant context → Get grounded answers with transparent source and page-level citations.


 ---

## Problem Statement

Large PDF documents often contain valuable information that is difficult to locate manually.

Traditional approaches require users to:

1. Open the document.
2. Search for keywords.
3. Read multiple sections.
4. Manually combine information.
5. Determine whether the information actually answers their question.

Generic LLMs introduce another problem: they may generate plausible answers that are not actually supported by the user's documents.

DocIntel addresses both problems by combining **semantic document retrieval with grounded AI generation**.

---

## Solution

DocIntel converts uploaded PDFs into a searchable semantic knowledge base.

The overall pipeline is:

```text
PDF Document
     ↓
PDF Text Extraction
     ↓
Page-Level Processing
     ↓
Text Chunking
     ↓
Gemini Embeddings
     ↓
ChromaDB
     ↓
Semantic Retrieval
     ↓
Relevant Context
     ↓
Grounded Prompt
     ↓
Gemini
     ↓
Answer + Sources
```

When a user asks a question, DocIntel does not simply send the question directly to the LLM.

Instead, it first finds the most relevant document chunks and uses those chunks as context for answer generation.

---

# Key Features

### Document Processing

* PDF upload
* PDF validation
* Page-level text extraction
* Recursive text splitting
* Chunk generation
* Chunk metadata preservation
* Source and page tracking

### Semantic Search

* Gemini-based embeddings
* 768-dimensional document embeddings
* Query/document embedding separation
* Persistent ChromaDB vector storage
* Top-K semantic retrieval

### RAG Question Answering

* Natural-language questions
* Semantic retrieval
* Context construction
* Grounded prompting
* Gemini-powered answer generation
* Information-not-found handling

### Source Transparency

Answers expose:

* Source document
* Page number
* Retrieved chunk
* Retrieved context

This allows users to inspect where the generated answer originated.

### Multi-Document Knowledge Base

DocIntel supports multiple indexed PDF documents simultaneously.

The system can retrieve relevant information:

* From a specific document
* Across multiple documents
* From different pages within documents

### Document Management

* List indexed documents
* View document statistics
* Delete documents
* Re-upload/re-index documents
* Synchronize document metadata with the vector store

### Modern Web Interface

* React frontend
* Responsive design
* PDF upload workspace
* Document library
* RAG assistant
* Markdown-rendered answers
* Loading states
* Processing states
* Empty states
* Error states
* Retrieved-context inspection

---

# RAG Architecture

The core architecture is:

```text
                    USER
                     │
                     ▼
              React Frontend
                     │
                  Axios
                     │
                     ▼
               FastAPI API
                     │
          ┌──────────┴──────────┐
          │                     │
     Document APIs          Chat API
          │                     │
          ▼                     ▼
   Ingestion Service      RAG Service
          │                     │
          ▼                     ▼
      Chunking             Query Embedding
          │                     │
          ▼                     ▼
   Embedding Layer       Semantic Retrieval
          │                     │
          ▼                     ▼
      ChromaDB ◄──────── Relevant Chunks
                                │
                                ▼
                       Context Construction
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

---

# Question Answering Flow

When a user submits a question:

```text
User Question
     ↓
Query Embedding
     ↓
ChromaDB Semantic Search
     ↓
Top-K Relevant Chunks
     ↓
Context Construction
     ↓
Grounded Prompt
     ↓
Gemini Generation
     ↓
Normalized Response
     ↓
Answer + Sources + Retrieved Chunks
```

For example:

```text
Question:
"What role does this company offer?"
```

The system first searches the indexed documents for semantically relevant chunks.

The retrieved chunks are then provided to Gemini as context.

The resulting response is returned to the frontend together with the source information.

---

# Why RAG?

A standard LLM response is not necessarily grounded in the documents uploaded by the user.

RAG introduces an explicit retrieval step:

```text
Question
   ↓
Retrieve relevant information
   ↓
Give information to LLM
   ↓
Generate answer
```

This allows DocIntel to answer questions using the contents of the user's documents rather than depending solely on the model's pre-trained knowledge.

It also provides a mechanism for source attribution.

---

# RAG Transparency

One of the key design goals of DocIntel is **retrieval transparency**.

The application does not only display:

```text
AI Answer
```

It also exposes:

```text
Sources
├── Document name
├── Page number
└── Chunk information
```

and allows retrieved context to be inspected.

Therefore, the user can conceptually trace:

```text
Question
   ↓
Retrieved Context
   ↓
Grounded Answer
   ↓
Source Document
   ↓
Page
```

This is particularly useful for document analysis systems where users need to understand the basis of an AI-generated response.

---

# Technology Stack

## Backend

| Technology                             | Purpose                          |
| -------------------------------------- | -------------------------------- |
| Python                                 | Backend development              |
| FastAPI                                | REST API framework               |
| ChromaDB                               | Persistent vector database       |
| Gemini API                             | Embeddings and answer generation |
| LangChain-compatible embedding adapter | Embedding integration            |
| PDF processing                         | Document ingestion               |

### Models

**Generation model**

```text
gemini-3.6-flash
```

**Embedding model**

```text
gemini-embedding-001
```

---

## Frontend

| Technology     | Purpose                   |
| -------------- | ------------------------- |
| React          | UI development            |
| Vite           | Frontend tooling          |
| Tailwind CSS   | Styling                   |
| Axios          | API communication         |
| React Markdown | Markdown answer rendering |

---

# Frontend ↔ Backend Communication

The React frontend communicates with the FastAPI backend through HTTP REST APIs.

The frontend does **not** communicate directly with Gemini.

```text
React
  │
  │ HTTP requests
  ▼
FastAPI
  │
  ├── PDF processing
  ├── Embeddings
  ├── ChromaDB retrieval
  └── Gemini generation
```

For example, a question is sent to:

```http
POST /api/chat
```

with:

```json
{
  "question": "What is the role this company offers?"
}
```

The backend processes the RAG pipeline and returns:

```json
{
  "answer": "...",
  "sources": [...],
  "chunks": [...]
}
```

React then renders the answer and its associated sources.

This architecture keeps the Gemini credentials on the backend.

---

# Project Structure

```text
DocIntel/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   └── documents.py
│   │   │
│   │   ├── services/
│   │   │   ├── ingestion_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── vector_service.py
│   │   │   ├── retrieval_service.py
│   │   │   └── rag_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── data/
│   │   └── chroma/
│   │
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── AnswerCard.jsx
│   │   │   ├── SourceCard.jsx
│   │   │   └── RetrievedChunks.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .env.example
├── .gitignore
└── README.md
```

> The exact file structure may evolve as the application develops. The directories above represent the major architectural responsibilities.

---

# Backend Architecture

## Ingestion Service

Responsible for converting uploaded PDFs into searchable text representations.

The ingestion pipeline performs:

```text
PDF
 ↓
Validation
 ↓
Text Extraction
 ↓
Page Metadata
 ↓
Chunking
 ↓
Chunk Metadata
```

Each chunk preserves important information such as the originating document and page.

---

## Embedding Layer

The embedding layer converts text into numerical vector representations.

DocIntel uses:

```text
gemini-embedding-001
```

The same embedding space is used for document chunks and user queries, allowing semantic similarity comparison.

---

## Vector Service

The vector service manages interaction with ChromaDB.

Responsibilities include:

* Creating/accessing the collection
* Storing embeddings
* Storing chunk metadata
* Querying vectors
* Removing document vectors

ChromaDB provides persistent vector storage for the application.

---

## Retrieval Service

The retrieval service performs semantic search.

The user question is embedded and compared with stored document embeddings.

The highest-relevance chunks are returned for use by the RAG pipeline.

---

## RAG Service

The RAG service connects retrieval with generation.

Its responsibility is to:

1. Embed the query.
2. Retrieve relevant chunks.
3. Construct context.
4. Build the grounded prompt.
5. Call Gemini.
6. Normalize the response.
7. Extract source information.
8. Return the final answer and retrieved information.

---

## FastAPI API Layer

FastAPI provides the HTTP interface used by the React frontend.

It separates the external API contract from the internal RAG services.

The frontend therefore does not need to know how:

* PDFs are parsed
* embeddings are generated
* vectors are stored
* retrieval works
* Gemini prompts are constructed

It only interacts with the API.

---

# API Reference

## Health Check

```http
GET /health
```

Used to verify backend availability.

---

## Upload Document

```http
POST /api/documents/upload
```

Uploads and indexes a PDF document.

The document passes through the ingestion and embedding pipeline before becoming available for semantic retrieval.

---

## List Documents

```http
GET /api/documents
```

Returns indexed documents.

---

## Document Statistics

```http
GET /api/documents/stats
```

Returns document/vector statistics used by the frontend.

---

## Delete Document

```http
DELETE /api/documents/{source}
```

Deletes an indexed document and its associated vector data.

---

## Ask a Question

```http
POST /api/chat
```

Example request:

```json
{
  "question": "What is the role this company offers?"
}
```

Example response structure:

```json
{
  "answer": "The company offers ...",
  "sources": [
    {
      "document": "example.pdf",
      "page": 2
    }
  ],
  "chunks": [
    {
      "content": "...",
      "page": 2
    }
  ]
}
```

The exact response fields may contain additional metadata depending on the current backend implementation.

---

# Environment Variables

DocIntel requires a Gemini API key on the backend.

Create:

```text
backend/.env
```

with:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit the real `.env` file.

A template is provided through:

```text
.env.example
```

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd DocIntel
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_api_key_here
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI's interactive documentation is available through its Swagger/OpenAPI interface.

---

# Frontend Setup

Open another terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL displayed by Vite in your browser.

---

# Complete Application Flow

Once both services are running:

```text
1. Start FastAPI
       ↓
2. Start React/Vite
       ↓
3. Open DocIntel
       ↓
4. Upload PDF
       ↓
5. PDF is processed
       ↓
6. Chunks are embedded
       ↓
7. Vectors stored in ChromaDB
       ↓
8. Document appears in library
       ↓
9. Ask a question
       ↓
10. Query embedding generated
       ↓
11. Relevant chunks retrieved
       ↓
12. Gemini generates grounded answer
       ↓
13. Answer displayed
       ↓
14. Sources displayed
       ↓
15. Page/chunk information displayed
```

---

# Testing & Validation

DocIntel has been validated across the complete application flow.

### Backend

* FastAPI startup
* Health endpoint
* PDF upload
* PDF validation
* PDF indexing
* Document listing
* Document statistics
* Document deletion
* Re-upload/re-indexing
* ChromaDB synchronization
* Semantic retrieval
* Gemini generation
* Out-of-context questions

### Frontend

* React/Vite startup
* PDF selection
* Drag and drop upload
* Upload progress
* Processing state
* Indexed document display
* Statistics synchronization
* Question submission
* Enter-to-submit
* Loading state
* Answer rendering
* Markdown rendering
* Source display
* Page information
* Retrieved context
* Delete confirmation
* Empty states
* Error states
* Responsive layout

### Multi-Document Validation

The system was also validated with multiple documents to verify:

* Multiple PDF indexing
* Cross-document retrieval
* Document-specific retrieval
* Correct source attribution
* Correct page attribution
* Document deletion
* Re-indexing
* Retrieval after re-indexing

---

# Screenshots

Recommended screenshots for the GitHub repository:

### 1. Main Dashboard

Show:

* DocIntel branding
* System status
* Upload workspace
* Document statistics
* RAG assistant

Suggested filename:

```text
docs/dashboard.png
```

### 2. PDF Upload

Show the upload/processing interface.

```text
docs/upload.png
```

### 3. Document Library

Show multiple indexed documents.

```text
docs/documents.png
```

### 4. AI Answer

Show a question and generated answer.

```text
docs/answer.png
```

### 5. Sources

Show document and page-level source information.

```text
docs/sources.png
```

### 6. Retrieved Context

Show the expandable retrieved chunks.

```text
docs/retrieved-context.png
```

These screenshots should demonstrate the application's RAG workflow rather than simply showing decorative UI.

---

# Security Considerations

DocIntel follows several important security practices within the scope of the current project.

### Gemini API Key

The Gemini API key remains on the backend.

```text
React
  ↓
FastAPI
  ↓
Gemini
```

The frontend never directly communicates with Gemini.

### Environment Variables

Secrets are stored in environment variables rather than source code.

The `.env` file is excluded from Git using `.gitignore`.

### CORS

FastAPI provides CORS configuration so that the development frontend can communicate with the backend.

### File Validation

Uploaded files are validated before being processed by the ingestion pipeline.

### Error Handling

Backend errors are surfaced through API responses and handled by the React interface with user-friendly error states.

> These measures are appropriate for the current project scope. DocIntel should not be considered production-grade security without additional hardening, authentication, authorization, infrastructure controls, rate limiting, monitoring, and deployment-specific security measures.

---

# Design Philosophy

DocIntel intentionally focuses on a small number of capabilities and executes them well.

The application does **not** attempt to become a general-purpose platform.

The core experience is:

```text
Upload
  ↓
Index
  ↓
Ask
  ↓
Retrieve
  ↓
Generate
  ↓
Verify
```

The source and retrieved-context features are particularly important because they make the RAG process visible to the user instead of presenting the application as a black-box chatbot.

---

# Future Improvements

Potential future improvements include:

* Authentication
* User-specific document collections
* Streaming responses
* Advanced retrieval/reranking
* OCR support
* Additional document formats
* Conversation history
* Cloud deployment
* Production monitoring
* Rate limiting
* More advanced evaluation metrics

These are intentionally outside the current implementation scope.

---

# Project Highlights

DocIntel demonstrates practical implementation of:

* Retrieval-Augmented Generation
* Semantic search
* Vector databases
* Embeddings
* PDF processing
* Metadata-aware retrieval
* Grounded LLM generation
* FastAPI REST APIs
* React frontend development
* Multi-document retrieval
* Source attribution
* Full-stack system integration

---

# Resume Description

**DocIntel — RAG-Powered Intelligent Document Analyst**

A full-stack RAG application that converts PDF documents into a semantic knowledge base using Gemini embeddings and ChromaDB, enabling grounded question answering through FastAPI and React with transparent document, page, and retrieved-context citations.

---

# License

Add the project's chosen license here before publishing the repository.

---

## Author

**Ashish**

Built as a portfolio project demonstrating full-stack AI/RAG application development.
