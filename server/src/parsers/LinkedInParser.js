import { parse } from "csv-parse";
import { Readable } from "stream";
import { BaseParser } from "./BaseParser.js";
import { asIsoDate, firstPresent, isUsefulContent, normalizeWhitespace, stableId } from "./parserUtils.js";

const LINKEDIN_TEXT_FIELDS = [
  "Text",
  "ShareCommentary",
  "Commentary",
  "Content",
  "Body",
  "Title",
  "Description"
];

export class LinkedInParser extends BaseParser {
  canParse(file) {
    const name = file.originalname.toLowerCase();
    return name.endsWith(".csv") && /linkedin|share|post|article|comment|profile/.test(name);
  }

  async *parse(file) {
    const stream = Readable.from(file.buffer).pipe(parse({
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true
    }));

    let rowIndex = 0;
    for await (const row of stream) {
      rowIndex += 1;
      const content = normalizeWhitespace(firstPresent(row, LINKEDIN_TEXT_FIELDS));
      if (!isUsefulContent(content)) continue;

      const sourceId = stableId([
        "linkedin",
        firstPresent(row, ["Id", "ID", "ShareLink", "Url", "URL"]),
        file.originalname,
        rowIndex
      ]);

      const url = firstPresent(row, ["ShareLink", "Url", "URL", "Permalink"]) || null;
      const typeHint = file.originalname.toLowerCase();

      yield {
        sourceId,
        platform: "linkedin",
        documentType: typeHint.includes("article") ? "article" : typeHint.includes("comment") ? "comment" : "post",
        author: firstPresent(row, ["Author", "Name", "First Name"]) || null,
        content,
        createdAt: asIsoDate(firstPresent(row, ["Date", "Created Date", "CreatedAt", "Published Date"])),
        sourceFile: file.originalname,
        url,
        metadata: { rowIndex }
      };
    }
  }
}
