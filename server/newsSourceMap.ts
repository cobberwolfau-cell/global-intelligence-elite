/**
 * newsSourceMap.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-source RSS feed registry for each country.
 * Each country has a primary source plus 2-3 verified backup sources.
 * All URLs have been tested and confirmed to return HTTP 200 (or 301/302 redirect).
 *
 * Structure change: `sources` array replaces the old single `rssUrl` + `fallbackUrl`.
 * rssFetcher.ts will fetch all sources in parallel and merge/deduplicate results.
 */

export interface RssSource {
  outlet: string;    // Human-readable outlet name
  url: string;       // Verified RSS feed URL
  language: string;  // ISO 639-1 language code
}

export interface CountryNewsSources {
  primary: RssSource;
  backups: RssSource[];
}

export const NEWS_SOURCE_MAP: Record<string, CountryNewsSources> = {

  // ── ASIA ─────────────────────────────────────────────────────────────────

  Taiwan: {
    primary: {
      outlet: "RTI 中央廣播電臺",
      url: "https://www.rti.org.tw/rss",
      language: "zh",
    },
    backups: [
      { outlet: "自由時報", url: "https://news.ltn.com.tw/rss/all.xml", language: "zh" },
      { outlet: "自由時報政治版", url: "https://news.ltn.com.tw/rss/politics.xml", language: "zh" },
    ],
  },

  HongKong: {
    primary: {
      outlet: "RTHK 香港電台",
      url: "https://rthk.hk/rthk/ch/component/k2/1456533-feed.xml",
      language: "zh",
    },
    backups: [
      { outlet: "South China Morning Post", url: "https://www.scmp.com/rss/91/feed", language: "en" },
      { outlet: "RTHK English", url: "https://rthk.hk/rthk/en/component/k2/1456533-feed.xml", language: "en" },
    ],
  },

  Macau: {
    primary: {
      outlet: "Macau Post Daily",
      url: "https://www.macaupost.com/feed/",
      language: "en",
    },
    backups: [
      { outlet: "RTHK 香港電台", url: "https://rthk.hk/rthk/ch/component/k2/1456533-feed.xml", language: "zh" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  China: {
    primary: {
      outlet: "China Daily",
      url: "https://www.chinadaily.com.cn/rss/china_rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "Global Times", url: "https://www.globaltimes.cn/rss/outbrain.xml", language: "en" },
      { outlet: "South China Morning Post", url: "https://www.scmp.com/rss/91/feed", language: "en" },
    ],
  },

  Japan: {
    primary: {
      outlet: "NHK News",
      url: "https://www3.nhk.or.jp/rss/news/cat0.xml",
      language: "ja",
    },
    backups: [
      { outlet: "NHK 社会", url: "https://www3.nhk.or.jp/rss/news/cat1.xml", language: "ja" },
      { outlet: "毎日新聞", url: "https://mainichi.jp/rss/etc/mainichi-flash.rss", language: "ja" },
    ],
  },

  SouthKorea: {
    primary: {
      outlet: "聯合ニュース (Yonhap)",
      url: "https://www.yna.co.kr/rss/news.xml",
      language: "ko",
    },
    backups: [
      { outlet: "Korea Herald", url: "https://www.koreaherald.com/rss/020100000000.xml", language: "en" },
      { outlet: "Yonhap English", url: "https://en.yna.co.kr/RSS/news.xml", language: "en" },
    ],
  },

  NorthKorea: {
    primary: {
      outlet: "NK News",
      url: "https://www.nknews.org/feed/",
      language: "en",
    },
    backups: [
      { outlet: "KCNA Watch", url: "https://kcnawatch.org/newstream/atom/", language: "en" },
      { outlet: "Yonhap English", url: "https://en.yna.co.kr/RSS/news.xml", language: "en" },
    ],
  },

  Singapore: {
    primary: {
      outlet: "Channel NewsAsia",
      url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416",
      language: "en",
    },
    backups: [
      { outlet: "South China Morning Post", url: "https://www.scmp.com/rss/91/feed", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Malaysia: {
    primary: {
      outlet: "The Star Malaysia",
      url: "https://www.thestar.com.my/rss/News/Nation/",
      language: "en",
    },
    backups: [
      { outlet: "Channel NewsAsia", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Thailand: {
    primary: {
      outlet: "Bangkok Post",
      url: "https://www.bangkokpost.com/rss/data/topstories.xml",
      language: "en",
    },
    backups: [
      { outlet: "The Nation Thailand", url: "https://www.nationthailand.com/rss.xml", language: "en" },
      { outlet: "Channel NewsAsia", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416", language: "en" },
    ],
  },

  Philippines: {
    primary: {
      outlet: "Philstar",
      url: "https://www.philstar.com/rss/headlines",
      language: "en",
    },
    backups: [
      { outlet: "Philippine Daily Inquirer", url: "https://newsinfo.inquirer.net/feed", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Vietnam: {
    primary: {
      outlet: "VnExpress International",
      url: "https://e.vnexpress.net/rss/news.rss",
      language: "en",
    },
    backups: [
      { outlet: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss", language: "vi" },
      { outlet: "Channel NewsAsia", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416", language: "en" },
    ],
  },

  Indonesia: {
    primary: {
      outlet: "The Jakarta Post",
      url: "https://www.thejakartapost.com/feed",
      language: "en",
    },
    backups: [
      { outlet: "Channel NewsAsia", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  India: {
    primary: {
      outlet: "The Hindu",
      url: "https://www.thehindu.com/news/feeder/default.rss",
      language: "en",
    },
    backups: [
      { outlet: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Pakistan: {
    primary: {
      outlet: "Dawn",
      url: "https://www.dawn.com/feeds/home",
      language: "en",
    },
    backups: [
      { outlet: "The News International", url: "https://www.thenews.com.pk/rss/1/1", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Bangladesh: {
    primary: {
      outlet: "The Daily Star Bangladesh",
      url: "https://www.thedailystar.net/rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", language: "en" },
    ],
  },

  SriLanka: {
    primary: {
      outlet: "Ada Derana",
      url: "https://www.adaderana.lk/rss.php",
      language: "en",
    },
    backups: [
      { outlet: "Daily Mirror Sri Lanka", url: "https://www.dailymirror.lk/rss", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Myanmar: {
    primary: {
      outlet: "Myanmar Now",
      url: "https://myanmar-now.org/en/feed/",
      language: "en",
    },
    backups: [
      { outlet: "The Irrawaddy", url: "https://www.irrawaddy.com/feed", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Cambodia: {
    primary: {
      outlet: "The Cambodia Daily",
      url: "https://english.cambodiadaily.com/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Phnom Penh Post", url: "https://www.phnompenhpost.com/rss.xml", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Laos: {
    primary: {
      outlet: "Vientiane Times",
      url: "https://www.vientianetimes.org.la/freeContent/FreeConten_Home.php?rss=1",
      language: "en",
    },
    backups: [
      { outlet: "KPL News", url: "https://kpl.net.la/en/rss", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Mongolia: {
    primary: {
      outlet: "News.mn",
      url: "https://news.mn/en/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Montsame News Agency", url: "https://montsame.mn/en/rss", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Kazakhstan: {
    primary: {
      outlet: "Astana Times",
      url: "https://astanatimes.com/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Inform.kz", url: "https://www.inform.kz/en/rss", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Uzbekistan: {
    primary: {
      outlet: "Gazeta.uz",
      url: "https://www.gazeta.uz/en/rss",
      language: "en",
    },
    backups: [
      { outlet: "Kun.uz", url: "https://kun.uz/en/rss", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Israel: {
    primary: {
      outlet: "Haaretz",
      url: "https://www.haaretz.com/cmlink/1.628765",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "Arab News", url: "https://www.arabnews.com/rss.xml", language: "en" },
    ],
  },

  SaudiArabia: {
    primary: {
      outlet: "Arab News",
      url: "https://www.arabnews.com/rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "Daily Sabah", url: "https://www.dailysabah.com/rss", language: "en" },
    ],
  },

  UAE: {
    primary: {
      outlet: "Arab News",
      url: "https://www.arabnews.com/rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "The National", url: "https://www.thenationalnews.com/rss", language: "en" },
    ],
  },

  Iran: {
    primary: {
      outlet: "IRNA",
      url: "https://www.irna.ir/rss",
      language: "fa",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "Arab News", url: "https://www.arabnews.com/rss.xml", language: "en" },
    ],
  },

  Iraq: {
    primary: {
      outlet: "Iraq News",
      url: "https://www.iraqinews.com/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Arab News", url: "https://www.arabnews.com/rss.xml", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Turkey: {
    primary: {
      outlet: "Daily Sabah",
      url: "https://www.dailysabah.com/rss",
      language: "en",
    },
    backups: [
      { outlet: "Hürriyet Daily News", url: "https://www.hurriyetdailynews.com/rss", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  // ── EUROPE ───────────────────────────────────────────────────────────────

  UK: {
    primary: {
      outlet: "BBC News",
      url: "https://feeds.bbci.co.uk/news/rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "BBC UK", url: "https://feeds.bbci.co.uk/news/uk/rss.xml", language: "en" },
      { outlet: "The Guardian", url: "https://www.theguardian.com/uk/rss", language: "en" },
      { outlet: "The Independent", url: "https://www.independent.co.uk/news/uk/rss", language: "en" },
    ],
  },

  Germany: {
    primary: {
      outlet: "Tagesschau (ARD)",
      url: "https://www.tagesschau.de/xml/rss2",
      language: "de",
    },
    backups: [
      { outlet: "Der Spiegel", url: "https://www.spiegel.de/schlagzeilen/index.rss", language: "de" },
      { outlet: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-de-all", language: "de" },
    ],
  },

  France: {
    primary: {
      outlet: "Le Monde",
      url: "https://www.lemonde.fr/rss/une.xml",
      language: "fr",
    },
    backups: [
      { outlet: "Le Figaro", url: "https://www.lefigaro.fr/rss/figaro_actualites.xml", language: "fr" },
      { outlet: "RFI Français", url: "https://www.rfi.fr/fr/rss", language: "fr" },
    ],
  },

  Italy: {
    primary: {
      outlet: "ANSA",
      url: "https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml",
      language: "it",
    },
    backups: [
      { outlet: "Corriere della Sera", url: "https://www.corriere.it/rss/homepage.xml", language: "it" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Spain: {
    primary: {
      outlet: "El País",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
      language: "es",
    },
    backups: [
      { outlet: "El Mundo", url: "https://www.elmundo.es/rss/portada.xml", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Netherlands: {
    primary: {
      outlet: "NOS Nieuws",
      url: "https://feeds.nos.nl/nosnieuwsalgemeen",
      language: "nl",
    },
    backups: [
      { outlet: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-de-all", language: "de" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Belgium: {
    primary: {
      outlet: "RTBF Info",
      url: "https://www.rtbf.be/en-continu/info?output=rss",
      language: "fr",
    },
    backups: [
      { outlet: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml", language: "fr" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Switzerland: {
    primary: {
      outlet: "SRF News",
      url: "https://www.srf.ch/news/bnf/rss/19032223",
      language: "de",
    },
    backups: [
      { outlet: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-de-all", language: "de" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Sweden: {
    primary: {
      outlet: "SVT Nyheter",
      url: "https://www.svt.se/nyheter/rss.xml",
      language: "sv",
    },
    backups: [
      { outlet: "NRK Nyheter", url: "https://www.nrk.no/nyheter/siste.rss", language: "no" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Norway: {
    primary: {
      outlet: "NRK Nyheter",
      url: "https://www.nrk.no/nyheter/siste.rss",
      language: "no",
    },
    backups: [
      { outlet: "SVT Nyheter", url: "https://www.svt.se/nyheter/rss.xml", language: "sv" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Denmark: {
    primary: {
      outlet: "DR Nyheder",
      url: "https://www.dr.dk/nyheder/service/feeds/allenyheder",
      language: "da",
    },
    backups: [
      { outlet: "NRK Nyheter", url: "https://www.nrk.no/nyheter/siste.rss", language: "no" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Finland: {
    primary: {
      outlet: "Yle Uutiset",
      url: "https://yle.fi/rss/uutiset/tuoreimmat",
      language: "fi",
    },
    backups: [
      { outlet: "DR Nyheder", url: "https://www.dr.dk/nyheder/service/feeds/allenyheder", language: "da" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Poland: {
    primary: {
      outlet: "Polsat News",
      url: "https://www.polsatnews.pl/rss/wszystkie.xml",
      language: "pl",
    },
    backups: [
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Ukraine: {
    primary: {
      outlet: "Ukrainska Pravda (English)",
      url: "https://www.pravda.com.ua/eng/rss/view_news/",
      language: "en",
    },
    backups: [
      { outlet: "Kyiv Post", url: "https://www.kyivpost.com/feed", language: "en" },
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
    ],
  },

  Russia: {
    primary: {
      outlet: "TASS",
      url: "https://tass.ru/rss/v2.xml",
      language: "ru",
    },
    backups: [
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Greece: {
    primary: {
      outlet: "Ekathimerini",
      url: "https://www.ekathimerini.com/rss/news",
      language: "en",
    },
    backups: [
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Portugal: {
    primary: {
      outlet: "Correio da Manhã",
      url: "https://www.cmjornal.pt/rss",
      language: "pt",
    },
    backups: [
      { outlet: "RFI Français", url: "https://www.rfi.fr/fr/rss", language: "fr" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Austria: {
    primary: {
      outlet: "ORF News",
      url: "https://rss.orf.at/news.xml",
      language: "de",
    },
    backups: [
      { outlet: "SRF News", url: "https://www.srf.ch/news/bnf/rss/19032223", language: "de" },
      { outlet: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-de-all", language: "de" },
    ],
  },

  CzechRepublic: {
    primary: {
      outlet: "ČT24",
      url: "https://ct24.ceskatelevize.cz/rss/hlavni-zpravy",
      language: "cs",
    },
    backups: [
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Hungary: {
    primary: {
      outlet: "HVG",
      url: "https://hvg.hu/rss/itthon",
      language: "hu",
    },
    backups: [
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  Romania: {
    primary: {
      outlet: "Digi24",
      url: "https://www.digi24.ro/rss/stiri",
      language: "ro",
    },
    backups: [
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  // ── AMERICAS ─────────────────────────────────────────────────────────────

  US: {
    primary: {
      outlet: "NPR News",
      url: "https://feeds.npr.org/1002/rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", language: "en" },
      { outlet: "BBC US & Canada", url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", language: "en" },
    ],
  },

  Canada: {
    primary: {
      outlet: "Global News",
      url: "https://globalnews.ca/feed/",
      language: "en",
    },
    backups: [
      { outlet: "CBC News", url: "https://www.cbc.ca/cmlink/rss-topstories", language: "en" },
      { outlet: "BBC US & Canada", url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", language: "en" },
    ],
  },

  Mexico: {
    primary: {
      outlet: "La Jornada",
      url: "https://www.jornada.com.mx/rss/politica.xml",
      language: "es",
    },
    backups: [
      { outlet: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Brazil: {
    primary: {
      outlet: "Agência Brasil (EBC)",
      url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
      language: "pt",
    },
    backups: [
      { outlet: "G1 Globo", url: "https://g1.globo.com/rss/g1/", language: "pt" },
      { outlet: "BBC Brasil", url: "https://www.bbc.com/portuguese/brasil/index.xml", language: "pt" },
    ],
  },

  Argentina: {
    primary: {
      outlet: "Clarín",
      url: "https://www.clarin.com/rss/lo-ultimo/",
      language: "es",
    },
    backups: [
      { outlet: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Chile: {
    primary: {
      outlet: "La Tercera",
      url: "https://www.latercera.com/arc/outboundfeeds/rss/?outputType=xml",
      language: "es",
    },
    backups: [
      { outlet: "Clarín", url: "https://www.clarin.com/rss/lo-ultimo/", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Colombia: {
    primary: {
      outlet: "Radio Nacional de Colombia",
      url: "https://www.radionacional.co/rss.xml",
      language: "es",
    },
    backups: [
      { outlet: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Peru: {
    primary: {
      outlet: "El Comercio Perú",
      url: "https://elcomercio.pe/feed/",
      language: "es",
    },
    backups: [
      { outlet: "La Tercera", url: "https://www.latercera.com/arc/outboundfeeds/rss/?outputType=xml", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Venezuela: {
    primary: {
      outlet: "El Nacional",
      url: "https://www.elnacional.com/feed/",
      language: "es",
    },
    backups: [
      { outlet: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Cuba: {
    primary: {
      outlet: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      language: "en",
    },
    backups: [
      { outlet: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", language: "es" },
      { outlet: "RFE/RL", url: "https://www.rferl.org/api/epiqq", language: "en" },
    ],
  },

  Panama: {
    primary: {
      outlet: "La Prensa Panamá",
      url: "https://www.prensa.com/feed/",
      language: "es",
    },
    backups: [
      { outlet: "TVN Noticias", url: "https://www.tvn-2.com/rss", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Ecuador: {
    primary: {
      outlet: "El Comercio Ecuador",
      url: "https://www.elcomercio.com/feed/",
      language: "es",
    },
    backups: [
      { outlet: "La Tercera", url: "https://www.latercera.com/arc/outboundfeeds/rss/?outputType=xml", language: "es" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  // ── AFRICA ───────────────────────────────────────────────────────────────

  Egypt: {
    primary: {
      outlet: "Egypt Independent",
      url: "https://www.egyptindependent.com/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "Arab News", url: "https://www.arabnews.com/rss.xml", language: "en" },
    ],
  },

  Nigeria: {
    primary: {
      outlet: "Premium Times Nigeria",
      url: "https://www.premiumtimesng.com/feed",
      language: "en",
    },
    backups: [
      { outlet: "AllAfrica Nigeria", url: "https://allafrica.com/tools/headlines/rdf/nigeria/headlines.rdf", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  SouthAfrica: {
    primary: {
      outlet: "Mail & Guardian",
      url: "https://mg.co.za/feed",
      language: "en",
    },
    backups: [
      { outlet: "AllAfrica South Africa", url: "https://allafrica.com/tools/headlines/rdf/southafrica/headlines.rdf", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  Kenya: {
    primary: {
      outlet: "AllAfrica Kenya",
      url: "https://allafrica.com/tools/headlines/rdf/kenya/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Ethiopia: {
    primary: {
      outlet: "AllAfrica Ethiopia",
      url: "https://allafrica.com/tools/headlines/rdf/ethiopia/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Ghana: {
    primary: {
      outlet: "Ghanaian Times",
      url: "https://ghanaiantimes.com.gh/feed/",
      language: "en",
    },
    backups: [
      { outlet: "AllAfrica Nigeria", url: "https://allafrica.com/tools/headlines/rdf/nigeria/headlines.rdf", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Tanzania: {
    primary: {
      outlet: "Daily News Tanzania",
      url: "https://dailynews.co.tz/category/tanzania/feed",
      language: "en",
    },
    backups: [
      { outlet: "AllAfrica Kenya", url: "https://allafrica.com/tools/headlines/rdf/kenya/headlines.rdf", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Morocco: {
    primary: {
      outlet: "Hespress",
      url: "https://hespress.com/feed",
      language: "ar",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Algeria: {
    primary: {
      outlet: "AllAfrica Algeria",
      url: "https://allafrica.com/tools/headlines/rdf/algeria/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "RFI Français", url: "https://www.rfi.fr/fr/rss", language: "fr" },
    ],
  },

  Libya: {
    primary: {
      outlet: "Libya Herald",
      url: "https://libyaherald.com/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Libya Observer", url: "https://www.libyaobserver.ly/feed", language: "en" },
      { outlet: "AllAfrica Libya", url: "https://allafrica.com/tools/headlines/rdf/libya/headlines.rdf", language: "en" },
    ],
  },

  Sudan: {
    primary: {
      outlet: "AllAfrica Sudan",
      url: "https://allafrica.com/tools/headlines/rdf/sudan/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Sudan Tribune", url: "https://sudantribune.com/feed/", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  DRC: {
    primary: {
      outlet: "AllAfrica DRC",
      url: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Angola: {
    primary: {
      outlet: "AllAfrica Angola",
      url: "https://allafrica.com/tools/headlines/rdf/angola/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  Mozambique: {
    primary: {
      outlet: "AllAfrica Mozambique",
      url: "https://allafrica.com/tools/headlines/rdf/mozambique/headlines.rdf",
      language: "en",
    },
    backups: [
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
      { outlet: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", language: "en" },
    ],
  },

  // ── OCEANIA ──────────────────────────────────────────────────────────────

  Australia: {
    primary: {
      outlet: "ABC News Australia",
      url: "https://www.abc.net.au/news/feed/51120/rss.xml",
      language: "en",
    },
    backups: [
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
      { outlet: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", language: "en" },
    ],
  },

  NewZealand: {
    primary: {
      outlet: "RNZ News",
      url: "https://www.rnz.co.nz/rss/news.xml",
      language: "en",
    },
    backups: [
      { outlet: "ABC News Australia", url: "https://www.abc.net.au/news/feed/51120/rss.xml", language: "en" },
      { outlet: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", language: "en" },
    ],
  },

  PapuaNewGuinea: {
    primary: {
      outlet: "Post Courier PNG",
      url: "https://www.postcourier.com.pg/feed/",
      language: "en",
    },
    backups: [
      { outlet: "RNZ Pacific", url: "https://www.rnz.co.nz/rss/pacific.xml", language: "en" },
      { outlet: "ABC News Australia", url: "https://www.abc.net.au/news/feed/51120/rss.xml", language: "en" },
    ],
  },

  Fiji: {
    primary: {
      outlet: "FBC News Fiji",
      url: "https://www.fbcnews.com.fj/feed/",
      language: "en",
    },
    backups: [
      { outlet: "Fiji Times", url: "https://www.fijitimes.com/feed/", language: "en" },
      { outlet: "RNZ Pacific", url: "https://www.rnz.co.nz/rss/pacific.xml", language: "en" },
    ],
  },

  SolomonIslands: {
    primary: {
      outlet: "SIBC (Solomon Islands Broadcasting Corporation)",
      url: "https://www.sibconline.com.sb/feed/",
      language: "en",
    },
    backups: [
      { outlet: "RNZ Pacific", url: "https://www.rnz.co.nz/rss/pacific.xml", language: "en" },
      { outlet: "ABC News Australia", url: "https://www.abc.net.au/news/feed/51120/rss.xml", language: "en" },
    ],
  },

  // ── GLOBAL ───────────────────────────────────────────────────────────────

  Global: {
    primary: {
      outlet: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      language: "en",
    },
    backups: [
      { outlet: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", language: "en" },
      { outlet: "NPR News", url: "https://feeds.npr.org/1002/rss.xml", language: "en" },
    ],
  },
};
