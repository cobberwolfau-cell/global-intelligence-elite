import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IntelData, FinanceData, ParsedAnalysis } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// GLOBAL INTELLIGENCE ELITE — Utility Functions
// Design: Cyberpunk Intelligence Terminal
// ============================================================

export const formatDateTime = (date: Date): string =>
  new Intl.DateTimeFormat('zh-Hant-HK', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(date);

export const safeJSON = (text: string, fallback: unknown = null): unknown => {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
  } catch (e) { /* ignore */ }
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
  } catch (e) { /* ignore */ }
  return fallback;
};

export const parseIntelContent = (content: string): IntelData => {
  const text = content || '';
  return {
    date: (text.match(/【刊報日期】[：:]\s*([^\n]+)/) || [])[1] || '',
    confidence: (text.match(/【可信度】[：:]\s*([^\n]+)/) || [])[1] || '',
    subject: (text.match(/【主體】[：:]\s*([\s\S]*?)(?=\n【(?:分析|影響|出處|報導標題|連結|總體戰略研判|旅遊建議)】|$)/) || [])[1] || '',
    analysis: (text.match(/【分析】[：:]\s*([\s\S]*?)(?=\n【(?:影響|出處|報導標題|連結|總體戰略研判)】|$)/) || [])[1] || '',
    travelTips: (text.match(/【旅遊建議】[：:]\s*([\s\S]*?)(?=\n【(?:影響|出處|報導標題|連結|總體戰略研判|整體旅遊評估)】|$)/) || [])[1] || '',
    impact: (text.match(/【影響】[：:]\s*([\s\S]*?)(?=\n【(?:出處|報導標題|連結|總體戰略研判)】|$)/) || [])[1] || '',
    source: (text.match(/【出處】[：:]\s*([^\n]+)/) || [])[1] || '',
    articleTitle: (text.match(/【報導標題】[：:]\s*([^\n]+)/) || [])[1] || '',
    link: (text.match(/【連結】[：:]\s*([^\n]+)/) || [])[1] || '',
    strategicJudgment: (text.match(/【(?:總體戰略研判|整體旅遊評估)】[：:]\s*([\s\S]*?)$/) || [])[1]?.trim() || '',
  };
};

export const parseFinanceContent = (content: string): FinanceData => {
  const text = content || '';
  return {
    price: (text.match(/【最新報價】[：:]\s*([\s\S]*?)(?=\n【(?:資產標的|趨勢判定|市場分析|關鍵點位|期貨動向|出處|報導標題|連結)】|$)/) || [])[1] || '',
    asset: (text.match(/【資產標的】[：:]\s*([\s\S]*?)(?=\n【(?:趨勢判定|市場分析|關鍵點位|期貨動向|出處|報導標題|連結)】|$)/) || [])[1] || '',
    trend: (text.match(/【趨勢判定】[：:]\s*([^\n]+)/) || [])[1] || '',
    analysis: (text.match(/【市場分析】[：:]\s*([\s\S]*?)(?=\n【(?:關鍵點位|期貨動向|出處|報導標題|連結)】|$)/) || [])[1] || '',
    levels: (text.match(/【關鍵點位】[：:]\s*([\s\S]*?)(?=\n【(?:期貨動向|出處|報導標題|連結)】|$)/) || [])[1] || '',
    futures: (text.match(/【期貨動向】[：:]\s*([\s\S]*?)(?=\n【(?:出處|報導標題|連結)】|$)/) || [])[1] || '',
    source: (text.match(/【出處】[：:]\s*([^\n]+)/) || [])[1] || '',
    articleTitle: (text.match(/【報導標題】[：:]\s*([^\n]+)/) || [])[1] || '',
    link: (text.match(/【連結】[：:]\s*([^\n]+)/) || [])[1] || '',
  };
};

export const parseAnalysis = (raw: string): ParsedAnalysis => {
  if (!raw) return { items: [], summary: '' };
  let summary = '';
  let working = raw;
  // Match the standalone overall summary block preceded by a blank line (double newline)
  // This distinguishes the final overall summary from per-item 【總體戰略研判】 fields
  const summaryMatch = working.match(/\n\n【(?:總體戰略研判|總體資金流向研判|總體研判|結論)】[：:]([\/\s\S]*)$/); if (summaryMatch) {
    summary = summaryMatch[1].trim();
    working = working.slice(0, summaryMatch.index).trim();
  }
  const parts = working.split(/(?:^|\n)\d+[.、]\s*/).filter(Boolean);
  const items = parts.map((part, idx) => {
    const firstFieldIndex = part.indexOf('【');
    const title = (firstFieldIndex >= 0 ? part.slice(0, firstFieldIndex) : part).split('\n')[0].trim();
    const content = firstFieldIndex >= 0 ? part.slice(firstFieldIndex).trim() : part.trim();
    return { id: String(idx + 1), title, content };
  });
  return { items, summary };
};

export const readStoredKey = (): string => {
  try { return localStorage.getItem('gie_deepseek_key') || ''; } catch { return ''; }
};
