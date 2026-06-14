import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

export class GeminiEmbeddingProvider {
  constructor() {
    this.client = new GoogleGenAI({ apiKey: env.geminiApiKey });
    this.dimension = 768;
  }

  async embedBatch(texts) {
    const results = await Promise.all(
      texts.map((text) =>
        this.client.models.embedContent({
          model: env.embeddingModel || "text-embedding-004",
          contents: text
        })
      )
    );
    return results.map((result) => result.embeddings[0].values);
  }
}
