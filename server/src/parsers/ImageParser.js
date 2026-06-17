import Tesseract from "tesseract.js";
const { recognize } = Tesseract;
import { BaseParser } from "./BaseParser.js";
import { isUsefulContent, normalizeWhitespace, stableId } from "./parserUtils.js";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|bmp)$/i;

export class ImageParser extends BaseParser {
  canParse(file) {
    return IMAGE_EXTENSIONS.test(file.originalname);
  }

  async *parse(file) {
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
  }
}
