import { Router } from "express";
import multer from "multer";
import { ingestFiles } from "../ingestion/ingestService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 75 * 1024 * 1024 }
});

export const ingestRoutes = Router();

ingestRoutes.post("/", upload.array("files"), async (req, res, next) => {
  try {
    const summary = await ingestFiles(req.files || [], req.user.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});
