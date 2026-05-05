// ============================================================
// GLOBAL INTELLIGENCE ELITE — Core Type Definitions
// Design: Cyberpunk Intelligence Terminal
// ============================================================

export type AppMode = 'intel' | 'finance';
export type Timeframe = '24h' | '7d' | '30d';

export interface Continent {
  id: string;
  label: string;
}

export interface CountryNode {
  id: string;
  label: string;
  continent: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface ParsedItem {
  id: string;
  title: string;
  content: string;
}

export interface ParsedAnalysis {
  items: ParsedItem[];
  summary: string;
}

export interface IntelData {
  date: string;
  confidence: string;
  subject: string;
  analysis: string;
  travelTips: string;
  impact: string;
  source: string;
  articleTitle: string;
  link: string;
  strategicJudgment: string;
}

export interface FinanceData {
  price: string;
  asset: string;
  trend: string;
  analysis: string;
  levels: string;
  futures: string;
  source: string;
  articleTitle: string;
  link: string;
}

export interface MarketQuote {
  symbol: string;
  price: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
}

export interface EmergencyItem {
  title: string;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ItemAnalysis {
  loading: boolean;
  text: string;
}
