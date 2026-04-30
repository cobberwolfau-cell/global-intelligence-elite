// ============================================================
// GLOBAL INTELLIGENCE ELITE — Main Terminal Page
// Design: Cyberpunk Intelligence Terminal
// Dark background #020617, Indigo/Cyan accents, Glass morphism
// Space Grotesk (display) + JetBrains Mono (labels) + Inter (body)
// ============================================================

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { cn, formatDateTime, parseAnalysis, safeJSON } from '@/lib/utils';
import { callDeepSeek } from '@/lib/deepseek';
import { continents, countryNodes, intelCategories, financeCategories, timeframes } from '@/lib/constants';
import type { AppMode, MarketQuote, EmergencyItem, ChatMessage, ItemAnalysis, ParsedItem } from '@/lib/types';
import MarkdownLines from '@/components/MarkdownLines';
import IntelContent from '@/components/IntelContent';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// ─── Icon wrapper ──────────────────────────────────────────
const Icon = ({ name, className = '', size = 18 }: { name: string; className?: string; size?: number }) => {
  // Use createElement to avoid TypeScript JSX intrinsic element issues with custom web components
  const el = React.createElement('iconify-icon' as unknown as string, {
    icon: name,
    width: size,
    height: size,
    class: className,
  });
  return el as React.ReactElement;
};

// ─── Metric Card ───────────────────────────────────────────
const MetricCard = ({
  title, value, hint,
  accent = 'indigo'
}: {
  title: string; value: string; hint: string; accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
}) => {
  const accentClass = {
    indigo: 'text-indigo-300',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-300',
  }[accent];

  return (
    <div className="glass border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-slate-950/30">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>{title}</div>
      <div className={cn('text-2xl font-black', accentClass)} style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
      <div className="text-xs text-slate-400 mt-2">{hint}</div>
    </div>
  );
};

// ─── Toolbar Button ────────────────────────────────────────
const ToolbarButton = ({
  active, icon, children, onClick
}: {
  active: boolean; icon: string; children: React.ReactNode; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150',
      active
        ? 'bg-indigo-500/15 border-indigo-500/40 text-white shadow-lg shadow-indigo-950/40'
        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
    )}
  >
    <Icon name={icon} size={17} className={active ? 'text-indigo-300' : 'text-slate-400'} />
    <span className="text-sm font-medium">{children}</span>
  </button>
);

