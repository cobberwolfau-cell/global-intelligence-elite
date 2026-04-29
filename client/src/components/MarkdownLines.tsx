// ============================================================
// GLOBAL INTELLIGENCE ELITE — Markdown Renderer
// Design: Cyberpunk Intelligence Terminal
// ============================================================

interface MarkdownLinesProps {
  text: string | null | undefined;
}

export const MarkdownLines = ({ text }: MarkdownLinesProps) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n').filter(Boolean).map((line, i) => {
        if (/^###\s+/.test(line))
          return <h4 key={i} className="text-sm font-bold text-indigo-300 mt-3" style={{ fontFamily: 'var(--font-display)' }}>{line.replace(/^###\s+/, '')}</h4>;
        if (/^##\s+/.test(line))
          return <h3 key={i} className="text-base font-bold text-indigo-200 mt-4" style={{ fontFamily: 'var(--font-display)' }}>{line.replace(/^##\s+/, '')}</h3>;
        if (/^[-*]\s+/.test(line))
          return <li key={i} className="ml-5 list-disc text-sm text-slate-300">{line.replace(/^[-*]\s+/, '')}</li>;
        return <p key={i} className="text-sm leading-6 text-slate-300">{line}</p>;
      })}
    </>
  );
};

export default MarkdownLines;
