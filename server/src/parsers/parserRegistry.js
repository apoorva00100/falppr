import { LinkedInParser } from "./LinkedInParser.js";
import { TwitterParser } from "./TwitterParser.js";
import { InstagramParser } from "./InstagramParser.js";
import { PdfParser } from "./PdfParser.js";
import { ImageParser } from "./ImageParser.js";

const parsers = [
  new LinkedInParser(),
  new TwitterParser(),
  new InstagramParser(),
  new PdfParser(),
  // ImageParser requires tesseract.js (@napi-rs/canvas) — skip on Vercel serverless
  ...(process.env.VERCEL ? [] : [new ImageParser()]),
];

export function getParserForFile(file) {
  return parsers.find((parser) => parser.canParse(file)) || null;
}
