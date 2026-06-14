import { LinkedInParser } from "./LinkedInParser.js";
import { TwitterParser } from "./TwitterParser.js";
import { InstagramParser } from "./InstagramParser.js";

const parsers = [
  new LinkedInParser(),
  new TwitterParser(),
  new InstagramParser()
];

export function getParserForFile(file) {
  return parsers.find((parser) => parser.canParse(file)) || null;
}
