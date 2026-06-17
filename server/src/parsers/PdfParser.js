import { getDocument, VerbosityLevel } from "pdfjs-dist/legacy/build/pdf.mjs";
import { BaseParser } from "./BaseParser.js";
import { isUsefulContent, normalizeWhitespace, stableId } from "./parserUtils.js";

export class PdfParser extends BaseParser {
  canParse(file) {
    return file.originalname.toLowerCase().endsWith(".pdf");
  }

  async *parse(file) {
    const loadingTask = getDocument({
      data: new Uint8Array(file.buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      verbosity: VerbosityLevel.ERRORS
    });
    const doc = await loadingTask.promise;
    try {
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const content = normalizeWhitespace(textContent.items.map((item) => item.str).join(" "));
        if (!isUsefulContent(content)) continue;

        yield {
          sourceId: stableId(["pdf", file.originalname, pageNumber]),
          platform: "pdf",
          documentType: "document",
          author: null,
          content,
          createdAt: null,
          sourceFile: file.originalname,
          url: null,
          metadata: { page: pageNumber, totalPages: doc.numPages }
        };
      }
    } finally {
      await loadingTask.destroy();
    }
  }
}
