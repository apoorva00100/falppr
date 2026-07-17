import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ingestRoutes } from "./routes/ingestRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { requireAuth } from "./auth/authMiddleware.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ingest", requireAuth, ingestRoutes);
app.use("/api/chat", requireAuth, chatRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Unexpected server error"
  });
});

export default app;
