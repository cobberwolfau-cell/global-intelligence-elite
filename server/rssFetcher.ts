/**
 * rssFetcher.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches and parses RSS feeds from local news sources for each country.
 * Uses fast-xml-parser for XML parsing.
 *
 * Pipeline:
 *  1. Look up the country's RSS source in NEWS_SOURCE_MAP
 *  2. Fetch the RSS XML via HTTP
 *  3. Parse XML → extract items (title, link, description, pubDate)
 *  4. Return structured NewsArticle[] for use in AI prompts
 */

import { XMLParser } from "fast-xml-parser";
import { NEWS_SOURCE_MAP } from "./newsSourceMap";

export interface RssArticle {
  title: string;
  url: string;
  description: string | null;
  source: string;
  publishedAt: string;
  language: string;
}

const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  allowBooleanAttributes: true,
});

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; GlobalIntelligenceBot/1.0; +https://globintel.manus.space)",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Fetch news articles from the country's local RSS feed.
 * Falls back to the fallback URL if the primary fails.
 */
export async function fetchRssNews(
  country: string,
  maxItems = 10
): Promise<RssArticle[]> {
  const source = NEWS_SOURCE_MAP[country];
  if (!source) return [];

  // Try primary URL first
  let articles = await fetchAndParse(source.rssUrl, source.outlet, source.language, maxItems);

  // Try fallback if primary returns nothing
  if (articles.length === 0 && source.fallbackUrl) {
    articles = await fetchAndParse(source.fallbackUrl, source.outlet, source.language, maxItems);
  }

  return articles;
}

async function fetchAndParse(
  url: string,
  outletName: string,
  language: string,
  maxItems: number
): Promise<RssArticle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const xml = await res.text();
    return parseRssXml(xml, outletName, language, maxItems);
  } catch {
    return [];
  }
}

function parseRssXml(
  xml: string,
  outletName: string,
  language: string,
  maxItems: number
): RssArticle[] {
  try {
    const parsed = XML_PARSER.parse(xml);

    // Handle both RSS 2.0 and Atom/RDF formats
    const channel =
      parsed?.rss?.channel ??
      parsed?.["rdf:RDF"]?.channel ??
      parsed?.feed ??
      null;

    if (!channel) return [];

    // RSS 2.0: items in channel.item
    // Atom: entries in feed.entry
    // RDF: items in rdf:RDF.item
    const rawItems: unknown[] =
      toArray(channel.item) ??
      toArray(parsed?.["rdf:RDF"]?.item) ??
      toArray(channel.entry) ??
      [];

    const articles: RssArticle[] = [];

    for (const item of rawItems.slice(0, maxItems)) {
      if (typeof item !== "object" || item === null) continue;
      const i = item as Record<string, unknown>;

      const title = extractText(i.title);
      const url = extractLink(i);
      const description = extractText(i.description) ?? extractText(i.summary) ?? null;
      const pubDate = extractText(i.pubDate) ?? extractText(i.published) ?? extractText(i.updated) ?? new Date().toISOString();

      if (!title || !url) continue;

      articles.push({
        title: title.trim(),
        url: url.trim(),
        description: description ? description.replace(/<[^>]+>/g, "").trim().slice(0, 300) : null,
        source: outletName,
        publishedAt: pubDate,
        language,
      });
    }

    return articles;
  } catch {
    return [];
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toArray(val: unknown): unknown[] | null {
  if (!val) return null;
  return Array.isArray(val) ? val : [val];
}

function extractText(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    // CDATA
    if (obj.__cdata) return String(obj.__cdata);
    // Atom <title type="text">
    if (obj["#text"]) return String(obj["#text"]);
    if (obj._) return String(obj._);
  }
  return null;
}

function extractLink(item: Record<string, unknown>): string | null {
  // RSS 2.0: <link>
  const link = item.link;
  if (typeof link === "string" && link.startsWith("http")) return link;

  // Atom: <link href="..."/>
  if (typeof link === "object" && link !== null) {
    const l = link as Record<string, unknown>;
    if (l["@_href"]) return String(l["@_href"]);
    if (l.__cdata) return String(l.__cdata);
    if (l["#text"]) return String(l["#text"]);
  }

  // Array of links (Atom can have multiple)
  if (Array.isArray(link)) {
    for (const l of link) {
      if (typeof l === "string" && l.startsWith("http")) return l;
      if (typeof l === "object" && l !== null) {
        const lo = l as Record<string, unknown>;
        if (lo["@_href"]) return String(lo["@_href"]);
      }
    }
  }

  // RDF: <rdf:about>
  if (item["@_rdf:about"]) return String(item["@_rdf:about"]);

  // Fallback: <guid> if it looks like a URL
  const guid = extractText(item.guid);
  if (guid && guid.startsWith("http")) return guid;

  return null;
}
