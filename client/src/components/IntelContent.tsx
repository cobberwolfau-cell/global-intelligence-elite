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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>出處</div>
            <div className="text-slate-300">{data.source || '未提供'}</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>連結</div>
            <div className="text-slate-300 break-all">{data.link || 'N/A'}</div>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>出處</div>
          <div className="text-slate-300">{data.source || '未提供'}</div>
        </div>
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>連結</div>
          <div className="text-slate-300 break-all">{data.link || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default IntelContent;
