import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../config/env.js";

export function createQdrantClient() {
  const opts = { url: env.qdrantUrl };
  if (env.qdrantApiKey) opts.apiKey = env.qdrantApiKey;
  return new QdrantClient(opts);
}
