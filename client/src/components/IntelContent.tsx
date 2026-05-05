// ============================================================
// GLOBAL INTELLIGENCE ELITE — Intel Content Renderer
// Design: Cyberpunk Intelligence Terminal
// ============================================================

import React from 'react';
import { parseIntelContent, parseFinanceContent } from '@/lib/utils';
import type { AppMode } from '@/lib/types';

interface IntelContentProps {
  content: string;
  mode: AppMode;
}

const FieldBlock = ({
  label,
  value,
  accent = 'slate',
}: {
  label: string;
  value: string;
  accent?: 'slate' | 'indigo' | 'purple' | 'emerald' | 'rose' | 'cyan' | 'amber';
}) => {
  const accentMap = {
    slate: { border: 'border-slate-800', label: 'text-slate-500' },
    indigo: { border: 'border-indigo-500/20', label: 'text-indigo-300' },
    purple: { border: 'border-purple-500/20', label: 'text-purple-300' },
    emerald: { border: 'border-emerald-500/20', label: 'text-emerald-300' },
    rose: { border: 'border-rose-500/20', label: 'text-rose-300' },
    cyan: { border: 'border-cyan-500/20', label: 'text-cyan-300' },
    amber: { border: 'border-amber-500/20', label: 'text-amber-300' },
  };
  const style = accentMap[accent];

  return (
    <div className={`rounded-xl bg-slate-950/60 border ${style.border} p-4`}>
      <div className={`text-xs uppercase tracking-[0.24em] ${style.label} mb-2`} style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div className="text-slate-300 leading-7 text-sm whitespace-pre-wrap">{value || '未提供'}</div>
    </div>
  );
};

/**
 * Render a source block showing:
 *  - Media/institution name (source)
 *  - Article title (articleTitle) — the specific report being cited
 *  - Clickable "查看原文" link if a valid URL is provided
 */
const SourceBlock = ({
  source,
  articleTitle,
  link,
}: {
  source: string;
  articleTitle: string;
  link: string;
}) => {
  const isValidUrl = (s: string) => {
    try {
      const url = new URL(s);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };
  const hasLink = link && link.trim() !== '' && link.trim().toUpperCase() !== 'N/A' && isValidUrl(link.trim());
  const hasArticleTitle = articleTitle && articleTitle.trim() !== '' && articleTitle.trim().toUpperCase() !== 'N/A';

  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 col-span-2">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>出處</div>
      {/* Media / institution name */}
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-slate-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>媒體</span>
        <span className="text-slate-200 text-sm font-medium">{source || '未提供'}</span>
      </div>
      {/* Article title */}
      {hasArticleTitle && (
        <div className="flex items-start gap-2 flex-wrap mb-2">
          <span className="text-slate-400 text-xs shrink-0 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>報導</span>
          {hasLink ? (
            <a
              href={link.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-300 hover:text-indigo-200 text-sm leading-snug underline underline-offset-2 decoration-indigo-500/40 hover:decoration-indigo-400 transition-colors"
            >
              {articleTitle.trim()}
            </a>
          ) : (
            <span className="text-slate-300 text-sm leading-snug">{articleTitle.trim()}</span>
          )}
        </div>
      )}
      {/* Link button (shown when no article title, or as standalone button) */}
      {hasLink && !hasArticleTitle && (
        <div className="mt-1">
          <a
            href={link.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs border border-indigo-500/30 rounded-lg px-2 py-0.5 transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/10"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            查看原文
          </a>
        </div>
      )}
      {/* Show link as plain text if it's not a valid URL but not N/A */}
      {!hasLink && link && link.trim().toUpperCase() !== 'N/A' && (
        <span className="text-slate-500 text-xs italic">{link.trim()}</span>
      )}
    </div>
  );
};

export const IntelContent = ({ content, mode }: IntelContentProps) => {
  if (mode === 'intel') {
    const data = parseIntelContent(content);
    return (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>刊報日期</div>
            <div className="text-slate-200 font-medium">{data.date || '未提供'}</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>可信度</div>
            <div className="text-emerald-400 font-bold">{data.confidence || '未提供'}</div>
          </div>
        </div>
        <FieldBlock label="主體" value={data.subject} accent="indigo" />
        <FieldBlock label="分析" value={data.analysis} accent="purple" />
        <FieldBlock label="影響" value={data.impact} accent="emerald" />
        <div className="grid grid-cols-2 gap-3">
          <SourceBlock source={data.source} articleTitle={data.articleTitle} link={data.link} />
        </div>
      </div>
    );
  }

  const data = parseFinanceContent(content);
  const now = new Date();
  const financeDate = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Taipei' });
  const financeTime = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Taipei' });
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-950/60 border border-cyan-500/20 p-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>刷新日期</div>
          <div className="text-slate-200 font-medium">{financeDate}</div>
        </div>
        <div className="rounded-xl bg-slate-950/60 border border-cyan-500/20 p-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>刷新時間</div>
          <div className="text-cyan-300 font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{financeTime}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldBlock label="最新報價" value={data.price} accent="cyan" />
        <FieldBlock label="資產標的" value={data.asset} accent="amber" />
      </div>
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>趨勢判定</div>
        <div className={`font-bold text-base ${
          data.trend?.includes('看多') ? 'text-emerald-400' :
          data.trend?.includes('看空') ? 'text-rose-400' : 'text-amber-400'
        }`}>{data.trend || '未提供'}</div>
      </div>
      <FieldBlock label="市場分析" value={data.analysis} accent="indigo" />
      <FieldBlock label="關鍵點位" value={data.levels} accent="rose" />
      <FieldBlock label="期貨動向" value={data.futures} accent="emerald" />
      <div className="grid grid-cols-2 gap-3">
        <SourceBlock source={data.source} articleTitle={data.articleTitle} link={data.link} />
      </div>
    </div>
  );
};

export default IntelContent;
