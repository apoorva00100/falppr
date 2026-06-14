import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
  qdrantCollection: process.env.QDRANT_COLLECTION || "social_chunks",
  vectorStore: process.env.VECTOR_STORE || "qdrant",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
  chatModel: process.env.CHAT_MODEL || "gpt-4.1-mini"
};
