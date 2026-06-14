export function buildAnswerPrompt(question, chunks) {
  const context = chunks.map((chunk, index) => {
    return `[${index + 1}] ${chunk.platform} ${chunk.documentType} ${chunk.createdAt || "unknown date"} ${chunk.sourceFile}\n${chunk.chunkText}`;
  }).join("\n\n");

  return `You are answering questions about a person using only the provided social export context.
If the context does not support an answer, say the data is insufficient.
Every factual claim about the person's views must be grounded in one or more cited chunks.

Question: ${question}

Context:
${context}`;
}
