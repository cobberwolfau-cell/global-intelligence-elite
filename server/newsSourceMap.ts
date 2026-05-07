/**
 * newsSourceMap.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Verified RSS feed sources for each country in the Global Intelligence Elite app.
 * All URLs have been tested and confirmed to return HTTP 200.
 *
 * Strategy:
 *  - Primary: national public broadcaster or major national newspaper RSS
 *  - Fallback: reputable English-language regional/international source
 *  - For countries with no accessible RSS: Al Jazeera / AllAfrica / VOA regional feed
 */

export interface NewsSource {
  outlet: string;       // Human-readable outlet name
  rssUrl: string;       // Verified RSS feed URL
  language: string;     // ISO 639-1 language code
  fallbackUrl?: string; // Optional fallback if primary fails
}

export const NEWS_SOURCE_MAP: Record<string, NewsSource> = {

  // ── ASIA ─────────────────────────────────────────────────────────────────

  Taiwan: {
    outlet: "RTI 中央廣播電臺",
    rssUrl: "https://www.rti.org.tw/rss/news/latest",
    language: "zh",
    fallbackUrl: "https://www.scmp.com/rss/91/feed",
  },
  HongKong: {
    outlet: "RTHK 香港電台",
    rssUrl: "https://rthk.hk/rthk/ch/component/k2/1456533-feed.xml",
    language: "zh",
    fallbackUrl: "https://www.scmp.com/rss/91/feed",
  },
  Macau: {
    outlet: "South China Morning Post",
    rssUrl: "https://www.scmp.com/rss/91/feed",
    language: "en",
  },
  China: {
    outlet: "China Daily",
    rssUrl: "https://www.chinadaily.com.cn/rss/china_rss.xml",
    language: "en",
    fallbackUrl: "https://www.xinhuanet.com/english/rss/worldrss.xml",
  },
  Japan: {
    outlet: "NHK News",
    rssUrl: "https://www3.nhk.or.jp/rss/news/cat0.xml",
    language: "ja",
  },
  SouthKorea: {
    outlet: "Yonhap News Agency",
    rssUrl: "https://www.yna.co.kr/rss/news.xml",
    language: "ko",
  },
  NorthKorea: {
    outlet: "Al Jazeera (Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Singapore: {
    outlet: "Channel NewsAsia",
    rssUrl: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416",
    language: "en",
    fallbackUrl: "https://www.straitstimes.com/news/singapore/rss.xml",
  },
  Malaysia: {
    outlet: "The Star Malaysia",
    rssUrl: "https://www.thestar.com.my/rss/News/Nation/",
    language: "en",
  },
  Thailand: {
    outlet: "Bangkok Post",
    rssUrl: "https://www.bangkokpost.com/rss/data/topstories.xml",
    language: "en",
  },
  Philippines: {
    outlet: "Philstar",
    rssUrl: "https://www.philstar.com/rss/headlines",
    language: "en",
  },
  Vietnam: {
    outlet: "VnExpress International",
    rssUrl: "https://e.vnexpress.net/rss/news.rss",
    language: "en",
  },
  Indonesia: {
    outlet: "Kompas",
    rssUrl: "https://rss.kompas.com/nasional",
    language: "id",
    fallbackUrl: "https://www.aljazeera.com/xml/rss/all.xml",
  },
  India: {
    outlet: "The Hindu",
    rssUrl: "https://www.thehindu.com/news/feeder/default.rss",
    language: "en",
  },
  Pakistan: {
    outlet: "Dawn",
    rssUrl: "https://www.dawn.com/feeds/home",
    language: "en",
  },
  Bangladesh: {
    outlet: "The Daily Star Bangladesh",
    rssUrl: "https://www.thedailystar.net/rss.xml",
    language: "en",
  },
  SriLanka: {
    outlet: "Al Jazeera (Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Myanmar: {
    outlet: "Al Jazeera (Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Cambodia: {
    outlet: "Al Jazeera (Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Laos: {
    outlet: "Al Jazeera (Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Mongolia: {
    outlet: "Al Jazeera (Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Kazakhstan: {
    outlet: "Al Jazeera (Central Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Uzbekistan: {
    outlet: "Al Jazeera (Central Asia)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Israel: {
    outlet: "Haaretz",
    rssUrl: "https://www.haaretz.com/cmlink/1.628765",
    language: "en",
  },
  SaudiArabia: {
    outlet: "Arab News",
    rssUrl: "https://www.arabnews.com/rss.xml",
    language: "en",
  },
  UAE: {
    outlet: "Arab News",
    rssUrl: "https://www.arabnews.com/rss.xml",
    language: "en",
  },
  Iran: {
    outlet: "IRNA (Islamic Republic News Agency)",
    rssUrl: "https://www.irna.ir/rss",
    language: "fa",
    fallbackUrl: "https://www.aljazeera.com/xml/rss/all.xml",
  },
  Iraq: {
    outlet: "Al Jazeera (Middle East)",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
  },
  Turkey: {
    outlet: "Daily Sabah",
    rssUrl: "https://www.dailysabah.com/rss",
    language: "en",
    fallbackUrl: "https://www.hurriyet.com.tr/rss/anasayfa",
  },

  // ── EUROPE ───────────────────────────────────────────────────────────────

  UK: {
    outlet: "BBC News",
    rssUrl: "https://feeds.bbci.co.uk/news/rss.xml",
    language: "en",
  },
  Germany: {
    outlet: "Tagesschau (ARD)",
    rssUrl: "https://www.tagesschau.de/xml/rss2",
    language: "de",
    fallbackUrl: "https://rss.dw.com/rdf/rss-de-all",
  },
  France: {
    outlet: "Le Monde",
    rssUrl: "https://www.lemonde.fr/rss/une.xml",
    language: "fr",
    fallbackUrl: "https://www.rfi.fr/fr/rss",
  },
  Italy: {
    outlet: "ANSA",
    rssUrl: "https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml",
    language: "it",
  },
  Spain: {
    outlet: "El País",
    rssUrl: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
    language: "es",
    fallbackUrl: "https://www.abc.es/rss/feeds/abcPortada.xml",
  },
  Netherlands: {
    outlet: "NOS Nieuws",
    rssUrl: "https://feeds.nos.nl/nosnieuwsalgemeen",
    language: "nl",
  },
  Belgium: {
    outlet: "RTBF Info",
    rssUrl: "https://www.rtbf.be/en-continu/info?output=rss",
    language: "fr",
  },
  Switzerland: {
    outlet: "SRF News",
    rssUrl: "https://www.srf.ch/news/bnf/rss/19032223",
    language: "de",
  },
  Sweden: {
    outlet: "SVT Nyheter",
    rssUrl: "https://www.svt.se/nyheter/rss.xml",
    language: "sv",
    fallbackUrl: "https://www.thelocal.se/feeds/news/",
  },
  Norway: {
    outlet: "NRK Nyheter",
    rssUrl: "https://www.nrk.no/nyheter/siste.rss",
    language: "no",
  },
  Denmark: {
    outlet: "DR Nyheder",
    rssUrl: "https://www.dr.dk/nyheder/service/feeds/allenyheder",
    language: "da",
    fallbackUrl: "https://fyens.dk/feed/danmark",
  },
  Finland: {
    outlet: "Yle Uutiset",
    rssUrl: "https://yle.fi/rss/uutiset/tuoreimmat",
    language: "fi",
  },
  Poland: {
    outlet: "Polsat News",
    rssUrl: "https://www.polsatnews.pl/rss/wszystkie.xml",
    language: "pl",
  },
  Ukraine: {
    outlet: "Ukrainska Pravda (English)",
    rssUrl: "https://www.pravda.com.ua/eng/rss/view_news/",
    language: "en",
  },
  Russia: {
    outlet: "TASS",
    rssUrl: "https://tass.ru/rss/v2.xml",
    language: "ru",
  },
  Greece: {
    outlet: "Ekathimerini",
    rssUrl: "https://www.ekathimerini.com/rss/news",
    language: "en",
  },
  Portugal: {
    outlet: "Correio da Manhã",
    rssUrl: "https://www.cmjornal.pt/rss",
    language: "pt",
  },
  Austria: {
    outlet: "ORF News",
    rssUrl: "https://rss.orf.at/news.xml",
    language: "de",
  },
  CzechRepublic: {
    outlet: "ČT24",
    rssUrl: "https://ct24.ceskatelevize.cz/rss/hlavni-zpravy",
    language: "cs",
  },
  Hungary: {
    outlet: "HVG",
    rssUrl: "https://hvg.hu/rss/itthon",
    language: "hu",
    fallbackUrl: "https://index.hu/24ora/rss",
  },
  Romania: {
    outlet: "Digi24",
    rssUrl: "https://www.digi24.ro/rss/stiri",
    language: "ro",
  },

  // ── AMERICAS ─────────────────────────────────────────────────────────────

  US: {
    outlet: "NPR News",
    rssUrl: "https://feeds.npr.org/1002/rss.xml",
    language: "en",
  },
  Canada: {
    outlet: "Global News",
    rssUrl: "https://globalnews.ca/feed/",
    language: "en",
  },
  Mexico: {
    outlet: "El Universal México",
    rssUrl: "https://www.eluniversal.com.mx/rss.xml",
    language: "es",
    fallbackUrl: "https://www.imer.mx/feed/",
  },
  Brazil: {
    outlet: "Portal EBC",
    rssUrl: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
    language: "pt",
  },
  Argentina: {
    outlet: "Clarín",
    rssUrl: "https://www.clarin.com/rss/lo-ultimo/",
    language: "es",
  },
  Chile: {
    outlet: "La Tercera",
    rssUrl: "https://www.latercera.com/arc/outboundfeeds/rss/?outputType=xml",
    language: "es",
  },
  Colombia: {
    outlet: "Radio Nacional de Colombia",
    rssUrl: "https://www.radionacional.co/rss.xml",
    language: "es",
  },
  Peru: {
    outlet: "El Comercio Perú",
    rssUrl: "https://elcomercio.pe/feed/",
    language: "es",
  },
  Venezuela: {
    outlet: "MercoPress (Venezuela)",
    rssUrl: "https://en.mercopress.com/rss/venezuela",
    language: "en",
  },
  Cuba: {
    outlet: "Granma",
    rssUrl: "https://www.granma.cu/feed",
    language: "es",
  },
  Panama: {
    outlet: "La Gaceta de Panamá",
    rssUrl: "https://www.lagacetadepanama.com/rss/",
    language: "es",
  },
  Ecuador: {
    outlet: "El Comercio Ecuador",
    rssUrl: "https://www.elcomercio.com/feed/",
    language: "es",
  },

  // ── AFRICA ───────────────────────────────────────────────────────────────

  Egypt: {
    outlet: "Egypt Independent",
    rssUrl: "https://www.egyptindependent.com/feed/",
    language: "en",
  },
  Nigeria: {
    outlet: "Premium Times Nigeria",
    rssUrl: "https://www.premiumtimesng.com/feed",
    language: "en",
  },
  SouthAfrica: {
    outlet: "Mail & Guardian",
    rssUrl: "https://mg.co.za/feed",
    language: "en",
  },
  Kenya: {
    outlet: "AllAfrica (Kenya)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/kenya/headlines.rdf",
    language: "en",
  },
  Ethiopia: {
    outlet: "AllAfrica (Ethiopia)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/ethiopia/headlines.rdf",
    language: "en",
  },
  Ghana: {
    outlet: "Ghanaian Times",
    rssUrl: "https://ghanaiantimes.com.gh/feed/",
    language: "en",
  },
  Tanzania: {
    outlet: "Daily News Tanzania",
    rssUrl: "https://dailynews.co.tz/category/tanzania/feed",
    language: "en",
  },
  Morocco: {
    outlet: "Hespress (Arabic)",
    rssUrl: "https://hespress.com/feed",
    language: "ar",
    fallbackUrl: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
  },
  Algeria: {
    outlet: "AllAfrica (Algeria)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/algeria/headlines.rdf",
    language: "en",
  },
  Libya: {
    outlet: "AllAfrica (Libya)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    language: "en",
  },
  Sudan: {
    outlet: "AllAfrica (Sudan)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    language: "en",
  },
  DRC: {
    outlet: "AllAfrica (DRC)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    language: "en",
  },
  Angola: {
    outlet: "AllAfrica (Angola)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/angola/headlines.rdf",
    language: "en",
  },
  Mozambique: {
    outlet: "AllAfrica (Mozambique)",
    rssUrl: "https://allafrica.com/tools/headlines/rdf/mozambique/headlines.rdf",
    language: "en",
  },

  // ── OCEANIA ──────────────────────────────────────────────────────────────

  Australia: {
    outlet: "ABC News Australia",
    rssUrl: "https://www.abc.net.au/news/feed/51120/rss.xml",
    language: "en",
  },
  NewZealand: {
    outlet: "RNZ News",
    rssUrl: "https://www.rnz.co.nz/rss/news.xml",
    language: "en",
  },
  PapuaNewGuinea: {
    outlet: "RNZ Pacific",
    rssUrl: "https://www.rnz.co.nz/rss/pacific.xml",
    language: "en",
  },
  Fiji: {
    outlet: "RNZ Pacific",
    rssUrl: "https://www.rnz.co.nz/rss/pacific.xml",
    language: "en",
  },
  SolomonIslands: {
    outlet: "RNZ Pacific",
    rssUrl: "https://www.rnz.co.nz/rss/pacific.xml",
    language: "en",
  },

  // ── GLOBAL ───────────────────────────────────────────────────────────────

  Global: {
    outlet: "Al Jazeera",
    rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
    language: "en",
    fallbackUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
  },
};
