import { sha256 } from "./hashing.js";

const MAX_CHARS = 1800;

export function chunkDocument(document) {
  const parts = semanticParts(document);
  return parts.map((text, index) => {
    const contentHash = sha256(text);
    return {
      chunkId: sha256(`${document.sourceId}:${index}:${contentHash}`),
      documentId: document.sourceId,
      contentHash,
      platform: document.platform,
      documentType: document.documentType,
      chunkText: text,
      createdAt: document.createdAt,
      sourceFile: document.sourceFile,
      url: document.url,
      metadata: {
        ...document.metadata,
        chunkIndex: index,
        author: document.author,
        tokenEstimate: Math.ceil(text.length / 4)
      }
    };
  });
}

function semanticParts(document) {
  if (document.documentType !== "article" && document.content.length <= MAX_CHARS) {
    return [document.content];
  }

  const paragraphs = document.content
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if ((current + " " + paragraph).trim().length > MAX_CHARS && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = `${current} ${paragraph}`.trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [document.content.slice(0, MAX_CHARS)];
}
