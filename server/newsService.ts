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
  SouthKorea: "South Korea",
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

// Countries where Chinese-language news is available
const CHINESE_LANGUAGE_COUNTRIES = new Set([
  "Taiwan", "HongKong", "Macau", "China", "Singapore",
]);

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
 * Uses the 'everything' endpoint with country name + optional category keyword.
 * For Chinese-speaking regions, fetches Chinese-language news first.
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
  const useChinese = CHINESE_LANGUAGE_COUNTRIES.has(country);

  // Build search query: combine country name with optional category keyword
  const q = keyword
    ? `${countryName} ${keyword}`
    : countryName;

  // Use last 7 days for freshness
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // For Chinese-speaking regions, try Chinese-language news first
  if (useChinese) {
    const zhUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=zh&from=${from}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
    const zhArticles = await fetchFromUrl(zhUrl);
    if (zhArticles.length > 0) return zhArticles;
  }

  // Fall back to English-language news (or primary for non-Chinese regions)
  const enUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&from=${from}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
  return fetchFromUrl(enUrl);
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
