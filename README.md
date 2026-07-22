# Memex

> *Ask yourself what you've been up to for 5 years.*

Memex is a personal knowledge base that ingests your social media exports and lets you have a conversation with them. Upload your LinkedIn posts, Twitter/X archive, or Instagram data — then ask questions and get grounded, cited answers pulled from your own words.

---

## Features

- **Multi-platform import** — LinkedIn (CSV), Twitter/X (JSON), Instagram (JSON/HTML)
- **Semantic search** — vector embeddings over your own content, not keyword matching
- **Cited answers** — every response links back to the exact post, tweet, or caption it came from
- **Content-hash deduplication** — identical chunks are never re-embedded, even across multiple imports
- **Pluggable LLMs** — Groq, OpenAI, Gemini with automatic priority fallback
- **Pluggable embeddings** — OpenAI, Gemini, or a local deterministic fallback that needs no API key
- **Dev-friendly** — in-memory vector store works out of the box; Qdrant for production
- **Chat history** — Library tab stores every Q&A session, grouped by date with expandable citations
- **Dark UI** — black and orange theme with a cursor-following gradient glow

---

## Overview

Social media archives are a goldmine of personal history — career milestones, opinions, creative output — but they're locked inside unstructured CSV and JSON files that nobody ever opens again.

Memex turns those exports into a conversational knowledge base:

```
Export your data  →  Import into Memex  →  Ask anything  →  Get cited answers
```

Every answer is grounded in your actual content and cites the source post so you can verify it.

---

## Architectural Design & Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Lucide React |
| Backend | Node.js, Express, ES Modules |
| Vector DB | Qdrant (production) / LocalVectorStore in-memory (development) |
| Embeddings | OpenAI `text-embedding-3-small` · Gemini `gemini-embedding-001` · Local SHA256 deterministic (384-dim) |
| LLM | Groq `llama-3.3-70b-versatile` · OpenAI `gpt-4.1-mini` · Gemini `gemini-2.0-flash` |
| Parsers | `csv-parse` (streaming) · `cheerio` (HTML) · native JSON |
| File upload | `multer` |
| Config | `dotenv`, `cors` |

### High-level Architecture

```
Browser (React SPA)
       │
       │  POST /api/ingest   POST /api/chat
       ▼
  Express Server
       │
  ┌────┴────────────────────────────────┐
  │                                     │
  Ingestion Pipeline              RAG Pipeline
  │                                     │
  Parser Registry                  Retriever
  (LinkedIn / Twitter / Instagram)  (embed query → vector search)
  │                                     │
  Chunker + Deduplication          Answer Service
  │                                (LLM + citations)
  Embedding Provider               │
  (OpenAI / Gemini / Local)        │
  │                                 │
  └──────────► Vector Store ◄───────┘
               (Qdrant / Memory)
```


---

## Ingestion Pipeline

When you upload files, Memex runs them through a multi-stage pipeline:

```
1. Upload (multer)
        │
2. Parser Registry
   ├── LinkedInParser  (CSV with linkedin/share/post/article in filename)
   ├── TwitterParser   (JSON with twitter/tweet/x_archive in filename)
   └── InstagramParser (JSON or HTML with instagram in filename)
        │
3. Normalised Document
   { sourceId, platform, documentType, author, content, createdAt, url }
        │
4. Chunker  (max 1800 chars, splits on paragraph → sentence boundaries)
        │
5. Deduplication
   ├── In-memory SHA256 Set  (within this import)
   └── Vector store lookup   (across past imports)
        │
6. Batch Embedding  (64 chunks / batch · 3 concurrent · exponential backoff)
        │
7. Upsert to Vector Store
```

All parsers implement a common async iterator interface so the chunking, dedup, and embedding stages are completely platform-agnostic.

---

## Vector Knowledge Base

Each chunk stored in the vector store carries:

| Field | Description |
|---|---|
| `chunkId` | SHA256(sourceId + index + contentHash) |
| `contentHash` | SHA256(text) — used for deduplication |
| `chunkText` | The raw text of the chunk |
| `platform` | `linkedin` / `twitter` / `instagram` |
| `documentType` | `post` / `tweet` / `article` / `reply` / `caption` / `profile` |
| `sourceFile` | Original filename |
| `url` | Link back to the original post (where available) |
| `createdAt` | ISO 8601 timestamp |
| `tokenEstimate` | `ceil(length / 4)` |

**Qdrant (production):** cosine distance, auto-created collection, payload indexes on `platform`, `documentType`, `contentHash`, and `createdAt` for fast filtered search.

**LocalVectorStore (development):** pure in-memory cosine similarity — no Docker, no setup. Resets on server restart.

