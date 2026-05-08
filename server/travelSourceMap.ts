/**
 * travelSourceMap.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Travel-specific RSS feed registry.
 *
 * Strategy:
 *  1. Each country has a list of local travel/tourism RSS sources (where available).
 *  2. All countries fall back to global travel media (CNT, Fodor's, Nomadic Matt, etc.)
 *  3. The rssFetcher uses this map when category === 'travel'.
 *
 * Verified working RSS feeds (HTTP 200):
 *  - Condé Nast Traveler: https://www.cntraveler.com/feed/rss
 *  - Fodor's Travel:      https://www.fodors.com/rss
 *  - Nomadic Matt:        https://www.nomadicmatt.com/feed/
 *  - The Points Guy:      https://thepointsguy.com/feed/
 *  - Atlas Obscura:       https://www.atlasobscura.com/feeds/latest
 *  - Tourism Australia:   https://www.australia.com/rss
 *
 * Note: Reddit, Lonely Planet, TripAdvisor, and most tourism boards block RSS.
 * We use verified-working travel media RSS + local news travel sections instead.
 */

import type { RssSource } from "./newsSourceMap";

export interface TravelSources {
  /** Country-specific local travel/tourism sources (may be empty for small countries) */
  local: RssSource[];
  /** Global travel media fallbacks — always appended after local sources */
  global: RssSource[];
}

// ── Global travel media (verified HTTP 200) ───────────────────────────────
export const GLOBAL_TRAVEL_SOURCES: RssSource[] = [
  {
    outlet: "BBC Travel",
    url: "https://www.bbc.com/travel/feed.rss",
    language: "en",
  },
  {
    outlet: "Condé Nast Traveler",
    url: "https://www.cntraveler.com/feed/rss",
    language: "en",
  },
  {
    outlet: "Fodor's Travel",
    url: "https://www.fodors.com/rss",
    language: "en",
  },
  {
    outlet: "Nomadic Matt",
    url: "https://www.nomadicmatt.com/feed/",
    language: "en",
  },
  {
    outlet: "The Points Guy",
    url: "https://thepointsguy.com/feed/",
    language: "en",
  },
  {
    outlet: "Atlas Obscura",
    url: "https://www.atlasobscura.com/feeds/latest",
    language: "en",
  },
];

