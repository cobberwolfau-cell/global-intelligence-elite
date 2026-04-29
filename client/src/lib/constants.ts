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
  // Asia
  { id: 'Taiwan', label: '台灣', continent: 'asia' },
  { id: 'HongKong', label: '香港', continent: 'asia' },
  { id: 'Macau', label: '澳門', continent: 'asia' },
  { id: 'China', label: '中國', continent: 'asia' },
  { id: 'Japan', label: '日本', continent: 'asia' },
  { id: 'SouthKorea', label: '韓國', continent: 'asia' },
  { id: 'NorthKorea', label: '北韓', continent: 'asia' },
  { id: 'Singapore', label: '新加坡', continent: 'asia' },
  { id: 'Malaysia', label: '馬來西亞', continent: 'asia' },
  { id: 'Thailand', label: '泰國', continent: 'asia' },
  { id: 'Vietnam', label: '越南', continent: 'asia' },
  { id: 'Philippines', label: '菲律賓', continent: 'asia' },
  { id: 'Indonesia', label: '印尼', continent: 'asia' },
  { id: 'India', label: '印度', continent: 'asia' },
  { id: 'Pakistan', label: '巴基斯坦', continent: 'asia' },
  { id: 'Bangladesh', label: '孟加拉', continent: 'asia' },
  { id: 'SriLanka', label: '斯里蘭卡', continent: 'asia' },
  { id: 'Myanmar', label: '緬甸', continent: 'asia' },
  { id: 'Cambodia', label: '柬埔寨', continent: 'asia' },
  { id: 'Laos', label: '寮國', continent: 'asia' },
  { id: 'Mongolia', label: '蒙古', continent: 'asia' },
  { id: 'Kazakhstan', label: '哈薩克', continent: 'asia' },
  { id: 'Uzbekistan', label: '烏茲別克', continent: 'asia' },
  { id: 'Israel', label: '以色列', continent: 'asia' },
  { id: 'SaudiArabia', label: '沙烏地阿拉伯', continent: 'asia' },
  { id: 'UAE', label: '阿聯酋', continent: 'asia' },
  { id: 'Iran', label: '伊朗', continent: 'asia' },
  { id: 'Iraq', label: '伊拉克', continent: 'asia' },
  { id: 'Turkey', label: '土耳其', continent: 'asia' },
  // Europe
  { id: 'UK', label: '英國', continent: 'europe' },
  { id: 'Germany', label: '德國', continent: 'europe' },
  { id: 'France', label: '法國', continent: 'europe' },
  { id: 'Italy', label: '意大利', continent: 'europe' },
  { id: 'Spain', label: '西班牙', continent: 'europe' },
  { id: 'Netherlands', label: '荷蘭', continent: 'europe' },
  { id: 'Belgium', label: '比利時', continent: 'europe' },
  { id: 'Switzerland', label: '瑞士', continent: 'europe' },
  { id: 'Sweden', label: '瑞典', continent: 'europe' },
  { id: 'Norway', label: '挪威', continent: 'europe' },
  { id: 'Denmark', label: '丹麥', continent: 'europe' },
  { id: 'Finland', label: '芬蘭', continent: 'europe' },
  { id: 'Poland', label: '波蘭', continent: 'europe' },
  { id: 'Ukraine', label: '烏克蘭', continent: 'europe' },
  { id: 'Russia', label: '俄羅斯', continent: 'europe' },
  { id: 'Greece', label: '希臘', continent: 'europe' },
  { id: 'Portugal', label: '葡萄牙', continent: 'europe' },
  { id: 'Austria', label: '奧地利', continent: 'europe' },
  { id: 'CzechRepublic', label: '捷克', continent: 'europe' },
  { id: 'Hungary', label: '匈牙利', continent: 'europe' },
  { id: 'Romania', label: '羅馬尼亞', continent: 'europe' },
  // Americas
  { id: 'US', label: '美國', continent: 'americas' },
  { id: 'Canada', label: '加拿大', continent: 'americas' },
  { id: 'Mexico', label: '墨西哥', continent: 'americas' },
  { id: 'Brazil', label: '巴西', continent: 'americas' },
  { id: 'Argentina', label: '阿根廷', continent: 'americas' },
  { id: 'Chile', label: '智利', continent: 'americas' },
  { id: 'Colombia', label: '哥倫比亞', continent: 'americas' },
  { id: 'Peru', label: '秘魯', continent: 'americas' },
  { id: 'Venezuela', label: '委內瑞拉', continent: 'americas' },
  { id: 'Cuba', label: '古巴', continent: 'americas' },
  { id: 'Panama', label: '巴拿馬', continent: 'americas' },
  { id: 'Ecuador', label: '厄瓜多', continent: 'americas' },
  // Africa
  { id: 'Egypt', label: '埃及', continent: 'africa' },
  { id: 'Nigeria', label: '奈及利亞', continent: 'africa' },
  { id: 'SouthAfrica', label: '南非', continent: 'africa' },
  { id: 'Kenya', label: '肯亞', continent: 'africa' },
  { id: 'Ethiopia', label: '衣索比亞', continent: 'africa' },
  { id: 'Ghana', label: '迦納', continent: 'africa' },
  { id: 'Tanzania', label: '坦尚尼亞', continent: 'africa' },
  { id: 'Morocco', label: '摩洛哥', continent: 'africa' },
  { id: 'Algeria', label: '阿爾及利亞', continent: 'africa' },
  { id: 'Libya', label: '利比亞', continent: 'africa' },
  { id: 'Sudan', label: '蘇丹', continent: 'africa' },
  { id: 'DRC', label: '剛果', continent: 'africa' },
  { id: 'Angola', label: '安哥拉', continent: 'africa' },
  { id: 'Mozambique', label: '莫三比克', continent: 'africa' },
  // Oceania
  { id: 'Australia', label: '澳洲', continent: 'oceania' },
  { id: 'NewZealand', label: '紐西蘭', continent: 'oceania' },
  { id: 'PapuaNewGuinea', label: '巴布亞新幾內亞', continent: 'oceania' },
  { id: 'Fiji', label: '斐濟', continent: 'oceania' },
  { id: 'SolomonIslands', label: '所羅門群峳', continent: 'oceania' },
  // Global
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
