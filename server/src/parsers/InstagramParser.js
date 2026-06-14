import * as cheerio from "cheerio";
import { BaseParser } from "./BaseParser.js";
import { asIsoDate, isUsefulContent, normalizeWhitespace, stableId } from "./parserUtils.js";

export class InstagramParser extends BaseParser {
  canParse(file) {
    const name = file.originalname.toLowerCase();
    return (name.endsWith(".json") || name.endsWith(".html")) && /instagram|profile|media|comment|caption/.test(name);
  }

  async *parse(file) {
    const name = file.originalname.toLowerCase();
    if (name.endsWith(".html")) {
      yield* this.parseHtml(file);
      return;
    }

    const parsed = JSON.parse(file.buffer.toString("utf8"));
    let index = 0;
    for (const item of collectInstagramItems(parsed)) {
      const content = normalizeWhitespace(item.content);
      if (!isUsefulContent(content)) continue;
      index += 1;

      yield {
        sourceId: stableId(["instagram", item.id || file.originalname, index]),
        platform: "instagram",
        documentType: item.type,
        author: item.author || null,
        content,
        createdAt: asIsoDate(item.createdAt),
        sourceFile: file.originalname,
        url: item.url || null,
        metadata: { index }
      };
    }
  }

  async *parseHtml(file) {
    const $ = cheerio.load(file.buffer.toString("utf8"));
    let index = 0;
    const bodyText = normalizeWhitespace($("body").text());
    for (const paragraph of bodyText.split(/\s{2,}|\n+/)) {
      const content = normalizeWhitespace(paragraph);
      if (!isUsefulContent(content)) continue;
      index += 1;
      yield {
        sourceId: stableId(["instagram", file.originalname, index]),
        platform: "instagram",
        documentType: "caption",
        author: null,
        content,
        createdAt: null,
        sourceFile: file.originalname,
        url: null,
        metadata: { index, parsedFrom: "html" }
      };
    }
  }
}

function collectInstagramItems(value) {
  const items = [];
  walk(value, (node) => {
    if (!node || typeof node !== "object") return;

    const stringMap = node.string_map_data || {};
    const title = valueFromStringMap(stringMap, ["Title", "Bio", "Caption", "Comment"]);
    const directText = node.title || node.caption || node.comment || node.text || node.value;
    const content = directText || title;
    if (!content) return;

    const lowerKeys = Object.keys(node).join(" ").toLowerCase();
    const type = lowerKeys.includes("bio") ? "profile" : lowerKeys.includes("comment") ? "comment" : "caption";

    items.push({
      content,
      type,
      id: node.media_id || node.id,
      author: node.username || null,
      createdAt: node.creation_timestamp ? Number(node.creation_timestamp) * 1000 : node.timestamp,
      url: node.uri || node.href || null
    });
  });
  return items;
}

function valueFromStringMap(map, names) {
  for (const name of names) {
    const value = map[name]?.value;
    if (value) return value;
  }
  return "";
}

function walk(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  for (const item of Object.values(value)) walk(item, visit);
}
