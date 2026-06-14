import { createEmbeddingProvider } from "../embeddings/embeddingProvider.js";
import { createVectorStore } from "../vector/createVectorStore.js";

export async function retrieveRelevantChunks(question, filters) {
  const embeddingProvider = createEmbeddingProvider();
  const vectorStore = createVectorStore({ dimension: embeddingProvider.dimension });
  const [queryVector] = await embeddingProvider.embedBatch([question]);
  return vectorStore.search(queryVector, filters, 6);
}
