import { createQdrantClient } from "./qdrantClient.js";
import { env } from "../config/env.js";

export class VectorStore {
  constructor({ dimension }) {
    this.client = createQdrantClient();
    this.collection = env.qdrantCollection;
    this.dimension = dimension;
    this.ready = false;
  }

  async ensureCollection() {
    if (this.ready) return;
    const collections = await this.client.getCollections();
    const exists = collections.collections.some((item) => item.name === this.collection);
    if (!exists) {
      await this.client.createCollection(this.collection, {
        vectors: { size: this.dimension, distance: "Cosine" }
      });
      await this.createPayloadIndexes();
    }
    this.ready = true;
  }

  async createPayloadIndexes() {
    for (const field of ["platform", "documentType", "createdAt", "contentHash"]) {
      try {
        await this.client.createPayloadIndex(this.collection, {
          field_name: field,
          field_schema: field === "createdAt" ? "datetime" : "keyword"
        });
      } catch (error) {
        if (!String(error.message).includes("already exists")) throw error;
      }
    }
  }

  async hasContentHash(contentHash) {
    await this.ensureCollection();
    const result = await this.client.scroll(this.collection, {
      limit: 1,
      filter: matchAny("contentHash", [contentHash]),
      with_payload: false,
      with_vector: false
    });
    return result.points.length > 0;
  }

  async upsertChunks(chunks, vectors) {
    await this.ensureCollection();
    const points = chunks.map((chunk, index) => ({
      id: hashToUuid(chunk.chunkId),
      vector: vectors[index],
      payload: {
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        contentHash: chunk.contentHash,
        platform: chunk.platform,
        documentType: chunk.documentType,
        chunkText: chunk.chunkText,
        createdAt: chunk.createdAt,
        sourceFile: chunk.sourceFile,
        url: chunk.url,
        author: chunk.metadata.author || null,
        metadata: chunk.metadata
      }
    }));
    await this.client.upsert(this.collection, { points });
  }

  async search(vector, filters = {}, limit = 6) {
    await this.ensureCollection();
    const filter = buildFilter(filters);
    const result = await this.client.search(this.collection, {
      vector,
      limit,
      filter,
      with_payload: true
    });
    return result.map((item) => ({
      score: item.score,
      ...item.payload
    }));
  }
}

export function buildFilter(filters = {}) {
  const must = [];
  if (Array.isArray(filters.platform) && filters.platform.length) {
    must.push(matchAny("platform", filters.platform));
  }
  if (Array.isArray(filters.documentType) && filters.documentType.length) {
    must.push(matchAny("documentType", filters.documentType));
  }
  return must.length ? { must } : undefined;
}

function matchAny(key, values) {
  return { key, match: { any: values } };
}

function hashToUuid(hash) {
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}
