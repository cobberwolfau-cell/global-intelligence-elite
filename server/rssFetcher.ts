/**
 * rssFetcher.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches and parses RSS feeds from multiple local news sources per country.
 * Fetches primary + all backup sources in parallel, then merges, deduplicates,
 * and sorts by publication time (newest first).
 *
 * Pipeline:
 *  1. Look up the country's sources in NEWS_SOURCE_MAP (primary + backups)
 *  2. Fetch all sources in parallel via HTTP
 *  3. Parse each XML → extract items (title, link, description, pubDate)
 *  4. Merge all results, deduplicate by URL, sort by publishedAt desc
 *  5. Filter: prefer local sources; only include international sources if no local articles found
 *  6. Return top N articles for use in AI prompts
 */

import { XMLParser } from "fast-xml-parser";
import { NEWS_SOURCE_MAP, type RssSource } from "./newsSourceMap";

export interface RssArticle {
  title: string;
  url: string;
  description: string | null;
  source: string;
  publishedAt: string;
  language: string;
  isLocal: boolean;  // true = from a country-specific local outlet
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

// International/global outlets that should only be used as fallback
const INTERNATIONAL_OUTLETS = new Set([
  "al jazeera",
  "bbc world",
  "bbc news world",
  "reuters",
  "associated press",
  "ap news",
  "cnn",
  "france 24",
  "dw",
  "deutsche welle",
  "npr",
  "npr news",
  "abc news australia",
  "rnz pacific",
  "rnz",
  "south china morning post",
  "scmp",
]);

function isInternationalOutlet(outletName: string): boolean {
  return INTERNATIONAL_OUTLETS.has(outletName.toLowerCase().trim());
}

/**
 * Fetch news articles from all of a country's RSS sources in parallel.
 * Results are merged, deduplicated by URL, and sorted newest-first.
 * Local outlets are preferred; international outlets only used if no local articles found.
 */
export async function fetchRssNews(
  country: string,
  maxItems = 10,
  customSources?: RssSource[]
): Promise<RssArticle[]> {
  // When customSources is provided (travel mode), skip the local-only filter
  // so global travel media (CNT, Fodors, etc.) are always included.
  const skipLocalFilter = customSources != null && customSources.length > 0;
  let allSources: RssSource[];
  if (skipLocalFilter) {
    allSources = customSources!;
  } else {
    const entry = NEWS_SOURCE_MAP[country];
    if (!entry) return [];
    // Collect all sources: primary first, then backups
    allSources = [entry.primary, ...entry.backups];
  }
  // Fetch all sources in parallel, tagging each article with isLocal flag
  // In travel mode: cap per-source items to 3 so global travel media also get representation
  const perSourceLimit = skipLocalFilter
    ? 3  // travel mode: at most 3 articles per source for balanced multi-source output
    : maxItems;
  const perSourceArticles = await Promise.all(
    allSources.map((src) => {
      const local = !isInternationalOutlet(src.outlet);
      return fetchAndParse(src.url, src.outlet, src.language, perSourceLimit, local);
    })
  );
  // Flatten all results
  const allArticles: RssArticle[] = perSourceArticles.flat();
  // Deduplicate by URL (keep first occurrence = primary source wins)
  const seen = new Set<string>();
  const unique: RssArticle[] = [];
  for (const article of allArticles) {
    const key = normalizeUrl(article.url);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(article);
    }
  }
  // Sort by publication date, newest first
  unique.sort((a, b) => {
    const ta = parseDate(a.publishedAt);
    const tb = parseDate(b.publishedAt);
    return tb - ta;
  });
  if (skipLocalFilter) {
    // Travel mode: include all sources (local + global travel media)
    return unique.slice(0, maxItems);
  }
  // News mode: prefer local articles; only include international if local is sparse
  const localArticles = unique.filter((a) => a.isLocal);
  const finalArticles = localArticles.length >= Math.ceil(maxItems / 2)
    ? localArticles  // enough local content — use only local
    : unique;        // fallback: include international if local is sparse
  return finalArticles.slice(0, maxItems);
}


// ── Internal helpers ───────────────────────────────────────────────────────

async function fetchAndParse(
  url: string,
  outletName: string,
  language: string,
  maxItems: number,
  isLocal = true
): Promise<RssArticle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const xml = await res.text();
    return parseRssXml(xml, outletName, language, maxItems, isLocal);
  } catch {
    return [];
  }
}

function parseRssXml(
  xml: string,
  outletName: string,
  language: string,
  maxItems: number,
  isLocalSource = true
): RssArticle[] {
  try {
    const parsed = XML_PARSER.parse(xml);

    // Handle RSS 2.0, Atom, and RDF formats
    const channel =
      parsed?.rss?.channel ??
      parsed?.["rdf:RDF"]?.channel ??
      parsed?.feed ??
      null;

    if (!channel) return [];

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
      const description =
        extractText(i.description) ??
        extractText(i.summary) ??
        null;
      const pubDate =
        extractText(i.pubDate) ??
        extractText(i.published) ??
        extractText(i.updated) ??
        new Date().toISOString();

      if (!title || !url) continue;

      articles.push({
        title: title.trim(),
        url: url.trim(),
        description: description
          ? description.replace(/<[^>]+>/g, "").trim().slice(0, 300)
          : null,
        source: outletName,
        publishedAt: pubDate,
        language,
        isLocal: isLocalSource,
      });
    }

    return articles;
  } catch {
    return [];
  }
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove trailing slash and common tracking params for dedup
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    return u.origin + u.pathname + u.search;
  } catch {
    return url;
  }
}

function parseDate(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
}

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
    if (obj.__cdata) return String(obj.__cdata);
    if (obj["#text"]) return String(obj["#text"]);
    if (obj._) return String(obj._);
  }
  return null;
}

function extractLink(item: Record<string, unknown>): string | null {
  const link = item.link;

  if (typeof link === "string" && link.startsWith("http")) return link;

  if (typeof link === "object" && link !== null) {
    const l = link as Record<string, unknown>;
    if (l["@_href"]) return String(l["@_href"]);
    if (l.__cdata) return String(l.__cdata);
    if (l["#text"]) return String(l["#text"]);
  }

  if (Array.isArray(link)) {
    for (const l of link) {
      if (typeof l === "string" && l.startsWith("http")) return l;
      if (typeof l === "object" && l !== null) {
        const lo = l as Record<string, unknown>;
        if (lo["@_href"]) return String(lo["@_href"]);
      }
    }
  }

  if (item["@_rdf:about"]) return String(item["@_rdf:about"]);

  const guid = extractText(item.guid);
  if (guid && guid.startsWith("http")) return guid;

  return null;
}
