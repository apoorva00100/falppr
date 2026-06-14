import { env } from "../config/env.js";
import { LocalVectorStore } from "./localVectorStore.js";
import { VectorStore } from "./vectorStore.js";

export function createVectorStore(options) {
  if (env.vectorStore === "memory") {
    return new LocalVectorStore(options);
  }
  return new VectorStore(options);
}
