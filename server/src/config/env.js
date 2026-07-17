import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
  qdrantApiKey: process.env.QDRANT_API_KEY || "",
  qdrantCollection: process.env.QDRANT_COLLECTION || "social_chunks",
  vectorStore: process.env.VECTOR_STORE || "qdrant",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  embeddingModel: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
  chatModel: process.env.CHAT_MODEL || "gemini-2.0-flash",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
  sessionSecret: process.env.SESSION_SECRET || "",
  isProduction: process.env.NODE_ENV === "production"
};
