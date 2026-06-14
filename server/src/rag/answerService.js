import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { retrieveRelevantChunks } from "./retriever.js";
import { buildAnswerPrompt } from "./prompt.js";

export async function answerQuestion(message, filters) {
  const chunks = await retrieveRelevantChunks(message, filters);
  if (!chunks.length) {
    return {
      answer: "The ingested data is insufficient to answer that question.",
      citations: []
    };
  }

  const citations = chunks.map((chunk, index) => ({
    id: `citation-${index + 1}`,
    platform: chunk.platform,
    documentType: chunk.documentType,
    createdAt: chunk.createdAt,
    sourceFile: chunk.sourceFile,
    url: chunk.url,
    snippet: createSnippet(chunk.chunkText)
  }));

  const prompt = buildAnswerPrompt(message, chunks);
  const systemInstruction = "Answer only from the supplied context and cite bracketed chunk numbers.";

  if (env.openaiApiKey) {
    const client = new OpenAI({ apiKey: env.openaiApiKey });
    const completion = await client.chat.completions.create({
      model: env.chatModel,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });
    return {
      answer: completion.choices[0]?.message?.content || "The data is insufficient to answer that question.",
      citations
    };
  }

  if (env.geminiApiKey) {
    const client = new GoogleGenAI({ apiKey: env.geminiApiKey });
    const result = await client.models.generateContent({
      model: env.chatModel || "gemini-2.0-flash",
      contents: prompt,
      config: { systemInstruction, temperature: 0.2 }
    });
    return {
      answer: result.text || "The data is insufficient to answer that question.",
      citations
    };
  }

  return {
    answer: `Based on the retrieved export data, the strongest available evidence is: ${chunks.slice(0, 3).map((chunk, index) => `[${index + 1}] ${createSnippet(chunk.chunkText)}`).join(" ")}`,
    citations
  };
}

function createSnippet(text) {
  const compact = String(text || "").replace(/\s+/g, " ").trim();
  return compact.length > 240 ? `${compact.slice(0, 237)}...` : compact;
}
