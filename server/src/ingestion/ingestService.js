import { getParserForFile } from "../parsers/parserRegistry.js";
import { chunkDocument } from "./chunker.js";
import { createEmbeddingProvider } from "../embeddings/embeddingProvider.js";
import { createVectorStore } from "../vector/createVectorStore.js";

const EMBEDDING_BATCH_SIZE = 64;
const MAX_CONCURRENT_BATCHES = 3;

export async function ingestFiles(files) {
  const embeddingProvider = createEmbeddingProvider();
  const vectorStore = createVectorStore({ dimension: embeddingProvider.dimension });
  const summary = {
    filesReceived: files.length,
    documentsParsed: 0,
    chunksCreated: 0,
    chunksSkippedAsDuplicates: 0,
    chunksEmbedded: 0,
    errors: []
  };

  let pending = [];
  const activeBatches = [];
  const seenHashes = new Set();
  for (const file of files) {
    const parser = getParserForFile(file);
    if (!parser) {
      summary.errors.push({ file: file.originalname, error: "No parser matched this file" });
      continue;
    }

    try {
      for await (const document of parser.parse(file)) {
        summary.documentsParsed += 1;
        for (const chunk of chunkDocument(document)) {
          summary.chunksCreated += 1;
          if (seenHashes.has(chunk.contentHash) || await vectorStore.hasContentHash(chunk.contentHash)) {
            summary.chunksSkippedAsDuplicates += 1;
            continue;
          }

          seenHashes.add(chunk.contentHash);
          pending.push(chunk);
          if (pending.length >= EMBEDDING_BATCH_SIZE) {
            activeBatches.push(embedAndUpsert(pending, embeddingProvider, vectorStore));
            pending = [];
            if (activeBatches.length >= MAX_CONCURRENT_BATCHES) {
              summary.chunksEmbedded += await activeBatches.shift();
            }
          }
        }
      }
    } catch (error) {
      const detail =
        error?.data?.status?.error ||
        error?.data?.status?.reason ||
        (error?.data ? JSON.stringify(error.data) : null) ||
        error.message;
      console.error(`[ingest] Failed on ${file.originalname}:`, detail, error);
      summary.errors.push({ file: file.originalname, error: detail });
    }
  }

  if (pending.length) {
    activeBatches.push(embedAndUpsert(pending, embeddingProvider, vectorStore));
  }

  for (const batch of activeBatches) {
    summary.chunksEmbedded += await batch;
  }

  return summary;
}

async function embedAndUpsert(chunks, embeddingProvider, vectorStore) {
  const vectors = await withRetry(() => embeddingProvider.embedBatch(chunks.map((chunk) => chunk.chunkText)));
  await vectorStore.upsertChunks(chunks, vectors);
  return chunks.length;
}

async function withRetry(operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
}
