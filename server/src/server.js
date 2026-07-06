import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { env } from "./config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve built React client (local dev / single-service deployments)
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(env.port, () => {
  console.log(`Social Data RAG server listening on ${env.port}`);
});
