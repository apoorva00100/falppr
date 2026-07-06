import express from "express";
import cors from "cors";
import { ingestRoutes } from "./routes/ingestRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Unexpected server error"
  });
});

export default app;
