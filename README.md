# Social Data RAG

Social Data RAG ingests personal social media exports, normalizes authored text, embeds semantic chunks, stores them in Qdrant, and answers questions with citations from the source data. The most important architecture decisions are the parser registry, which keeps platform-specific export weirdness isolated; a single unified document and chunk schema, which keeps ingestion and retrieval platform-agnostic; and content-hash deduplication before embedding, which makes repeated imports cheaper.

At 10x data volume, the first bottleneck is the embedding pipeline and vector-store existence checks. Large exports increase parsing time, but embedding is usually the slowest and most expensive step. Qdrant can handle far more than a small demo, but repeated per-chunk duplicate checks would become a pressure point and should move toward batched hash lookups or a separate local metadata index.

To stay inside a 4 to 6 hour build window, this version cuts authentication, multi-user isolation, persistent background jobs, streaming chat responses, advanced reranking, OCR, and image/video understanding. The next things to build would be a durable import job table, progress events, richer parser fixtures, better JSON streaming for large archive files, and a reranker once the core retrieval path is stable.

To make the architecture 10x better, imports would move into a queue-backed worker, duplicate tracking would use a durable metadata database, parser coverage would be test-fixture driven, and retrieval would add hybrid search plus reranking. For production use, the app would also need accounts, authorization, encrypted export storage, observability, and a clear data deletion story.

## Stack

- `client/`: React + Vite upload and chat UI.
- `server/`: Node.js + Express ingestion, vector, and RAG API.
- Vector store: Qdrant.
- Embeddings/chat: OpenAI when `OPENAI_API_KEY` is set, deterministic local fallbacks otherwise.

## Setup

Install dependencies:

```bash
npm install
```

Start Qdrant:

```bash
docker run -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

Create `server/.env`:

```text
PORT=5000
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=social_chunks
VECTOR_STORE=qdrant
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4.1-mini
```

If Docker is not installed, use the in-process development store instead:

```text
VECTOR_STORE=memory
```

Memory mode is useful for local testing, but it resets whenever the server restarts. Qdrant is still the recommended store for persistent imports and metadata-aware retrieval.

Run the app:

```bash
npm run dev
```

The client runs at `http://localhost:5173` and the server runs at `http://localhost:5000`.

## Example Flow

1. Export your LinkedIn, Twitter/X, or Instagram data.
2. Open the client and upload one or more CSV, JSON, or HTML files.
3. Review the ingestion summary for parsed documents, created chunks, skipped duplicates, and embedded chunks.
4. Ask a question such as `What does this person think about remote work?`.
5. Read the grounded answer and inspect citations under the assistant message.

## API

`GET /api/health`

```json
{ "ok": true }
```

`POST /api/ingest`

Multipart form field: `files`.

`POST /api/chat`

```json
{
  "message": "What does this person think about remote work?",
  "filters": {
    "platform": ["linkedin", "twitter"],
    "documentType": ["post", "tweet"]
  }
}
```

## Parser Tradeoffs

CSV parsing is stream-based. JSON and HTML parser modules are isolated behind the same async iterator interface, but this first version reads those uploaded files into memory because export shapes vary widely. The isolation keeps the downstream ingestion, chunking, embedding, vector, and chat code unchanged when a streaming JSON parser is added later.
