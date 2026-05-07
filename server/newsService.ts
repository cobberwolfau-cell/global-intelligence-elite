import { ENV } from "./_core/env";

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
}

// Map country IDs to English country names for search queries
const COUNTRY_NAME_MAP: Record<string, string> = {
  Taiwan: "Taiwan",
  HongKong: "Hong Kong",
  Macau: "Macau",
  China: "China",
  Japan: "Japan",
  SouthKorea: "Korea",
  NorthKorea: "North Korea",
  Singapore: "Singapore",
  Malaysia: "Malaysia",
  Thailand: "Thailand",
  Philippines: "Philippines",
  Vietnam: "Vietnam",
  Indonesia: "Indonesia",
  India: "India",
  Pakistan: "Pakistan",
  Bangladesh: "Bangladesh",
  SriLanka: "Sri Lanka",
  Myanmar: "Myanmar",
  Cambodia: "Cambodia",
  Laos: "Laos",
  Mongolia: "Mongolia",
  Kazakhstan: "Kazakhstan",
  Uzbekistan: "Uzbekistan",
  Israel: "Israel",
  SaudiArabia: "Saudi Arabia",
  UAE: "UAE",
  Iran: "Iran",
  Iraq: "Iraq",
  Turkey: "Turkey",
  Australia: "Australia",
  NewZealand: "New Zealand",
  PapuaNewGuinea: "Papua New Guinea",
  Fiji: "Fiji",
  SolomonIslands: "Solomon Islands",
  US: "United States",
  Canada: "Canada",
  Mexico: "Mexico",
  Brazil: "Brazil",
  Argentina: "Argentina",
  Chile: "Chile",
  Colombia: "Colombia",
  Peru: "Peru",
  Venezuela: "Venezuela",
  Cuba: "Cuba",
  Panama: "Panama",
  Ecuador: "Ecuador",
  UK: "United Kingdom",
  Germany: "Germany",
  France: "France",
  Italy: "Italy",
  Spain: "Spain",
  Netherlands: "Netherlands",
  Belgium: "Belgium",
  Switzerland: "Switzerland",
  Sweden: "Sweden",
  Norway: "Norway",
  Denmark: "Denmark",
  Finland: "Finland",
  Poland: "Poland",
  Ukraine: "Ukraine",
  Russia: "Russia",
  Greece: "Greece",
  Portugal: "Portugal",
  Austria: "Austria",
  CzechRepublic: "Czech Republic",
  Hungary: "Hungary",
  Romania: "Romania",
  Egypt: "Egypt",
  Nigeria: "Nigeria",
  SouthAfrica: "South Africa",
  Kenya: "Kenya",
  Ethiopia: "Ethiopia",
  Ghana: "Ghana",
  Tanzania: "Tanzania",
  Morocco: "Morocco",
  Algeria: "Algeria",
  Libya: "Libya",
  Sudan: "Sudan",
  DRC: "Congo",
  Angola: "Angola",
  Mozambique: "Mozambique",
  Global: "world",
};

/**
 * Language strategy per country:
 * - "zh": Chinese (Traditional/Simplified) — Taiwan, HK, Macau, China, Singapore
 * - "ko": Korean — South Korea, North Korea
 * - "ja": Japanese — Japan (NOTE: NewsAPI free tier returns 0 results for ja filter,
 *         so Japan falls back to no-language filter which naturally includes Japanese media)
 * - "en": English fallback for all other countries
 * - null: No language filter (returns mixed-language results, used for Japan)
 */
const COUNTRY_LANGUAGE_MAP: Record<string, string | null> = {
  Taiwan: "zh",
  HongKong: "zh",
  Macau: "zh",
  China: "zh",
  Singapore: "zh",
  SouthKorea: "ko",
  NorthKorea: "ko",
  Japan: null,   // NewsAPI free tier doesn't support 'ja' filter; no-filter returns Japanese media naturally
};

// Map intel categories to additional search keywords
const CATEGORY_KEYWORD_MAP: Record<string, string> = {
  local: "",              // country name only
  globalnews: "news",
  economy: "economy finance",
  military: "military defense",
  technology: "technology AI",
  risk: "crisis conflict",
  travel: "travel tourism",
  equities: "stock market",
  metals: "gold silver",
  energy: "oil energy",
  forex: "currency exchange",
  bonds: "bonds treasury",
  crypto: "cryptocurrency bitcoin",
};

/**
 * Fetch real news articles from NewsAPI based on country and category.
 *
 * Language strategy:
 * - Chinese-speaking regions (TW/HK/MO/CN/SG): fetch zh first, fall back to en
 * - Korean-speaking regions (KR/KP): fetch ko first, fall back to en
 * - Japan: no language filter (NewsAPI free tier doesn't support 'ja'; query naturally returns Japanese media)
 * - All others: fetch en only
 */
export async function fetchNews(
  country: string,
  category: string,
  pageSize = 10
): Promise<NewsArticle[]> {
  const apiKey = ENV.newsApiKey;
  if (!apiKey) return [];

  const countryName = COUNTRY_NAME_MAP[country] ?? country;
  const keyword = CATEGORY_KEYWORD_MAP[category] ?? "";

  // Build search query: combine country name with optional category keyword
  const q = keyword
    ? `${countryName} ${keyword}`
    : countryName;

  // Use last 7 days for freshness
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Determine language strategy
  const hasExplicitLanguage = Object.prototype.hasOwnProperty.call(COUNTRY_LANGUAGE_MAP, country);
  const preferredLang = hasExplicitLanguage ? COUNTRY_LANGUAGE_MAP[country] : "en";

  if (preferredLang !== null && preferredLang !== undefined && preferredLang !== "en") {
    // Try preferred local language first (zh or ko)
    const localUrl = buildUrl(q, preferredLang, from, pageSize, apiKey);
    const localArticles = await fetchFromUrl(localUrl);
    if (localArticles.length > 0) return localArticles;
    // Fall back to English if local language returns nothing
    const enUrl = buildUrl(q, "en", from, pageSize, apiKey);
    return fetchFromUrl(enUrl);
  }

  if (preferredLang === null) {
    // No language filter (Japan): returns mixed results naturally including local media
    const noLangUrl = buildUrl(q, null, from, pageSize, apiKey);
    return fetchFromUrl(noLangUrl);
  }

  // Default: English only
  const enUrl = buildUrl(q, "en", from, pageSize, apiKey);
  return fetchFromUrl(enUrl);
}

function buildUrl(
  q: string,
  language: string | null,
  from: string,
  pageSize: number,
  apiKey: string
): string {
  const params = new URLSearchParams({
    q,
    from,
    sortBy: "publishedAt",
    pageSize: String(pageSize),
    apiKey,
  });
  if (language) params.set("language", language);
  return `https://newsapi.org/v2/everything?${params.toString()}`;
}

async function fetchFromUrl(url: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json() as {
      status: string;
      articles: Array<{
        title: string;
        description: string | null;
        url: string;
        source: { name: string };
        publishedAt: string;
      }>;
    };

    if (data.status !== "ok" || !Array.isArray(data.articles)) return [];

    return data.articles
      .filter(a => a.title && a.title !== "[Removed]" && a.url)
      .map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source?.name ?? "Unknown",
        publishedAt: a.publishedAt,
      }));
  } catch {
    return [];
  }
}
