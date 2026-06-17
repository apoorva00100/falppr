import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ingestRoutes } from "./routes/ingestRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { env } from "./config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/chat", chatRoutes);

// Serve built React client (production)
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Unexpected server error"
  });
});

app.listen(env.port, () => {
  console.log(`Social Data RAG server listening on ${env.port}`);
});
