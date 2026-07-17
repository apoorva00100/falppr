const points = [];

export class LocalVectorStore {
  constructor({ dimension }) {
    this.dimension = dimension;
  }

  async hasContentHash(contentHash, userId) {
    return points.some((point) => point.payload.userId === userId && point.payload.contentHash === contentHash);
  }

  async upsertChunks(chunks, vectors) {
    chunks.forEach((chunk, index) => {
      const payload = {
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        userId: chunk.userId,
        contentHash: chunk.contentHash,
        platform: chunk.platform,
        documentType: chunk.documentType,
        chunkText: chunk.chunkText,
        createdAt: chunk.createdAt,
        sourceFile: chunk.sourceFile,
        url: chunk.url,
        author: chunk.metadata.author || null,
        metadata: chunk.metadata
      };

      const existingIndex = points.findIndex((point) => point.payload.chunkId === chunk.chunkId);
      const point = { vector: vectors[index], payload };
      if (existingIndex >= 0) {
        points[existingIndex] = point;
      } else {
        points.push(point);
      }
    });
  }

  async search(vector, filters = {}, limit = 6, userId) {
    return points
      .filter((point) => point.payload.userId === userId && matchesFilters(point.payload, filters))
      .map((point) => ({
        score: cosineSimilarity(vector, point.vector),
        ...point.payload
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

function matchesFilters(payload, filters) {
  if (Array.isArray(filters.platform) && filters.platform.length && !filters.platform.includes(payload.platform)) {
    return false;
  }
  if (Array.isArray(filters.documentType) && filters.documentType.length && !filters.documentType.includes(payload.documentType)) {
    return false;
  }
  return true;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  return dot / ((Math.sqrt(normA) * Math.sqrt(normB)) || 1);
}
