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
 *     - Primary: fast-xml-parser (XMLParser)
 *     - Fallback: regex-based extractor for non-standard RSS (ETtoday, UDN, etc.)
 *  4. Merge all results, deduplicate by URL, sort by publishedAt desc
 *  5. Filter: apply country-specific foreign keyword filter to exclude articles
 *     about foreign events even if published by local media
 *  6. Prefer local sources; only include international sources if no local articles found
 *  7. Return top N articles for use in AI prompts
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
  parseAttributeValue: false,
  trimValues: true,
  processEntities: true,
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
  "rfe/rl",
  "rfi français",
  "rfi",
]);

function isInternationalOutlet(outletName: string): boolean {
  const lower = outletName.toLowerCase().trim();
  return INTERNATIONAL_OUTLETS.has(lower) || lower.startsWith("allafrica");
}

/**
 * Per-country keyword filter: if an article title contains any of these keywords,
 * it is considered to be about a foreign event and should be excluded.
 */
const COUNTRY_FOREIGN_KEYWORDS: Record<string, string[]> = {
  Taiwan: [
    "美國", "中國大陸", "中共", "俄羅斯", "烏克蘭", "歐盟", "北韓", "南韓", "韓國",
    "日本", "英國", "法國", "德國", "以色列", "伊朗", "伊拉克", "沙烏地", "敘利亞",
    "阿富汗", "巴基斯坦", "印度", "緬甸", "泰國", "越南", "菲律賓", "印尼", "馬來西亞",
    "新加坡", "澳洲", "紐西蘭", "加拿大", "墨西哥", "巴西", "阿根廷", "土耳其",
    "波蘭", "匈牙利", "捷克", "羅馬尼亞", "希臘", "西班牙", "義大利", "荷蘭",
    "比利時", "瑞士", "瑞典", "挪威", "丹麥", "芬蘭", "奧地利", "葡萄牙",
    "NATO", "G7", "G20", "聯合國", "世界銀行", "IMF", "WTO",
  ],
  HongKong: [
    "美國", "俄羅斯", "烏克蘭", "歐盟", "北韓", "南韓", "日本", "英國", "法國",
    "德國", "以色列", "伊朗", "印度", "巴基斯坦", "澳洲", "加拿大", "墨西哥",
    "巴西", "土耳其", "NATO", "G7", "G20",
  ],
  China: [
    "美國", "俄羅斯", "烏克蘭", "歐盟", "北韓", "南韓", "日本", "英國", "法國",
    "德國", "以色列", "伊朗", "印度", "巴基斯坦", "澳洲", "加拿大", "墨西哥",
    "巴西", "土耳其", "NATO", "G7", "G20", "聯合國",
  ],
  Japan: [
    "United States", "Russia", "Ukraine", "NATO", "European Union", "North Korea",
    "South Korea", "China", "United Kingdom", "France", "Germany", "Israel", "Iran",
    "India", "Pakistan", "Australia", "Canada", "Mexico", "Brazil", "Turkey",
    "アメリカ", "ロシア", "ウクライナ", "ヨーロッパ", "北朝鮮", "韓国", "中国",
    "イギリス", "フランス", "ドイツ", "イスラエル", "イラン", "インド",
  ],
  SouthKorea: [
    "미국", "러시아", "우크라이나", "유럽", "북한", "일본", "중국", "영국",
    "프랑스", "독일", "이스라엘", "이란", "인도", "호주", "캐나다",
    "United States", "Russia", "Ukraine", "NATO", "European Union",
  ],
  NorthKorea: [
    "European Union", "NATO",
  ],
  Singapore: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United States election", "US election", "UK election",
  ],
  Malaysia: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United States election", "US election",
  ],
  Thailand: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United States", "United Kingdom", "France", "Germany",
  ],
  Philippines: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany", "Australia",
  ],
  Vietnam: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Indonesia: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  India: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany", "United States election",
  ],
  Pakistan: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel",
    "United Kingdom", "France", "Germany", "United States election",
  ],
  Bangladesh: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  SriLanka: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Myanmar: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel",
    "United Kingdom", "France", "Germany",
  ],
  Cambodia: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Laos: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Mongolia: [
    "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Kazakhstan: [
    "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Uzbekistan: [
    "NATO", "European Union", "Israel", "Iran",
    "United Kingdom", "France", "Germany",
  ],
  Israel: [
    "Russia", "Ukraine", "NATO", "European Union",
    "United Kingdom", "France", "Germany", "United States election",
    "China", "Japan", "South Korea",
  ],
  SaudiArabia: [
    "Russia", "Ukraine", "NATO", "European Union",
    "United Kingdom", "France", "Germany", "United States election",
    "China", "Japan", "South Korea",
  ],
  UAE: [
    "Russia", "Ukraine", "NATO", "European Union",
    "United Kingdom", "France", "Germany", "United States election",
    "China", "Japan", "South Korea",
  ],
  Iran: [
    "NATO", "European Union",
    "United Kingdom", "France", "Germany", "United States election",
    "China", "Japan", "South Korea",
  ],
  Iraq: [
    "NATO", "European Union",
    "United Kingdom", "France", "Germany", "United States election",
    "China", "Japan", "South Korea",
  ],
  Turkey: [
    "Russia", "Ukraine",
    "United Kingdom", "France", "Germany", "United States election",
    "China", "Japan", "South Korea",
  ],
  UK: [
    "Russia", "Ukraine", "China", "North Korea", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "Israel",
  ],
  Germany: [
    "Russland", "Ukraine", "China", "Nordkorea", "Iran",
    "Japan", "Südkorea", "Indien", "Pakistan",
    "Australien", "Kanada", "Mexiko", "Brasilien", "Argentinien",
    "Türkei", "Saudi-Arabien", "Israel",
    "Russia", "North Korea", "South Korea",
  ],
  France: [
    "Russie", "Ukraine", "Chine", "Corée du Nord", "Iran",
    "Japon", "Corée du Sud", "Inde", "Pakistan",
    "Australie", "Canada", "Mexique", "Brésil", "Argentine",
    "Turquie", "Arabie saoudite", "Israël",
    "Russia", "China", "North Korea", "South Korea",
  ],
  Italy: [
    "Russia", "Ucraina", "Cina", "Corea del Nord", "Iran",
    "Giappone", "Corea del Sud", "India", "Pakistan",
    "Australia", "Canada", "Messico", "Brasile", "Argentina",
    "Turchia", "Arabia Saudita", "Israele",
  ],
  Spain: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
  ],
  Netherlands: [
    "Rusland", "Oekraïne", "China", "Noord-Korea", "Iran",
    "Japan", "Zuid-Korea", "India", "Pakistan",
    "Australië", "Canada", "Mexico", "Brazilië", "Argentinië",
    "Turkije", "Saoedi-Arabië", "Israël",
    "Russia", "Ukraine", "North Korea", "South Korea",
  ],
  Belgium: [
    "Russie", "Ukraine", "Chine", "Corée du Nord", "Iran",
    "Japon", "Corée du Sud", "Inde", "Pakistan",
    "Australie", "Canada", "Mexique", "Brésil", "Argentine",
    "Turquie", "Arabie saoudite", "Israël",
    "Russia", "China", "North Korea",
  ],
  Switzerland: [
    "Russland", "Ukraine", "China", "Nordkorea", "Iran",
    "Japan", "Südkorea", "Indien", "Pakistan",
    "Australien", "Kanada", "Mexiko", "Brasilien", "Argentinien",
    "Türkei", "Saudi-Arabien", "Israel",
    "Russia", "North Korea",
  ],
  Sweden: [
    "Ryssland", "Ukraina", "Kina", "Nordkorea", "Iran",
    "Japan", "Sydkorea", "Indien", "Pakistan",
    "Australien", "Kanada", "Mexiko", "Brasilien", "Argentina",
    "Turkiet", "Saudiarabien", "Israel",
    "Russia", "Ukraine", "China", "North Korea",
  ],
  Norway: [
    "Russland", "Ukraina", "Kina", "Nord-Korea", "Iran",
    "Japan", "Sør-Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brasil", "Argentina",
    "Tyrkia", "Saudi-Arabia", "Israel",
    "Russia", "Ukraine", "China", "North Korea",
  ],
  Denmark: [
    "Rusland", "Ukraine", "Kina", "Nordkorea", "Iran",
    "Japan", "Sydkorea", "Indien", "Pakistan",
    "Australien", "Canada", "Mexico", "Brasilien", "Argentina",
    "Tyrkiet", "Saudi-Arabien", "Israel",
    "Russia", "China", "North Korea",
  ],
  Finland: [
    "Venäjä", "Ukraina", "Kiina", "Pohjois-Korea", "Iran",
    "Japani", "Etelä-Korea", "Intia", "Pakistan",
    "Australia", "Kanada", "Meksiko", "Brasilia", "Argentiina",
    "Turkki", "Saudi-Arabia", "Israel",
    "Russia", "Ukraine", "China", "North Korea",
  ],
  Poland: [
    "Rosja", "Ukraina", "Chiny", "Korea Północna", "Iran",
    "Japonia", "Korea Południowa", "Indie", "Pakistan",
    "Australia", "Kanada", "Meksyk", "Brazylia", "Argentyna",
    "Turcja", "Arabia Saudyjska", "Izrael",
    "Russia", "Ukraine", "China", "North Korea",
  ],
  Ukraine: [
    "China", "North Korea", "South Korea", "Japan",
    "India", "Pakistan", "Australia", "Canada",
    "Mexico", "Brazil", "Argentina",
  ],
  Russia: [
    "China", "North Korea", "South Korea", "Japan",
    "India", "Pakistan", "Australia", "Canada",
    "Mexico", "Brazil", "Argentina",
  ],
  Greece: [
    "Russia", "Ukraine", "China", "North Korea", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "Saudi Arabia",
  ],
  Portugal: [
    "Rússia", "Ucrânia", "China", "Coreia do Norte", "Irã",
    "Japão", "Coreia do Sul", "Índia", "Paquistão",
    "Austrália", "Canadá", "México", "Argentina",
    "Turquia", "Arábia Saudita", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Austria: [
    "Russland", "Ukraine", "China", "Nordkorea", "Iran",
    "Japan", "Südkorea", "Indien", "Pakistan",
    "Australien", "Kanada", "Mexiko", "Brasilien", "Argentinien",
    "Türkei", "Saudi-Arabien", "Israel",
    "Russia", "North Korea",
  ],
  CzechRepublic: [
    "Rusko", "Ukrajina", "Čína", "Severní Korea", "Írán",
    "Japonsko", "Jižní Korea", "Indie", "Pákistán",
    "Austrálie", "Kanada", "Mexiko", "Brazílie", "Argentina",
    "Turecko", "Saúdská Arábie", "Izrael",
    "Russia", "Ukraine", "China", "North Korea",
  ],
  Hungary: [
    "Oroszország", "Ukrajna", "Kína", "Észak-Korea", "Irán",
    "Japán", "Dél-Korea", "India", "Pakisztán",
    "Ausztrália", "Kanada", "Mexikó", "Brazília", "Argentína",
    "Törökország", "Szaúd-Arábia", "Izrael",
    "Russia", "Ukraine", "China", "North Korea",
  ],
  Romania: [
    "Rusia", "Ucraina", "China", "Coreea de Nord", "Iran",
    "Japonia", "Coreea de Sud", "India", "Pakistan",
    "Australia", "Canada", "Mexic", "Brazilia", "Argentina",
    "Turcia", "Arabia Saudită", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  USA: [
    "Russia", "Ukraine", "China", "North Korea", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "Israel", "France", "Germany",
    "United Kingdom", "European Union", "NATO",
  ],
  Canada: [
    "Russia", "Ukraine", "China", "North Korea", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "Israel", "France", "Germany",
    "European Union", "NATO",
  ],
  Mexico: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Brazil: [
    "Rússia", "Ucrânia", "China", "Coreia do Norte", "Irã",
    "Japão", "Coreia do Sul", "Índia", "Paquistão",
    "Austrália", "Canadá", "México", "Argentina",
    "Turquia", "Arábia Saudita", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Argentina: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Chile: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Colombia: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Peru: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Venezuela: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Cuba: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Panama: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Ecuador: [
    "Rusia", "Ucrania", "China", "Corea del Norte", "Irán",
    "Japón", "Corea del Sur", "India", "Pakistán",
    "Australia", "Canadá", "México", "Brasil", "Argentina",
    "Turquía", "Arabia Saudí", "Israel",
    "Russia", "Ukraine", "North Korea",
  ],
  Egypt: [
    "Russia", "Ukraine", "NATO", "European Union",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  Nigeria: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  SouthAfrica: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  Kenya: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  Ethiopia: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  Ghana: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  Tanzania: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
    "China",
  ],
  Morocco: [
    "Russia", "Ukraine", "NATO", "European Union",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  Algeria: [
    "Russia", "Ukraine", "NATO",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  Libya: [
    "Russia", "Ukraine", "NATO",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  Sudan: [
    "Russia", "Ukraine", "NATO",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  DRC: [
    "Russia", "Ukraine", "NATO", "European Union",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  Angola: [
    "Russia", "Ukraine", "NATO", "European Union",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  Mozambique: [
    "Russia", "Ukraine", "NATO", "European Union",
    "Japan", "South Korea", "India", "Pakistan",
    "Australia", "Canada", "Mexico", "Brazil", "Argentina",
  ],
  Australia: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "France", "Germany",
    "United Kingdom", "China", "North Korea",
  ],
  NewZealand: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "France", "Germany",
    "United Kingdom", "China", "North Korea",
  ],
  PapuaNewGuinea: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "France", "Germany",
    "United Kingdom", "China", "North Korea",
  ],
  Fiji: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "France", "Germany",
    "United Kingdom", "China", "North Korea",
  ],
  SolomonIslands: [
    "Russia", "Ukraine", "NATO", "European Union", "Israel", "Iran",
    "Japan", "South Korea", "India", "Pakistan",
    "Canada", "Mexico", "Brazil", "Argentina",
    "Turkey", "Saudi Arabia", "France", "Germany",
    "United Kingdom", "North Korea",
  ],
};

/**
 * Check if an article title contains foreign country keywords for the given country.
 * Returns true if the article appears to be about foreign events (should be excluded).
 */
function isForeignEventArticle(title: string, country: string): boolean {
  const keywords = COUNTRY_FOREIGN_KEYWORDS[country];
  if (!keywords || keywords.length === 0) return false;

  const titleLower = title.toLowerCase();
  return keywords.some((kw) => titleLower.includes(kw.toLowerCase()));
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
  // News mode: apply foreign event keyword filter to remove articles about foreign events
  const domesticArticles = unique.filter(
    (a) => !isForeignEventArticle(a.title, country)
  );
  // Prefer local articles; only include international if local is sparse
  const localArticles = domesticArticles.filter((a) => a.isLocal);
  const finalArticles = localArticles.length >= Math.ceil(maxItems / 2)
    ? localArticles  // enough local content — use only local
    : domesticArticles.length > 0
      ? domesticArticles  // some domestic content — use all domestic
      : unique;           // fallback: include everything if no domestic content found
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
    // Try primary XML parser first, fall back to regex extractor for non-standard RSS
    const primary = parseRssXml(xml, outletName, language, maxItems, isLocal);
    if (primary.length > 0) return primary;
    // Fallback: regex-based extractor for malformed XML (ETtoday, UDN, etc.)
    return parseRssRegex(xml, outletName, language, maxItems, isLocal);
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

/**
 * Regex-based RSS parser as fallback for non-standard XML feeds (ETtoday, UDN, etc.)
 * Extracts <title>, <link>, <pubDate> using regex patterns that are more tolerant
 * of malformed XML, CDATA sections, and encoding issues.
 */
function parseRssRegex(
  xml: string,
  outletName: string,
  language: string,
  maxItems: number,
  isLocalSource = true
): RssArticle[] {
  try {
    const articles: RssArticle[] = [];

    // Split by <item> tags
    const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemPattern.exec(xml)) !== null && articles.length < maxItems) {
      const itemContent = match[1];

      // Extract title (handle CDATA and plain text)
      const titleMatch =
        itemContent.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ??
        itemContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract link (handle CDATA, plain text, and <link href="..."> Atom style)
      const linkMatch =
        itemContent.match(/<link[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) ??
        itemContent.match(/<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*\/?>/i) ??
        itemContent.match(/<link[^>]*>(https?:\/\/[^\s<]+)<\/link>/i) ??
        itemContent.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      let url = linkMatch ? linkMatch[1].trim() : null;
      if (url && !url.startsWith("http")) url = null;

      // Extract pubDate
      const pubDateMatch =
        itemContent.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ??
        itemContent.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

      // Extract description
      const descMatch =
        itemContent.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ??
        itemContent.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
      const description = descMatch
        ? descMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 300)
        : null;

      // Extract guid as fallback URL
      if (!url) {
        const guidMatch = itemContent.match(/<guid[^>]*>(https?:\/\/[^\s<]+)<\/guid>/i);
        if (guidMatch) url = guidMatch[1].trim();
      }

      if (!title || !url) continue;

      articles.push({
        title,
        url,
        description,
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
