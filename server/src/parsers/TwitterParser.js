import { BaseParser } from "./BaseParser.js";
import { asIsoDate, isUsefulContent, normalizeWhitespace, stableId } from "./parserUtils.js";

export class TwitterParser extends BaseParser {
  canParse(file) {
    const name = file.originalname.toLowerCase();
    return name.endsWith(".json") && /twitter|tweet|x_archive|account/.test(name);
  }

  async *parse(file) {
    const raw = file.buffer.toString("utf8").replace(/^window\.[^=]+=\s*/, "");
    const parsed = JSON.parse(raw);
    const tweets = collectTweets(parsed);
    const profile = collectProfile(parsed);

    if (profile?.bio && isUsefulContent(profile.bio)) {
      yield {
        sourceId: stableId(["twitter", "profile", profile.handle || file.originalname]),
        platform: "twitter",
        documentType: "profile",
        author: profile.handle || null,
        content: normalizeWhitespace(profile.bio),
        createdAt: null,
        sourceFile: file.originalname,
        url: profile.handle ? `https://x.com/${profile.handle.replace(/^@/, "")}` : null,
        metadata: { name: profile.name || null }
      };
    }

    for (const tweet of tweets) {
      const text = normalizeWhitespace(tweet.full_text || tweet.text || tweet.tweetText);
      if (!isUsefulContent(text)) continue;
      if (tweet.retweeted_status || /^RT @/.test(text)) continue;

      const id = tweet.id_str || tweet.id || tweet.tweet_id;
      const handle = tweet.screen_name || tweet.username || profile?.handle || null;

      yield {
        sourceId: stableId(["twitter", id || text.slice(0, 40)]),
        platform: "twitter",
        documentType: tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ? "reply" : "tweet",
        author: handle,
        content: text,
        createdAt: asIsoDate(tweet.created_at || tweet.createdAt),
        sourceFile: file.originalname,
        url: id && handle ? `https://x.com/${String(handle).replace(/^@/, "")}/status/${id}` : null,
        metadata: { id }
      };
    }
  }
}

function collectTweets(value) {
  const results = [];
  walk(value, (node) => {
    const tweet = node?.tweet || node;
    if (tweet && typeof tweet === "object" && (tweet.full_text || tweet.text || tweet.tweetText)) {
      results.push(tweet);
    }
  });
  return results;
}

function collectProfile(value) {
  let profile = null;
  walk(value, (node) => {
    const account = node?.account || node?.profile || node;
    const bio = account?.bio || account?.description || account?.accountDisplayName;
    if (!profile && bio) {
      profile = {
        bio,
        handle: account.username || account.accountId || account.screen_name,
        name: account.name || account.accountDisplayName
      };
    }
  });
  return profile;
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
