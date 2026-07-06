import { BaseParser } from "./BaseParser.js";
import { isUsefulContent, normalizeWhitespace, stableId } from "./parserUtils.js";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|bmp)$/i;

// Lazy-load tesseract — gracefully unavailable in serverless environments
// where native @napi-rs/canvas binaries are not present (e.g. Vercel).
let _recognize = null;
async function getRecognize() {
  if (_recognize) return _recognize;
  try {
    const mod = await import("tesseract.js");
    _recognize = (mod.default || mod).recognize;
    return _recognize;
  } catch {
    return null;
  }
}

export class ImageParser extends BaseParser {
  canParse(file) {
    return IMAGE_EXTENSIONS.test(file.originalname);
  }

  async *parse(file) {
    const recognize = await getRecognize();
    if (!recognize) {
      console.warn("tesseract.js unavailable in this environment — skipping image OCR");
      return;
    }
    try {
      const { data } = await recognize(file.buffer, "eng");
      const content = normalizeWhitespace(data.text);
      if (!isUsefulContent(content)) return;

      yield {
        sourceId: stableId(["image", file.originalname]),
        platform: "image",
        documentType: "image",
        author: null,
        content,
        createdAt: null,
        sourceFile: file.originalname,
        url: null,
        metadata: { ocrConfidence: data.confidence }
      };
    } catch (err) {
      console.warn(`Image OCR failed for ${file.originalname}: ${err.message}`);
    }
  }
}