// ── Country-specific travel sources ──────────────────────────────────────
// Where local tourism RSS is unavailable, we use the country's local news RSS
// (already in NEWS_SOURCE_MAP) and rely on the AI prompt to filter travel content.
export const TRAVEL_SOURCE_MAP: Record<string, TravelSources> = {
  // ── ASIA ─────────────────────────────────────────────────────────────────
  Taiwan: {
    local: [
      // RTI covers Taiwan travel/lifestyle news in Chinese
      { outlet: "RTI 中央廣播電臺", url: "https://www.rti.org.tw/rss", language: "zh" },
      // 自由時報 general news (travel section RSS is 404)
      { outlet: "自由時報", url: "https://feeds.ltn.com.tw/rss/all", language: "zh" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Japan: {
    local: [
      { outlet: "NHK Travel", url: "https://www3.nhk.or.jp/rss/news/cat6.xml", language: "ja" },
      { outlet: "毎日新聞", url: "https://mainichi.jp/rss/etc/mainichi-flash.rss", language: "ja" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  SouthKorea: {
    local: [
      { outlet: "Korea Herald Travel", url: "https://www.koreaherald.com/rss/020100000000.xml", language: "en" },
      { outlet: "Yonhap English", url: "https://en.yna.co.kr/RSS/news.xml", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  HongKong: {
    local: [
      { outlet: "RTHK Travel", url: "https://rthk.hk/rthk/en/component/k2/1456533-feed.xml", language: "en" },
      { outlet: "South China Morning Post", url: "https://www.scmp.com/rss/91/feed", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  China: {
    local: [
      { outlet: "China Daily Travel", url: "https://www.chinadaily.com.cn/rss/china_rss.xml", language: "en" },
      { outlet: "Global Times", url: "https://www.globaltimes.cn/rss/outbrain.xml", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Singapore: {
    local: [
      { outlet: "Channel NewsAsia Travel", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416", language: "en" },
      { outlet: "The Straits Times", url: "https://www.straitstimes.com/news/singapore/rss.xml", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Thailand: {
    local: [
      { outlet: "Bangkok Post Travel", url: "https://www.bangkokpost.com/rss/data/topstories.xml", language: "en" },
      { outlet: "The Nation Thailand", url: "https://www.nationthailand.com/rss.xml", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Vietnam: {
    local: [
      { outlet: "VnExpress Travel", url: "https://vnexpress.net/rss/du-lich.rss", language: "vi" },
      { outlet: "Vietnam News", url: "https://vietnamnews.vn/rss/home.rss", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Malaysia: {
    local: [
      { outlet: "The Star Travel", url: "https://www.thestar.com.my/rss/News/Nation/", language: "en" },
      { outlet: "New Straits Times", url: "https://www.nst.com.my/rss/news", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Indonesia: {
    local: [
      { outlet: "Kompas Travel", url: "https://rss.kompas.com/travel", language: "id" },
      { outlet: "Jakarta Post", url: "https://www.thejakartapost.com/feed", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Philippines: {
    local: [
      { outlet: "Philippine Daily Inquirer", url: "https://newsinfo.inquirer.net/feed", language: "en" },
      { outlet: "Manila Bulletin", url: "https://mb.com.ph/feed/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  India: {
    local: [
      { outlet: "Times of India Travel", url: "https://timesofindia.indiatimes.com/rssfeeds/7097546.cms", language: "en" },
      { outlet: "NDTV Travel", url: "https://feeds.feedburner.com/ndtvnews-top-stories", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Australia: {
    local: [
      { outlet: "Tourism Australia", url: "https://www.australia.com/rss", language: "en" },
      { outlet: "ABC News Australia Travel", url: "https://www.abc.net.au/news/feed/51120/rss.xml", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  NewZealand: {
    local: [
      { outlet: "RNZ Travel", url: "https://www.rnz.co.nz/rss/national.xml", language: "en" },
      { outlet: "Stuff NZ", url: "https://www.stuff.co.nz/rss", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  // ── EUROPE ───────────────────────────────────────────────────────────────
  UK: {
    local: [
      { outlet: "BBC Travel", url: "https://www.bbc.com/travel/feed.rss", language: "en" },
      { outlet: "The Guardian Travel", url: "https://www.theguardian.com/travel/rss", language: "en" },
      { outlet: "The Independent Travel", url: "https://www.independent.co.uk/travel/rss", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  France: {
    local: [
      { outlet: "Le Monde Voyage", url: "https://www.lemonde.fr/rss/une.xml", language: "fr" },
      { outlet: "France 24 Travel", url: "https://www.france24.com/en/rss", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Germany: {
    local: [
      { outlet: "Tagesschau Reise", url: "https://www.tagesschau.de/xml/rss2/", language: "de" },
      { outlet: "Deutsche Welle Travel", url: "https://rss.dw.com/rdf/rss-en-all", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Italy: {
    local: [
      { outlet: "ANSA Turismo", url: "https://www.ansa.it/sito/notizie/turismo/turismo_rss.xml", language: "it" },
      { outlet: "La Repubblica Viaggi", url: "https://www.repubblica.it/rss/viaggi/rss2.0.xml", language: "it" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Spain: {
    local: [
      { outlet: "El País Viajes", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", language: "es" },
      { outlet: "EFE Travel", url: "https://www.efe.com/efe/espana/rss/1", language: "es" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Netherlands: {
    local: [
      { outlet: "NOS Reizen", url: "https://feeds.nos.nl/nosnieuwsalgemeen", language: "nl" },
      { outlet: "DutchNews Travel", url: "https://www.dutchnews.nl/feed/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Switzerland: {
    local: [
      { outlet: "SWI swissinfo Travel", url: "https://www.swissinfo.ch/eng/rss/topnews", language: "en" },
      { outlet: "NZZ Reisen", url: "https://www.nzz.ch/recent.rss", language: "de" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Greece: {
    local: [
      { outlet: "Ekathimerini Travel", url: "https://www.ekathimerini.com/rss/?lang=en", language: "en" },
      { outlet: "Greek Reporter", url: "https://greekreporter.com/feed/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Turkey: {
    local: [
      { outlet: "Daily Sabah Travel", url: "https://www.dailysabah.com/rss", language: "en" },
      { outlet: "Hurriyet Daily News", url: "https://www.hurriyetdailynews.com/rss", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  // ── AMERICAS ─────────────────────────────────────────────────────────────
  USA: {
    local: [
      { outlet: "Condé Nast Traveler", url: "https://www.cntraveler.com/feed/rss", language: "en" },
      { outlet: "Fodor's Travel", url: "https://www.fodors.com/rss", language: "en" },
      { outlet: "The Points Guy", url: "https://thepointsguy.com/feed/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Canada: {
    local: [
      { outlet: "CBC Travel", url: "https://www.cbc.ca/cmlink/rss-topstories", language: "en" },
      { outlet: "Globe and Mail Travel", url: "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/life/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Mexico: {
    local: [
      { outlet: "La Jornada Turismo", url: "https://www.jornada.com.mx/rss/sociedad.xml?v=1", language: "es" },
      { outlet: "El Universal Viajes", url: "https://www.eluniversal.com.mx/rss.xml", language: "es" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Brazil: {
    local: [
      { outlet: "G1 Turismo", url: "https://g1.globo.com/rss/g1/turismo-e-viagem/", language: "pt" },
      { outlet: "Folha de S.Paulo Turismo", url: "https://feeds.folha.uol.com.br/turismo/rss091.xml", language: "pt" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Argentina: {
    local: [
      { outlet: "Infobae Viajes", url: "https://www.infobae.com/feeds/rss/viajes/", language: "es" },
      { outlet: "La Nación Viajes", url: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/", language: "es" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  // ── MIDDLE EAST ──────────────────────────────────────────────────────────
  UAE: {
    local: [
      { outlet: "Gulf News Travel", url: "https://gulfnews.com/rss/travel", language: "en" },
      { outlet: "The National Travel", url: "https://www.thenationalnews.com/rss/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  SaudiArabia: {
    local: [
      { outlet: "Arab News Travel", url: "https://www.arabnews.com/rss.xml", language: "en" },
      { outlet: "Saudi Gazette", url: "https://saudigazette.com.sa/rss", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Israel: {
    local: [
      { outlet: "Haaretz Travel", url: "https://www.haaretz.com/cmlink/1.628765", language: "en" },
      { outlet: "Jerusalem Post Travel", url: "https://www.jpost.com/rss/rssfeedstartpage.aspx", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  // ── AFRICA ───────────────────────────────────────────────────────────────
  SouthAfrica: {
    local: [
      { outlet: "News24 Travel", url: "https://feeds.news24.com/articles/news24/TopStories/rss", language: "en" },
      { outlet: "Daily Maverick Travel", url: "https://www.dailymaverick.co.za/feed/", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Egypt: {
    local: [
      { outlet: "Egypt Independent Travel", url: "https://egyptindependent.com/feed/", language: "en" },
      { outlet: "Al-Ahram Travel", url: "https://english.ahram.org.eg/rss.aspx", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Kenya: {
    local: [
      { outlet: "Daily Nation Travel", url: "https://nation.africa/kenya/rss.xml", language: "en" },
      { outlet: "The Standard Travel", url: "https://www.standardmedia.co.ke/rss/all-stories.php", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
  Morocco: {
    local: [
      { outlet: "Morocco World News Travel", url: "https://www.moroccoworldnews.com/feed/", language: "en" },
      { outlet: "Yabiladi Travel", url: "https://en.yabiladi.com/rss.xml", language: "en" },
    ],
    global: GLOBAL_TRAVEL_SOURCES,
  },
};

/**
 * Get travel RSS sources for a country.
 * Returns local sources first, then global travel media.
 * If no country-specific entry exists, returns only global sources.
 */
export function getTravelSources(country: string): RssSource[] {
  const entry = TRAVEL_SOURCE_MAP[country];
  if (!entry) {
    return GLOBAL_TRAVEL_SOURCES;
  }
  // Local sources first, then global (deduplicated by URL in rssFetcher)
  return [...entry.local, ...entry.global];
}
