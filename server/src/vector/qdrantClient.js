import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../config/env.js";

export function createQdrantClient() {
  return new QdrantClient({ url: env.qdrantUrl });
}