// ─── Main App ──────────────────────────────────────────────
export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('intel');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
    // Auto-detect based on screen width on first load
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
  });
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeContinent, setActiveContinent] = useState('asia');
  const [selectedCountry, setSelectedCountry] = useState('Taiwan');
  const [intelCategory, setIntelCategory] = useState('local');
  const [financeCategory, setFinanceCategory] = useState('equities');
  const [timeframe, setTimeframe] = useState('24h');
  const [itemCount, setItemCount] = useState(10);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'standard' | 'deep'>('standard');
  const [analysisRaw, setAnalysisRaw] = useState<{ intel: string; finance: string }>({ intel: '', finance: '' });
  const [executiveBriefing, setExecutiveBriefing] = useState('');
  const [entityGraph, setEntityGraph] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [marketQuotes, setMarketQuotes] = useState<MarketQuote[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('gie_watchlist') || '[]'); } catch { return []; }
  });
  const [watchOnly, setWatchOnly] = useState(false);
  const [emergencyItems, setEmergencyItems] = useState<EmergencyItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', text: '請輸入問題，我會根據目前頁面中的分析內容回應。' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [itemAnalyses, setItemAnalyses] = useState<Record<string, ItemAnalysis>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quotesLastUpdated, setQuotesLastUpdated] = useState<Date | null>(null);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(300); // 5 min in seconds
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Market Open Alert Helper ─────────────────────────
  // Returns alert info if within 5 minutes before a session opens
  const getMarketOpenAlert = (date: Date): { label: string; color: string; border: string; bg: string; icon: string } | null => {
    const utcHour = date.getUTCHours();
    const utcMin = date.getUTCMinutes();
    const totalMins = utcHour * 60 + utcMin;

    // Asia opens at 00:00 UTC → warn from 23:55 UTC (prev day) to 00:05 UTC
    const asiaOpen = 0 * 60; // 00:00 UTC
    const euroOpen = 7 * 60; // 07:00 UTC (London)
    const usOpen   = 13 * 60 + 30; // 13:30 UTC (NYSE)

    const sessions = [
      { open: asiaOpen, label: '亞洲盤', color: 'text-amber-300', border: 'border-amber-500/40', bg: 'bg-amber-500/10', icon: 'lucide:sunrise' },
      { open: euroOpen, label: '歐洲盤', color: 'text-blue-300', border: 'border-blue-500/40', bg: 'bg-blue-500/10', icon: 'lucide:building-2' },
      { open: usOpen,   label: '美洲盤', color: 'text-emerald-300', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', icon: 'lucide:landmark' },
    ];

    for (const s of sessions) {
      // Handle midnight wrap-around for Asia (23:55–24:00 = 1435–1440)
      const diff = s.open === 0
        ? (totalMins >= 1435 ? 1440 - totalMins : s.open - totalMins)
        : s.open - totalMins;
      if (diff >= 0 && diff <= 5) {
        return { label: s.label, color: s.color, border: s.border, bg: s.bg, icon: s.icon };
      }
    }
    return null;
  };

  // ─── Market Session Helper ─────────────────────────────
  const getMarketSession = (date: Date) => {
    const utcHour = date.getUTCHours();
    // Asia: 00:00-09:00 UTC (Tokyo/HK/Shanghai 08:00-17:00)
    if (utcHour >= 0 && utcHour < 9) return { label: '亞洲盤', color: 'text-amber-400', dot: 'bg-amber-400' };
    // Europe: 07:00-16:00 UTC (London 08:00-17:00 BST)
    if (utcHour >= 7 && utcHour < 16) return { label: '歐洲盤', color: 'text-blue-400', dot: 'bg-blue-400' };
    // Americas: 13:30-21:00 UTC (NYSE 09:30-17:00 ET)
    if (utcHour >= 13 && utcHour < 21) return { label: '美洲盤', color: 'text-emerald-400', dot: 'bg-emerald-400' };
    return { label: '收盤時段', color: 'text-slate-500', dot: 'bg-slate-500' };
  };

  // Clock + auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Countdown for auto-refresh (only in finance mode)
      setAutoRefreshCountdown(prev => {
        if (prev <= 1) return 300; // reset
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem('gie_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Derived labels
  const currentCountryLabel = useMemo(() => countryNodes.find(c => c.id === selectedCountry)?.label || '台灣', [selectedCountry]);
  const currentIntelCategoryLabel = useMemo(() => intelCategories.find(c => c.id === intelCategory)?.label || '在地消息', [intelCategory]);
  const currentFinanceCategoryLabel = useMemo(() => financeCategories.find(c => c.id === financeCategory)?.label || '全球股市大盤', [financeCategory]);
  const currentTimeframeLabel = useMemo(() => timeframes.find(t => t.id === timeframe)?.label || '當日', [timeframe]);
  const filteredCountries = useMemo(() => countryNodes.filter(c => c.continent === activeContinent), [activeContinent]);
  const currentRaw = analysisRaw[appMode] || '';
  const parsed = useMemo(() => parseAnalysis(currentRaw), [currentRaw]);
  const displayedItems = useMemo(
    () => watchOnly ? parsed.items.filter(item => watchlist.includes(item.title)) : parsed.items,
    [watchOnly, parsed.items, watchlist]
  );

  // ─── API Calls ─────────────────────────────────────────
  const loadEmergencyItems = useCallback(async () => {
    try {
      const text = await callDeepSeek('', [
        { role: 'system', content: '你負責輸出高密度風險摘要，內容需精煉、務實、不中斷格式。' },
        { role: 'user', content: '你是全球風險監控中心值班分析師。請以繁體中文輸出 5 則高優先級觀察，範圍可涵蓋地緣政治、金融市場、科技安全與供應鏈。\n格式必須如下：\n【標題】：...\n【摘要】：...\n每則僅兩行，不要加序號與其他說明。' },
      ], 0.5);
      const blocks = text.split('【標題】：').slice(1).map(chunk => {
        const [titlePart, rest = ''] = chunk.split('\n【摘要】：');
        return { title: (titlePart || '').trim(), summary: (rest || '').trim() };
      }).filter(x => x.title && x.summary);
      setEmergencyItems(blocks.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadQuotes = useCallback(async () => {
    if (appMode !== 'finance') return;
    setQuotesLoading(true);
    try {
      const text = await callDeepSeek('', [
        { role: 'system', content: '你是金融市場終端機。請僅輸出 JSON。' },
        { role: 'user', content: `請為「${currentFinanceCategoryLabel}」輸出 6 個代表性資產的估算快照。\n只可輸出 JSON 陣列，每個元素格式為 {"symbol":"","price":"","change":"","trend":"up|down|flat"}。不得輸出 Markdown。` }
      ], 0.2);
      const data = safeJSON(text, []);
      setMarketQuotes(Array.isArray(data) ? (data as MarketQuote[]).slice(0, 6) : []);
      setQuotesLastUpdated(new Date());
      setAutoRefreshCountdown(300); // reset countdown after refresh
    } catch {
      setMarketQuotes([]);
    } finally {
      setQuotesLoading(false);
    }
  }, [appMode, currentFinanceCategoryLabel]);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    setExpandedId(null);
    setExecutiveBriefing('');
    setEntityGraph('');
    setItemAnalyses({});
    try {
      // Inject today's date so the AI anchors its output to the current date
      const todayStr = new Date().toLocaleDateString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Taipei'
      }).replace(/\//g, '-');
      const isTravelCategory = appMode === 'intel' && intelCategory === 'travel';
      const dateContext = `今天日期是 ${todayStr}。`;

      // Detail level word-count specs
      const wordSpec = {
        brief:    { main: '25-40', analysis: '20-30', impact: '15-25', market: '25-40', futures: '15-25' },
        standard: { main: '50-70', analysis: '50-70', impact: '40-60', market: '50-70', futures: '30-50' },
        deep:     { main: '100-150', analysis: '100-150', impact: '80-120', market: '100-150', futures: '60-100' },
      }[detailLevel];
      const depthNote = detailLevel === 'brief'
        ? '請使用簡報模式，每則內容精簡扈要。'
        : detailLevel === 'deep'
        ? '請使用深度分析模式，每則提供詳盡的背景、因果連鎖與多面向影響分析。'
        : '請使用標準模式。';

      const prompt = appMode === 'intel'
        ? isTravelCategory
          ? `${dateContext}${depthNote}你是一名資深旅遊情報分析師。請以繁體中文針對「${currentCountryLabel}」整理屬於「${currentTimeframeLabel}」視角的 ${itemCount} 則旅遊資訊。【刊報日期】必須填寫 ${todayStr} 或近期實際日期，不得使用過舊日期。\n嚴格格式：\n1. 標題\n【刊報日期】：${todayStr}\n【可信度】：1-100\n【主體】：約 ${wordSpec.main} 字，涵蓋景點、交通、住宿、美食、節慶或旅遊安全\n【旅遊建議】：約 ${wordSpec.analysis} 字，實用的行程或注意事項\n【影響】：約 ${wordSpec.impact} 字，對旅遊計畫的影響\n【出處】：媒體、旅遊局或研判來源\n【連結】：若無法確認真實網址則填寫 N/A\n最後加上【整體旅遊評估】：內容，包含安全等級與推薦季節。`
          : `${dateContext}${depthNote}你是一名資深地緣戰略情報官。請以繁體中文針對「${currentCountryLabel}」的「${currentIntelCategoryLabel}」整理屬於「${currentTimeframeLabel}」視角的 ${itemCount} 則情報。【刊報日期】必須填寫 ${todayStr} 或近期實際日期，不得使用過舊日期。\n嚴格格式：\n1. 標題\n【刊報日期】：${todayStr}\n【可信度】：1-100\n【主體】：約 ${wordSpec.main} 字\n【分析】：約 ${wordSpec.analysis} 字\n【影響】：約 ${wordSpec.impact} 字\n【出處】：媒體、機構或研判來源\n【連結】：若無法確認真實網址則填寫 N/A\n最後加上【總體戰略研判】：內容。`
        : `${dateContext}${depthNote}你是一名宏觀市場策略師。請以繁體中文針對「${currentFinanceCategoryLabel}」整理屬於「${currentTimeframeLabel}」視角的 ${itemCount} 則市場動態。【刊報日期】必須填寫 ${todayStr} 或近期實際日期，不得使用過舊日期。\n嚴格格式：\n1. 標題\n【最新報價】：當前估算數字與漲跌幅\n【資產標的】：具體標的名稱\n【趨勢判定】：看多 / 看空 / 震盪\n【市場分析】：約 ${wordSpec.market} 字\n【關鍵點位】：一句話\n【期貨動向】：約 ${wordSpec.futures} 字\n【出處】：媒體、機構或研判來源\n【連結】：若無法確認真實網址則填寫 N/A\n最後加上【總體資金流向研判】：內容。`;
      const text = await callDeepSeek('', [
        { role: 'system', content: `你是專業終端機引擎，必須嚴格依照格式輸出，不要使用 Markdown 表格。今天日期是 ${todayStr}，所有【刊報日期】必須使用 ${todayStr} 或近期實際日期，不得使用過舊日期。` },
        { role: 'user', content: prompt }
      ], 0.35);
      setAnalysisRaw(prev => ({ ...prev, [appMode]: text }));
      setLastUpdated(new Date());
    } catch (e) {
      setError((e as Error).message || '分析失敗');
      setAnalysisRaw(prev => ({ ...prev, [appMode]: '' }));
    } finally {
      setLoading(false);
    }
  }, [appMode, currentCountryLabel, currentIntelCategoryLabel, currentFinanceCategoryLabel, currentTimeframeLabel, itemCount, detailLevel]);

  useEffect(() => { loadEmergencyItems(); }, [loadEmergencyItems]);
  useEffect(() => { loadAnalysis(); }, [loadAnalysis]);
  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  // Auto-refresh quotes every 5 minutes in finance mode
  useEffect(() => {
    if (appMode === 'finance' && autoRefreshCountdown === 1) {
      loadQuotes();
    }
  }, [autoRefreshCountdown, appMode, loadQuotes]);

  const runExecutiveBriefing = async () => {
    if (!currentRaw) return;
    setBriefingLoading(true);
    try {
      const text = await callDeepSeek('', [
        { role: 'system', content: '你是高階主管簡報撰寫員。請短、狠、準。' },
        { role: 'user', content: `根據以下內容，產出 3 點核心洞察與 2 點行動建議。\n${currentRaw}` }
      ], 0.3);
      setExecutiveBriefing(text);
    } catch {
      setExecutiveBriefing('產出簡報失敗。');
    } finally {
      setBriefingLoading(false);
    }
  };

  const runEntityGraph = async () => {
    if (!currentRaw || appMode !== 'intel') return;
    setGraphLoading(true);
    try {
      const text = await callDeepSeek('', [
        { role: 'system', content: '你是關係網絡分析員。請用條列方式輸出。' },
        { role: 'user', content: `根據以下情報，整理 4 個最重要的實體，並分別說明其利益、依賴與衝突。\n${currentRaw}` }
      ], 0.35);
      setEntityGraph(text);
    } catch {
      setEntityGraph('關係矩陣產出失敗。');
    } finally {
      setGraphLoading(false);
    }
  };

  const runItemAnalysis = async (item: ParsedItem, type: 'advice' | 'blind' | 'timeline') => {
    const key = `${item.id}_${type}`;
    setItemAnalyses(prev => ({ ...prev, [key]: { loading: true, text: prev[key]?.text || '' } }));
    let prompt = '';
    if (type === 'advice') prompt = appMode === 'intel'
      ? `針對以下情報提出 3 點戰略建議。\n標題：${item.title}\n內容：${item.content}`
      : `針對以下市場動態提出 3 點風險管理建議。\n標題：${item.title}\n內容：${item.content}`;
    if (type === 'blind') prompt = `你是一名 Red Team 分析師。請針對以下內容提出 3 個決策盲點或潛在風險。\n標題：${item.title}\n內容：${item.content}`;
    if (type === 'timeline') prompt = `請針對以下事件推演短期、中期、長期的可能演化。\n標題：${item.title}\n內容：${item.content}\n請以【短期】、【中期】、【長期】三段輸出。`;
    try {
      const text = await callDeepSeek('', [
        { role: 'system', content: '回應需結構化、短句化、決策導向。' },
        { role: 'user', content: prompt }
      ], 0.4);
      setItemAnalyses(prev => ({ ...prev, [key]: { loading: false, text } }));
    } catch {
      setItemAnalyses(prev => ({ ...prev, [key]: { loading: false, text: '分析失敗。' } }));
    }
  };

  const sendChat = async () => {
    const query = chatInput.trim();
    if (!query || chatLoading) return;
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const context = `${appMode === 'intel' ? '情報模式' : '金融模式'}\n${currentRaw || '目前沒有分析內容。'}`;
      const text = await callDeepSeek('', [
        { role: 'system', content: '你是終端機分析助理。僅根據提供的內容與合理推論回答，保持繁體中文、扼要且專業。' },
        { role: 'user', content: `背景資料：\n${context}\n\n使用者問題：${query}` }
      ], 0.35);
      setChatHistory(prev => [...prev, { role: 'assistant', text }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', text: '聊天引擎暫時無法連線。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const exportReport = () => {
    const content = [
      `Global Intelligence Elite Lite - ${appMode === 'intel' ? '情報報告' : '金融報告'}`,
      `時間：${formatDateTime(currentTime)}`,
      appMode === 'intel'
        ? `地區：${currentCountryLabel} / 頻道：${currentIntelCategoryLabel} / 期間：${currentTimeframeLabel}`
        : `資產：${currentFinanceCategoryLabel} / 期間：${currentTimeframeLabel}`,
      '',
      '【全域摘要】',
      executiveBriefing || '尚未產出',
      '',
      '【分析內容】',
      currentRaw || '尚無內容',
      '',
      '【關係矩陣】',
      entityGraph || '尚未產出'
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gie-lite-${appMode}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };


  const toggleWatch = (title: string) =>
    setWatchlist(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#020617' }}>
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      {/* Radial gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at top, rgba(79,70,229,0.20) 0%, transparent 32%), radial-gradient(circle at bottom right, rgba(6,182,212,0.15) 0%, transparent 28%)'
      }} />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-6">

        {/* ─── Header ─────────────────────────────────── */}
        <header className="glass border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl shadow-slate-950/40 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <Icon name="lucide:radar" size={22} className="text-indigo-300" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.32em] text-indigo-300" style={{ fontFamily: 'var(--font-mono)' }}>
                    Global Intelligence Elite Lite
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    DeepSeek 戰略情報終端機
                  </h1>
                </div>
              </div>
              <p className="text-sm md:text-base text-slate-400 max-w-4xl leading-7">
                以 DeepSeek API 驅動的單頁版本，保留雙模式、結構化分析、關注清單、主管簡報、關係矩陣、風險盲點與對話問答等核心能力。
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 min-w-[220px]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>系統時間</div>
                <div className="text-sm md:text-base font-semibold text-slate-200 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatDateTime(currentTime)}
                </div>
              </div>
              <div className="px-4 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-200">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot inline-block" />
                  系統已就緒
                </span>
              </div>
              {/* View Mode Toggle */}
              <div className="flex rounded-2xl border border-slate-700 bg-slate-950/60 overflow-hidden">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                    viewMode === 'desktop'
                      ? 'bg-indigo-500/20 text-indigo-200 border-r border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 border-r border-slate-700'
                  )}
                  title="網頁版"
                >
                  <Icon name="lucide:monitor" size={13} />
                  <span className="hidden sm:inline">網頁版</span>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                    viewMode === 'mobile'
                      ? 'bg-cyan-500/20 text-cyan-200'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                  title="手機版"
                >
                  <Icon name="lucide:smartphone" size={13} />
                  <span className="hidden sm:inline">手機版</span>
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={loadAnalysis}
                  className="px-4 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/20 transition-all duration-150 text-sm font-semibold text-indigo-200"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="lucide:refresh-cw" size={14} />
                    重新掃描
                  </span>
                </button>
                {lastUpdated && (
                  <div className="text-[11px] text-slate-500 text-center" style={{ fontFamily: 'var(--font-mono)' }}>
                    上次更新：{lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Taipei' })}
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* Market Open Alert (Finance mode: 5 min before session open) */}
          {appMode === 'finance' && (() => {
            const alert = getMarketOpenAlert(currentTime);
            if (!alert) return null;
            const minsLeft = (() => {
              const utcHour = currentTime.getUTCHours();
              const utcMin = currentTime.getUTCMinutes();
              const totalMins = utcHour * 60 + utcMin;
              const opens = [0, 7 * 60, 13 * 60 + 30];
              for (const open of opens) {
                const diff = open === 0
                  ? (totalMins >= 1435 ? 1440 - totalMins : open - totalMins)
                  : open - totalMins;
                if (diff >= 0 && diff <= 5) return diff;
              }
              return 0;
            })();
            return (
              <div className={`mt-4 rounded-2xl border ${alert.border} ${alert.bg} overflow-hidden animate-pulse`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex items-center gap-2 ${alert.color}`}>
                    <Icon name={alert.icon} size={16} className="shrink-0" />
                    <span className="text-xs uppercase tracking-[0.28em] font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                      即將開盤警報
                    </span>
                  </div>
                  <div className={`flex-1 text-sm font-semibold ${alert.color}`}>
                    {alert.label}即將開盤！剩餘 <span className="text-white font-black">{minsLeft}</span> 分鐘
                  </div>
                  <div className="text-[11px] text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
                    {currentTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Taipei' })}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${alert.border.replace('border-', 'bg-').replace('/40', '')} animate-ping`} />
                </div>
              </div>
            );
          })()}

          {/* Emergency Ticker */}
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-rose-500/10">
              <Icon name="lucide:siren" size={16} className="text-rose-300" />
              <div className="text-xs uppercase tracking-[0.28em] text-rose-300" style={{ fontFamily: 'var(--font-mono)' }}>
                高優先級觀察
              </div>
            </div>
            <div className="overflow-hidden px-4 py-3 text-sm text-slate-300">
              {emergencyItems.length ? (
                <div className="marquee-track inline-block">
                  {[...emergencyItems, ...emergencyItems].map((item, idx) => (
                    <span key={idx} className="mr-10 inline-flex items-center gap-2">
                      <span className="text-rose-300 font-semibold">{item.title}</span>
                      <span className="text-slate-400">{item.summary}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500">
                  {'正在載入高優先級觀察...'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ─── Main Grid ──────────────────────────────── */}
        {/* ─── Mobile Bottom Navigation Bar ─────────────── */}
        {viewMode === 'mobile' && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-slate-950">
            <Sheet open={showLeftPanel} onOpenChange={setShowLeftPanel}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors">
                  <Icon name="lucide:sliders-horizontal" size={20} />
                  <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>控制面板</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-[340px] bg-slate-950 border-slate-800 p-0 overflow-y-auto custom-scrollbar">
                <SheetHeader className="px-4 pt-5 pb-3 border-b border-slate-800">
                  <SheetTitle className="text-sm font-semibold text-slate-200" style={{ fontFamily: 'var(--font-display)' }}>控制面板</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <div className="glass border border-slate-800 rounded-3xl p-4">
                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button onClick={() => setAppMode('intel')} className={cn('rounded-2xl px-4 py-3 border text-sm font-semibold transition-all duration-150', appMode === 'intel' ? 'bg-indigo-500/15 border-indigo-500/40 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400')} style={{ fontFamily: 'var(--font-display)' }}><span className="flex items-center justify-center gap-2"><Icon name="lucide:shield" size={14} />情報模式</span></button>
                      <button onClick={() => setAppMode('finance')} className={cn('rounded-2xl px-4 py-3 border text-sm font-semibold transition-all duration-150', appMode === 'finance' ? 'bg-cyan-500/15 border-cyan-500/40 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400')} style={{ fontFamily: 'var(--font-display)' }}><span className="flex items-center justify-center gap-2"><Icon name="lucide:line-chart" size={14} />金融模式</span></button>
                    </div>
                    {/* Timeframe */}
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>時間維度</div>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {timeframes.map(tf => (<button key={tf.id} onClick={() => setTimeframe(tf.id)} className={cn('rounded-xl px-3 py-2 text-xs border transition-all duration-150', timeframe === tf.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/50 text-slate-400')}>{tf.label}</button>))}
                    </div>
                    {/* Item Count */}
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>分析筆數</div>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[10, 15, 20].map(n => (<button key={n} onClick={() => setItemCount(n)} className={cn('rounded-xl px-3 py-2 text-xs border transition-all duration-150', itemCount === n ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200' : 'border-slate-800 bg-slate-950/50 text-slate-400')}>{n} 則</button>))}
                    </div>
                    {/* Detail Level */}
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>詳細程度</div>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {([{id:'brief',label:'簡報',hint:'~50字'},{id:'standard',label:'標準',hint:'~100字'},{id:'deep',label:'深度',hint:'~200字'}] as const).map(d => (<button key={d.id} onClick={() => setDetailLevel(d.id)} className={cn('rounded-xl px-2 py-2 text-xs border transition-all duration-150 flex flex-col items-center gap-0.5', detailLevel === d.id ? 'border-violet-500/40 bg-violet-500/10 text-violet-200' : 'border-slate-800 bg-slate-950/50 text-slate-400')}><span>{d.label}</span><span className="text-[10px] opacity-60">{d.hint}</span></button>))}
                    </div>
                    {appMode === 'intel' ? (
                      <>
                        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>大洲部署</div>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                          {continents.map(continent => (<button key={continent.id} onClick={() => { setActiveContinent(continent.id); const first = countryNodes.find(c => c.continent === continent.id); if (first) setSelectedCountry(first.id); }} className={cn('rounded-xl px-3 py-2 text-xs border transition-all duration-150', activeContinent === continent.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/50 text-slate-400')}>{continent.label}</button>))}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>節點目標</div>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                          {filteredCountries.map(country => (<button key={country.id} onClick={() => setSelectedCountry(country.id)} className={cn('rounded-xl px-3 py-2 text-xs border transition-all duration-150 text-left', selectedCountry === country.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/50 text-slate-400')}>{country.label}</button>))}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>情報頻道</div>
                        <div className="space-y-2">
                          {intelCategories.map(item => (<ToolbarButton key={item.id} active={intelCategory === item.id} icon={item.icon} onClick={() => setIntelCategory(item.id)}>{item.label}</ToolbarButton>))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>市場頻道</div>
                        <div className="space-y-2">
                          {financeCategories.map(item => (<ToolbarButton key={item.id} active={financeCategory === item.id} icon={item.icon} onClick={() => setFinanceCategory(item.id)}>{item.label}</ToolbarButton>))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Watchlist */}
                  <div className="glass border border-slate-800 rounded-3xl p-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>關注清單</div>
                      <button onClick={() => setWatchOnly(v => !v)} className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors">{watchOnly ? '顯示全部' : '只看已關注'}</button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-auto custom-scrollbar pr-1">
                      {watchlist.length ? watchlist.map((title, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-300 flex items-start justify-between gap-2">
                          <span className="flex-1 text-xs leading-5">{title}</span>
                          <button onClick={() => toggleWatch(title)} className="text-slate-600 hover:text-rose-400 transition-colors shrink-0 mt-0.5"><Icon name="lucide:x" size={12} /></button>
                        </div>
                      )) : <div className="text-sm text-slate-500">尚未加入任何項目。</div>}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={loadAnalysis}
              className="flex flex-col items-center gap-1 text-indigo-300 hover:text-indigo-100 transition-colors"
            >
              <Icon name={loading ? 'lucide:loader-2' : 'lucide:refresh-cw'} size={20} className={loading ? 'animate-spin' : ''} />
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>重新掃描</span>
            </button>

            <Sheet open={showRightPanel} onOpenChange={setShowRightPanel}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors relative">
                  <Icon name="lucide:message-square" size={20} />
                  <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>對話助手</span>
                  {chatHistory.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[9px] text-white flex items-center justify-center">{chatHistory.length}</span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90vw] max-w-[400px] bg-slate-950 border-slate-800 p-0 flex flex-col">
                <SheetHeader className="px-4 pt-5 pb-3 border-b border-slate-800 shrink-0">
                  <SheetTitle className="text-sm font-semibold text-slate-200" style={{ fontFamily: 'var(--font-display)' }}>對話分析助手</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={cn('rounded-2xl px-4 py-3 text-sm leading-6', msg.role === 'user' ? 'bg-indigo-500/12 border border-indigo-500/25 text-indigo-100 ml-6' : 'bg-slate-900 border border-slate-800 text-slate-300 mr-6')}>{msg.text}</div>
                  ))}
                  {chatLoading && (
                    <div className="rounded-2xl px-4 py-3 text-sm bg-slate-900 border border-slate-800 text-slate-400 mr-6 flex items-center gap-2">
                      <Icon name="lucide:loader-2" size={13} className="animate-spin" />正在分析中...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="shrink-0 p-3 border-t border-slate-800 flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="輸入問題…" className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600 transition-colors" />
                  <button onClick={sendChat} disabled={chatLoading} className="px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors">送出</button>
                </div>
                {/* Quick Stats */}
                <div className="shrink-0 p-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">關注項目</div>
                    <div className="text-lg font-bold text-amber-400" style={{ fontFamily: 'var(--font-mono)' }}>{watchlist.length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">當前分析</div>
                    <div className="text-lg font-bold text-indigo-300" style={{ fontFamily: 'var(--font-mono)' }}>{parsed.items.length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">高優先觀察</div>
                    <div className="text-lg font-bold text-rose-400" style={{ fontFamily: 'var(--font-mono)' }}>{emergencyItems.length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">對話記錄</div>
                    <div className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'var(--font-mono)' }}>{chatHistory.length}</div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        <div className={cn(
          'grid gap-6',
          viewMode === 'desktop'
            ? 'grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_360px]'
            : 'grid-cols-1',
          viewMode === 'mobile' && 'pb-24'
        )}>

          {/* ─── Left Sidebar ─────────────────────────── */}
          <aside className={cn('space-y-4', viewMode === 'mobile' && 'hidden')}>
            <div className="glass border border-slate-800 rounded-3xl p-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => setAppMode('intel')}
                  className={cn(
                    'rounded-2xl px-4 py-3 border text-sm font-semibold transition-all duration-150',
                    appMode === 'intel'
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-white shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="lucide:shield" size={14} />
                    情報模式
                  </span>
                </button>
                <button
                  onClick={() => setAppMode('finance')}
                  className={cn(
                    'rounded-2xl px-4 py-3 border text-sm font-semibold transition-all duration-150',
                    appMode === 'finance'
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="lucide:line-chart" size={14} />
                    金融模式
                  </span>
                </button>
              </div>

              {/* Timeframe */}
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>時間維度</div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {timeframes.map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-xs border transition-all duration-150',
                      timeframe === tf.id
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Item Count */}
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>分析筆數</div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setItemCount(n)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-xs border transition-all duration-150',
                      itemCount === n
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    )}
                  >
                    {n} 則
                  </button>
                ))}
              </div>

              {/* Detail Level */}
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>詳細程度</div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {([
                  { id: 'brief', label: '簡報', hint: '~50字' },
                  { id: 'standard', label: '標準', hint: '~100字' },
                  { id: 'deep', label: '深度', hint: '~200字' },
                ] as const).map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDetailLevel(d.id)}
                    title={d.hint}
                    className={cn(
                      'rounded-xl px-2 py-2 text-xs border transition-all duration-150 flex flex-col items-center gap-0.5',
                      detailLevel === d.id
                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    )}
                  >
                    <span>{d.label}</span>
                    <span className="text-[10px] opacity-60">{d.hint}</span>
                  </button>
                ))}
              </div>

              {appMode === 'intel' ? (
                <>
                  {/* Continent selector */}
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>大洲部署</div>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {continents.map(continent => (
                      <button
                        key={continent.id}
                        onClick={() => {
                          setActiveContinent(continent.id);
                          const first = countryNodes.find(c => c.continent === continent.id);
                          if (first) setSelectedCountry(first.id);
                        }}
                        className={cn(
                          'rounded-xl px-3 py-2 text-xs border transition-all duration-150',
                          activeContinent === continent.id
                            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        {continent.label}
                      </button>
                    ))}
                  </div>

                  {/* Country selector */}
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>節點目標</div>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {filteredCountries.map(country => (
                      <button
                        key={country.id}
                        onClick={() => setSelectedCountry(country.id)}
                        className={cn(
                          'rounded-xl px-3 py-2 text-xs border transition-all duration-150 text-left',
                          selectedCountry === country.id
                            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        {country.label}
                      </button>
                    ))}
                  </div>

                  {/* Intel categories */}
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>情報頻道</div>
                  <div className="space-y-2">
                    {intelCategories.map(item => (
                      <ToolbarButton
                        key={item.id}
                        active={intelCategory === item.id}
                        icon={item.icon}
                        onClick={() => setIntelCategory(item.id)}
                      >
                        {item.label}
                      </ToolbarButton>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Finance categories */}
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>市場頻道</div>
                  <div className="space-y-2">
                    {financeCategories.map(item => (
                      <ToolbarButton
                        key={item.id}
                        active={financeCategory === item.id}
                        icon={item.icon}
                        onClick={() => setFinanceCategory(item.id)}
                      >
                        {item.label}
                      </ToolbarButton>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Watchlist */}
            <div className="glass border border-slate-800 rounded-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  關注清單
                </div>
                <button
                  onClick={() => setWatchOnly(v => !v)}
                  className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  {watchOnly ? '顯示全部' : '只看已關注'}
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-auto custom-scrollbar pr-1">
                {watchlist.length ? watchlist.map((title, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-300 flex items-start justify-between gap-2"
                  >
                    <span className="flex-1 text-xs leading-5">{title}</span>
                    <button
                      onClick={() => toggleWatch(title)}
                      className="text-slate-600 hover:text-rose-400 transition-colors shrink-0 mt-0.5"
                    >
                      <Icon name="lucide:x" size={12} />
                    </button>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500">尚未加入任何項目。</div>
                )}
              </div>
            </div>
          </aside>

          {/* ─── Main Content ──────────────────────────── */}
          <main className="space-y-4 min-w-0">
            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="模式"
                value={appMode === 'intel' ? 'INTEL' : 'FINANCE'}
                hint={appMode === 'intel' ? `${currentCountryLabel} / ${currentIntelCategoryLabel}` : currentFinanceCategoryLabel}
                accent={appMode === 'intel' ? 'indigo' : 'amber'}
              />
              <MetricCard
                title="分析筆數"
                value={String(parsed.items.length).padStart(2, '0')}
                hint={`期間：${currentTimeframeLabel}`}
                accent="emerald"
              />
              <MetricCard
                title="系統狀態"
                value="ONLINE"
                hint="後端 API 已就緒"
                accent="indigo"
              />
            </div>

            {/* Market Snapshot (Finance mode) */}
            {appMode === 'finance' && (
              <section className="glass border border-slate-800 rounded-3xl p-4 md:p-5">
                {/* Finance Header Bar */}
                <div className="flex flex-col gap-3 mb-4">
                  {/* Top row: title + refresh */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>市場快照</div>
                      <div className="text-lg font-bold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>{currentFinanceCategoryLabel}</div>
                    </div>
                    <button
                      onClick={loadQuotes}
                      disabled={quotesLoading}
                      className="text-sm text-cyan-300 hover:text-cyan-200 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Icon name={quotesLoading ? 'lucide:loader-2' : 'lucide:refresh-cw'} size={13} className={quotesLoading ? 'animate-spin' : ''} />
                      刷新快照
                    </button>
                  </div>
                  {/* Bottom row: live clock, market session, last updated, countdown */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {/* Live clock */}
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                      {currentTime.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Taipei' })}
                    </div>
                    {/* Market session */}
                    {(() => {
                      const session = getMarketSession(currentTime);
                      return (
                        <div className={`flex items-center gap-1.5 ${session.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${session.dot} inline-block`} />
                          {session.label}
                        </div>
                      );
                    })()}
                    {/* Last updated */}
                    {quotesLastUpdated && (
                      <div className="text-slate-500">
                        上次更新：{quotesLastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Taipei' })}
                      </div>
                    )}
                    {/* Auto-refresh countdown */}
                    <div className="text-slate-600">
                      自動刷新：{Math.floor(autoRefreshCountdown / 60).toString().padStart(2, '0')}:{(autoRefreshCountdown % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {quotesLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl p-4 border border-slate-800 bg-slate-950/50 h-24 animate-pulse" />
                      ))
                    : marketQuotes.length
                      ? marketQuotes.map((q, idx) => (
                          <div key={idx} className="rounded-2xl p-4 border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="text-xs uppercase tracking-[0.18em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>{q.symbol}</div>
                              {quotesLastUpdated && (
                                <div className="text-[10px] text-slate-600" style={{ fontFamily: 'var(--font-mono)' }}>
                                  {quotesLastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Taipei' })}
                                </div>
                              )}
                            </div>
                            <div className="text-xl font-black text-white mt-2" style={{ fontFamily: 'var(--font-display)' }}>{q.price}</div>
                            <div className={cn(
                              'text-sm mt-2 flex items-center gap-1.5',
                              q.trend === 'up' ? 'text-emerald-400' : q.trend === 'down' ? 'text-rose-400' : 'text-amber-400'
                            )}>
                              <Icon
                                name={q.trend === 'up' ? 'lucide:trending-up' : q.trend === 'down' ? 'lucide:trending-down' : 'lucide:minus'}
                                size={14}
                              />
                              {q.change}
                            </div>
                          </div>
                        ))
                      : <div className="text-sm text-slate-500 col-span-full">尚未取得市場快照。</div>
                  }
                </div>
              </section>
            )}

            {/* Analysis Panel */}
            <section className="glass border border-slate-800 rounded-3xl p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>分析主面板</div>
                    <div className="text-[11px] text-amber-400/70 border border-amber-500/20 bg-amber-500/5 rounded-full px-2 py-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                      AI 研判 · {currentTime.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Taipei' })}
                      {appMode === 'finance' && (
                        <span className="ml-1 text-cyan-400/70">
                          {currentTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Taipei' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {appMode === 'intel' ? `${currentCountryLabel} · ${currentIntelCategoryLabel}` : currentFinanceCategoryLabel}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={runExecutiveBriefing}
                    className="px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 text-sm font-semibold text-indigo-200 transition-colors"
                  >
                    {briefingLoading ? (
                      <span className="flex items-center gap-2"><Icon name="lucide:loader-2" size={13} className="animate-spin" />產出中...</span>
                    ) : '主管簡報'}
                  </button>
                  {appMode === 'intel' && (
                    <button
                      onClick={runEntityGraph}
                      className="px-4 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 text-sm font-semibold text-purple-200 transition-colors"
                    >
                      {graphLoading ? (
                        <span className="flex items-center gap-2"><Icon name="lucide:loader-2" size={13} className="animate-spin" />產出中...</span>
                      ) : '關係矩陣'}
                    </button>
                  )}
                  <button
                    onClick={exportReport}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-950/60 hover:border-slate-600 text-sm font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="lucide:download" size={13} />
                    匯出 TXT
                  </button>
                </div>
              </div>

              {/* Error / Warning */}
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
                  <div className="flex items-start gap-2">
                    <Icon name="lucide:alert-circle" size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold mb-1">{error}</div>
                      {error.includes('餘額不足') && (
                        <a
                          href="https://platform.deepseek.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-100 underline underline-offset-2 transition-colors"
                        >
                          <Icon name="lucide:external-link" size={11} />
                          前往 DeepSeek 平台充值
                        </a>
                      )}

                    </div>
                  </div>
                </div>
              )}


              {/* Executive Briefing */}
              {executiveBriefing && (
                <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 fade-in-up">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-indigo-300 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>全域摘要</div>
                  <div className="space-y-2">
                    <MarkdownLines text={executiveBriefing} />
                  </div>
                </div>
              )}

              {/* Entity Graph */}
              {entityGraph && appMode === 'intel' && (
                <div className="mb-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 fade-in-up">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-purple-300 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>實體關係矩陣</div>
                  <div className="space-y-2">
                    <MarkdownLines text={entityGraph} />
                  </div>
                </div>
              )}

              {/* Analysis Items */}
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="h-28 rounded-2xl border border-slate-800 bg-slate-950/50 animate-pulse" />
                    ))
                  : displayedItems.length
                    ? displayedItems.map(item => {
                        const advice = itemAnalyses[`${item.id}_advice`] || { loading: false, text: '' };
                        const blind = itemAnalyses[`${item.id}_blind`] || { loading: false, text: '' };
                        const timeline = itemAnalyses[`${item.id}_timeline`] || { loading: false, text: '' };
                        const expanded = expandedId === item.id;

                        return (
                          <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 overflow-hidden hover:border-slate-700 transition-colors">
                            {/* Use div instead of button to avoid nested <button> DOM violation */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setExpandedId(expanded ? null : item.id)}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(expanded ? null : item.id); } }}
                              className="w-full px-4 md:px-5 py-4 text-left flex items-start justify-between gap-4 hover:bg-slate-900/40 transition-colors cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {item.id}
                                  </span>
                                  <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {appMode === 'intel' ? 'Intel Item' : 'Market Item'}
                                  </span>
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white break-words" style={{ fontFamily: 'var(--font-display)' }}>
                                  {item.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  onClick={e => { e.stopPropagation(); toggleWatch(item.title); }}
                                  className={cn(
                                    'px-3 py-2 rounded-xl border text-xs font-semibold transition-colors',
                                    watchlist.includes(item.title)
                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                      : 'border-slate-700 bg-slate-950/70 text-slate-400 hover:border-slate-600'
                                  )}
                                >
                                  {watchlist.includes(item.title) ? (
                                    <span className="flex items-center gap-1"><Icon name="lucide:star" size={11} />已關注</span>
                                  ) : (
                                    <span className="flex items-center gap-1"><Icon name="lucide:star" size={11} />加入關注</span>
                                  )}
                                </button>
                                <Icon
                                  name={expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'}
                                  className="text-slate-400"
                                  size={18}
                                />
                              </div>
                            </div>

                            {expanded && (
                              <div className="px-4 md:px-5 pb-5 border-t border-slate-800 pt-4 space-y-4 fade-in-up">
                                <IntelContent content={item.content} mode={appMode} />

                                <div className="flex flex-wrap gap-2 pt-1">
                                  <button
                                    onClick={() => runItemAnalysis(item, 'advice')}
                                    className="px-3 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 text-xs font-semibold text-indigo-200 transition-colors"
                                  >
                                    {advice.loading ? (
                                      <span className="flex items-center gap-1.5"><Icon name="lucide:loader-2" size={11} className="animate-spin" />分析中...</span>
                                    ) : '戰略建議'}
                                  </button>
                                  <button
                                    onClick={() => runItemAnalysis(item, 'blind')}
                                    className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-xs font-semibold text-rose-200 transition-colors"
                                  >
                                    {blind.loading ? (
                                      <span className="flex items-center gap-1.5"><Icon name="lucide:loader-2" size={11} className="animate-spin" />掃描中...</span>
                                    ) : '決策盲點'}
                                  </button>
                                  <button
                                    onClick={() => runItemAnalysis(item, 'timeline')}
                                    className="px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-xs font-semibold text-emerald-200 transition-colors"
                                  >
                                    {timeline.loading ? (
                                      <span className="flex items-center gap-1.5"><Icon name="lucide:loader-2" size={11} className="animate-spin" />推演中...</span>
                                    ) : '時間軸推演'}
                                  </button>
                                </div>

                                {advice.text && (
                                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 fade-in-up">
                                    <div className="text-[11px] uppercase tracking-[0.24em] text-indigo-300 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>戰略建議</div>
                                    <div className="space-y-2"><MarkdownLines text={advice.text} /></div>
                                  </div>
                                )}
                                {blind.text && (
                                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 fade-in-up">
                                    <div className="text-[11px] uppercase tracking-[0.24em] text-rose-300 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>決策盲點</div>
                                    <div className="space-y-2"><MarkdownLines text={blind.text} /></div>
                                  </div>
                                )}
                                {timeline.text && (
                                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 fade-in-up">
                                    <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>時間軸推演</div>
                                    <div className="space-y-2"><MarkdownLines text={timeline.text} /></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })
                    : (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center text-slate-500">
                          {'目前沒有可顯示的分析項目。'}
                        </div>
                      )
                }
              </div>

              {/* Summary */}
              {parsed.summary && (
                <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 fade-in-up">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>總體研判</div>
                  <div className="space-y-2"><MarkdownLines text={parsed.summary} /></div>
                </div>
              )}
            </section>
          </main>

          {/* ─── Right Sidebar ─────────────────────────── */}
          <aside className={cn('space-y-4 min-w-0', viewMode === 'mobile' && 'hidden')}>
            {/* Chat Assistant */}
            <div className="glass border border-slate-800 rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="lucide:message-square" size={14} className="text-indigo-300" />
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  對話分析助手
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 h-[440px] overflow-auto custom-scrollbar p-3 space-y-3">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-6',
                      msg.role === 'user'
                        ? 'bg-indigo-500/12 border border-indigo-500/25 text-indigo-100 ml-6'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 mr-6'
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                {chatLoading && (
                  <div className="rounded-2xl px-4 py-3 text-sm bg-slate-900 border border-slate-800 text-slate-400 mr-6 flex items-center gap-2">
                    <Icon name="lucide:loader-2" size={13} className="animate-spin" />
                    正在分析中...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="輸入問題，例如：哪一項風險最值得關注？"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600 transition-colors"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading}
                  className="px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                >
                  送出
                </button>
              </div>
            </div>

            {/* Usage Guide */}
            <div className="glass border border-slate-800 rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="lucide:book-open" size={14} className="text-slate-400" />
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  使用說明
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-400 leading-7">
                <div className="flex gap-3">
                  <span className="text-indigo-400 font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>01</span>
                  <p>選擇情報模式或金融模式，系統將自動進行分析。</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-indigo-400 font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>02</span>
                  <p>切換地區、頻道與時間維度以精細調整分析範圍。</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-indigo-400 font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>03</span>
                  <p>使用「主管簡報」、「關係矩陣」與單則項目的進階按鈕擴展洞察。</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-indigo-400 font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>04</span>
                  <p>如需外部資料來源驗證，建議後續再接入新聞 API 或自建後端搜尋代理。</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass border border-slate-800 rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="lucide:activity" size={14} className="text-slate-400" />
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  快速統計
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">關注項目</span>
                  <span className="text-sm font-bold text-amber-400" style={{ fontFamily: 'var(--font-mono)' }}>{watchlist.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">當前分析</span>
                  <span className="text-sm font-bold text-indigo-300" style={{ fontFamily: 'var(--font-mono)' }}>{parsed.items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">高優先觀察</span>
                  <span className="text-sm font-bold text-rose-400" style={{ fontFamily: 'var(--font-mono)' }}>{emergencyItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">對話記錄</span>
                  <span className="text-sm font-bold text-emerald-400" style={{ fontFamily: 'var(--font-mono)' }}>{chatHistory.length}</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
