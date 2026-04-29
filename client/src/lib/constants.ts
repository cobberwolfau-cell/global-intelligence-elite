// ============================================================
// GLOBAL INTELLIGENCE ELITE — Data Constants
// Design: Cyberpunk Intelligence Terminal
// ============================================================

import type { Continent, CountryNode, Category } from './types';

export const continents: Continent[] = [
  { id: 'asia', label: '亞洲' },
  { id: 'europe', label: '歐洲' },
  { id: 'americas', label: '美洲' },
  { id: 'africa', label: '非洲' },
  { id: 'oceania', label: '大洋洲' },
  { id: 'global', label: '全球' },
];

export const countryNodes: CountryNode[] = [
  { id: 'Taiwan', label: '台灣', continent: 'asia' },
  { id: 'HongKong', label: '香港', continent: 'asia' },
  { id: 'China', label: '中國', continent: 'asia' },
  { id: 'Japan', label: '日本', continent: 'asia' },
  { id: 'SouthKorea', label: '韓國', continent: 'asia' },
  { id: 'Singapore', label: '新加坡', continent: 'asia' },
  { id: 'India', label: '印度', continent: 'asia' },
  { id: 'UK', label: '英國', continent: 'europe' },
  { id: 'Germany', label: '德國', continent: 'europe' },
  { id: 'France', label: '法國', continent: 'europe' },
  { id: 'US', label: '美國', continent: 'americas' },
  { id: 'Canada', label: '加拿大', continent: 'americas' },
  { id: 'Brazil', label: '巴西', continent: 'americas' },
  { id: 'Egypt', label: '埃及', continent: 'africa' },
  { id: 'Nigeria', label: '奈及利亞', continent: 'africa' },
  { id: 'SouthAfrica', label: '南非', continent: 'africa' },
  { id: 'Australia', label: '澳洲', continent: 'oceania' },
  { id: 'NewZealand', label: '紐西蘭', continent: 'oceania' },
  { id: 'Global', label: '全球', continent: 'global' },
];

export const intelCategories: Category[] = [
  { id: 'local', label: '在地消息', icon: 'lucide:house' },
  { id: 'globalnews', label: '全球新聞', icon: 'lucide:globe' },
  { id: 'economy', label: '總體經濟', icon: 'lucide:chart-column' },
  { id: 'military', label: '軍事動態', icon: 'lucide:shield' },
  { id: 'technology', label: '科技前沿', icon: 'lucide:cpu' },
  { id: 'risk', label: '風險雷達', icon: 'lucide:siren' },
  { id: 'travel', label: '旅遊資訊', icon: 'lucide:plane' },
];

export const financeCategories: Category[] = [
  { id: 'equities', label: '全球股市大盤', icon: 'lucide:line-chart' },
  { id: 'metals', label: '黃金與貴金屬', icon: 'lucide:coins' },
  { id: 'energy', label: '原油與能源', icon: 'lucide:zap' },
  { id: 'forex', label: '外匯市場', icon: 'lucide:badge-dollar-sign' },
  { id: 'bonds', label: '全球債券', icon: 'lucide:landmark' },
  { id: 'crypto', label: '加密貨幣', icon: 'lucide:binary' },
];

export const timeframes = [
  { id: '24h', label: '當日' },
  { id: '7d', label: '一星期' },
  { id: '30d', label: '當月' },
];
