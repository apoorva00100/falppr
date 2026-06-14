import OpenAI from "openai";
import { env } from "../config/env.js";

export class OpenAIEmbeddingProvider {
  constructor() {
    this.client = new OpenAI({ apiKey: env.openaiApiKey });
    this.dimension = env.embeddingModel.includes("3-small") ? 1536 : 3072;
  }

  async embedBatch(texts) {
    const response = await this.client.embeddings.create({
      model: env.embeddingModel,
      input: texts
    });
    return response.data.map((item) => item.embedding);
  }
}
