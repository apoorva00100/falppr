import { Router } from "express";
import { answerQuestion } from "../rag/answerService.js";

export const chatRoutes = Router();

chatRoutes.post("/", async (req, res, next) => {
  try {
    const { message, filters } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const response = await answerQuestion(message, filters || {}, req.user.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
});
