import { env } from "../config/env.js";
import { OpenAIEmbeddingProvider } from "./openAIEmbeddingProvider.js";
import { GeminiEmbeddingProvider } from "./geminiEmbeddingProvider.js";
import { sha256 } from "../ingestion/hashing.js";

export function createEmbeddingProvider() {
  if (env.openaiApiKey) {
    return new OpenAIEmbeddingProvider();
  }
  if (env.geminiApiKey) {
    return new GeminiEmbeddingProvider();
  }
  return new LocalEmbeddingProvider();
}

class LocalEmbeddingProvider {
  constructor() {
    this.dimension = 384;
  }

  async embedBatch(texts) {
    return texts.map((text) => deterministicVector(text, this.dimension));
  }
}

function deterministicVector(text, dimension) {
  const vector = new Array(dimension).fill(0);
  const tokens = String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const token of tokens) {
    const hash = sha256(token);
    const index = parseInt(hash.slice(0, 8), 16) % dimension;
    vector[index] += 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}
