import { env } from "../config/env.js";

const GEMINI_EMBED_BASE = `https://generativelanguage.googleapis.com/v1/models`;

export class GeminiEmbeddingProvider {
  constructor() {
    this.dimension = 3072;
  }

  async embedBatch(texts) {
    const vectors = [];
    for (const text of texts) {
      vectors.push(await embedOne(text));
    }
    return vectors;
  }
}

async function embedOne(text) {
  const url = `${GEMINI_EMBED_BASE}/${env.embeddingModel}:embedContent?key=${env.geminiApiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `Gemini embed failed: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding.values;
}