---

## Retrieval-Augmented Generation (RAG)

```
User question
     │
1. Embed question  (same provider used during ingestion)
     │
2. Vector search   (top 6 chunks, optional platform / docType filters)
     │
3. Build prompt
   ┌──────────────────────────────────────────────────────┐
   │ System: "Answer only from the supplied context and   │
   │          cite bracketed chunk numbers."              │
   │                                                      │
   │ [1] linkedin · post · 2024-03-15                     │
   │     "Remote work changed everything for me…"         │
   │                                                      │
   │ [2] linkedin · article · 2023-11-02                  │
   │     …                                                │
   │                                                      │
   │ Question: What does this person think about          │
   │           remote work?                               │
   └──────────────────────────────────────────────────────┘
     │
4. LLM (temperature 0.2)
   Priority: OpenAI → Gemini → Groq (auto-fallback on quota / 429)
     │
5. Response  { answer: string, citations: Citation[] }
```

Citations include platform, documentType, createdAt, sourceFile, url, and a 240-character snippet.

---

## Efficiency Considerations

| Concern | Solution |
|---|---|
| Large CSV files | Streaming parser via `csv-parse` — constant memory regardless of file size |
| Re-embedding cost | Dual-layer dedup: in-memory hash Set (same import) + DB lookup (past imports) |
| Embedding API rate limits | Batched requests: 64 chunks per batch, max 3 concurrent, retry with exponential backoff (0.5 s / 1 s / 1.5 s) |
| Filtered vector search speed | Payload indexes on `platform`, `documentType`, `contentHash`, `createdAt` in Qdrant |
| Zero-infrastructure dev | `VECTOR_STORE=memory` uses an in-memory cosine-similarity store — no Docker required |

---

## Trade-offs

| Trade-off | Current behaviour | Impact |
|---|---|---|
| Synchronous imports | Large uploads block the HTTP request until complete | Limits practical file size; no progress streaming |
| In-memory dev store | Resets on every server restart | Must re-import after each dev restart |
| No auth | Single-user only; all data is in one collection | Not suitable for multi-user deployment |
| JSON/HTML in memory | Full file loaded before parsing (unlike streaming CSV) | Memory spike on very large JSON archives |
| No reranking | Top-6 by cosine similarity only | Occasional relevance misses on ambiguous queries |

---

## Future Improvements

- **Async import queue** — background worker with real-time progress updates via SSE or WebSocket
- **Persistent dedup DB** — SQLite/Postgres metadata store so dedup survives server restarts without Qdrant
- **Hybrid search** — combine semantic (vector) with BM25 keyword scoring for better recall
- **Reranking layer** — cross-encoder reranker on the top-20 candidates before passing to LLM
- **Streaming chat** — stream LLM tokens to the client instead of waiting for the full response
- **User accounts** — per-user collections with encryption at rest
- **OCR & media** — extract text from images and video transcripts inside archives
- **More parsers** — Medium, Substack, GitHub activity, YouTube comments

---

## Example Queries

```
"What does this person think about remote work?"
"Summarize my career progression over the last 3 years."
"What topics do I tweet about most?"
"What articles did I share about AI in 2023?"
"Have I ever written about burnout or mental health?"
"What were my most engaged posts on LinkedIn?"
"What side projects have I mentioned over the years?"
```

---

## Screenshots

> Add screenshots here of:
> - Landing page (hero + mockup side by side)
> - Chat page with a question and cited answer
> - Library tab showing history grouped by date
> - Import page after a successful ingest

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com) (or OpenAI / Gemini)

### Install & run

```bash
git clone <repo>
cd falpper
npm install
```

Create `server/.env`:

```env
PORT=5000
VECTOR_STORE=memory
GROQ_API_KEY=gsk_...
CHAT_MODEL=llama-3.3-70b-versatile
```

```bash
npm run dev
```

Opens on `http://localhost:5173`. The server runs on `http://localhost:5000`.

### Production (with Qdrant)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Update `server/.env`:

```env
VECTOR_STORE=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=social_chunks
```

### API

```
GET  /api/health
POST /api/ingest    multipart/form-data · field: "files"
POST /api/chat      { message: string, filters?: { platform?: string[], documentType?: string[] } }
```

---

## Why This Project Matters

Your social media history is a detailed, timestamped record of how your thinking has evolved — your professional opinions, creative experiments, the ideas you championed and the ones you walked back. But once exported, that data sits in a zip file and is never read again.

Memex changes that. It treats your archive not as a data export but as a personal knowledge base — something you can interrogate, reflect on, and learn from. It's a memory layer over your own digital footprint, powered entirely by your own words.
