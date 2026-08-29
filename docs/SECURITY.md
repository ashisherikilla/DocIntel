# DocIntel Security & Environment Guide

## 1. Overview

DocIntel separates frontend application code from backend AI infrastructure.

The React frontend communicates with the FastAPI backend, while sensitive AI credentials remain on the backend.

```text
Browser
   │
   │ HTTP requests
   ▼
FastAPI
   │
   ├── ChromaDB
   │
   └── Gemini API
          │
          └── GEMINI_API_KEY
```

The frontend does not directly communicate with Gemini.

---

# 2. Environment Variables

DocIntel currently requires:

```env
GEMINI_API_KEY=your_api_key_here
```

The variable is used by the backend to authenticate requests to Gemini.

The real credential should be stored in:

```text
backend/.env
```

The environment file must not be committed to Git.

---

# 3. `.env` vs `.env.example`

### `.env`

Contains the real local credential.

Example:

```env
GEMINI_API_KEY=your_real_key
```

This file is private and should remain local.

### `.env.example`

Contains only a placeholder.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

This file can safely be committed to the repository.

Its purpose is to tell developers which environment variables are required.

---

# 4. Git Protection

The repository's `.gitignore` excludes environment files.

Important rules include:

```gitignore
.env
.env.*
!.env.example
```

This means:

```text
.env                  ignored
.env.local            ignored
.env.production       ignored
.env.example          tracked
```

This reduces the chance of accidentally committing credentials.

---

# 5. API Key Handling

The Gemini API key is intentionally kept server-side.

The architecture is:

```text
                    ✗
React ─────────────────────► Gemini
       Direct API access
       is not used.

                    ✓
React ─────► FastAPI ─────► Gemini
                │
                └── API key
```

The React application only knows the FastAPI API endpoints.

It does not need access to the Gemini credential.

---

# 6. Why the Frontend Does Not Call Gemini

Keeping Gemini communication in FastAPI provides several benefits:

### Credential Protection

The API key does not need to be bundled into browser JavaScript.

### Centralized AI Logic

The backend controls:

* Embedding configuration
* Retrieval
* Prompt construction
* Generation model
* Response normalization

### RAG Integrity

The frontend cannot bypass the retrieval layer and directly request arbitrary Gemini responses.

The intended flow remains:

```text
Question
   ↓
FastAPI
   ↓
Retrieval
   ↓
Context
   ↓
Grounded Prompt
   ↓
Gemini
```

---

# 7. CORS

FastAPI is configured to allow communication from the development frontend.

The purpose of CORS configuration is to permit the browser-based React application to communicate with the FastAPI server during development.

CORS should be configured appropriately for the deployment environment.

The current development configuration should not automatically be considered suitable for unrestricted production deployment.

---

# 8. File Validation

DocIntel validates uploaded files before sending them through the document-processing pipeline.

The application is designed around PDF documents.

The upload workflow is:

```text
File
 ↓
Validation
 ↓
PDF Processing
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embedding
 ↓
Vector Storage
```

Invalid files should be rejected before they enter the indexing pipeline.

---

# 9. API Error Handling

Backend failures are returned through API responses.

The React frontend handles these failures using user-facing error states.

Examples include:

```text
Unable to connect to backend
Upload failed
Unable to process document
Unable to generate answer
```

The UI should avoid exposing raw internal exceptions as the primary user experience.

---

# 10. ChromaDB Data

DocIntel uses persistent ChromaDB storage for document vectors.

The local ChromaDB directory is:

```text
backend/data/chroma/
```

This directory is excluded from Git.

It should not be committed to the repository because vector data is generated locally from indexed documents.

A fresh installation can recreate the vector store by indexing documents again.

---

# 11. Secrets That Must Never Be Committed

Never commit:

```text
backend/.env
API keys
Gemini credentials
Access tokens
Private credentials
Production secrets
```

Safe to commit:

```text
.env.example
README.md
docs/
source code
requirements.txt
package.json
.gitignore
```

---

# 12. Before Pushing to GitHub

Before the first public repository push, verify:

### Environment

```text
[ ] backend/.env exists locally
[ ] backend/.env is ignored
[ ] backend/.env.example contains only placeholders
```

### Credentials

```text
[ ] No real Gemini key exists in source code
[ ] No real Gemini key exists in README
[ ] No real Gemini key exists in documentation
[ ] No credentials exist in frontend files
```

### Generated Data

```text
[ ] backend/data/chroma/ is ignored
[ ] frontend/dist/ is ignored
[ ] node_modules/ is ignored
[ ] venv/ is ignored
```

### Repository

```text
[ ] README.md exists
[ ] docs/ exists
[ ] .gitignore exists
[ ] .env.example exists
```

---

# 13. If a Secret Is Accidentally Exposed

If an API credential is accidentally:

* pasted into a public repository,
* committed to Git,
* included in a screenshot,
* shared in a chat,
* or otherwise exposed,

the correct response is to:

1. Revoke the exposed credential.
2. Generate a replacement credential.
3. Update the local `.env`.
4. Verify the replacement works.
5. Remove the exposed credential from repository history when necessary.

Simply deleting the key from the latest file does not necessarily remove it from Git history.

---

# 14. Current Security Scope

DocIntel includes basic security-conscious design appropriate for its current portfolio-project scope:

* Server-side Gemini credentials
* Environment-based configuration
* Git secret protection
* File validation
* API error handling
* CORS configuration

However, DocIntel should **not** be described as a production-grade secure document platform.

Production deployment would require additional controls such as:

* Authentication
* Authorization
* User-specific document isolation
* Rate limiting
* Secure file storage
* Input hardening
* Monitoring
* Audit logging
* Secret management infrastructure
* HTTPS/TLS
* Infrastructure-level security controls

These are outside the current project scope.

---

# 15. Security Principle

The most important rule for DocIntel is:

> **Keep secrets and AI infrastructure on the backend; expose only the application API to the frontend.**
