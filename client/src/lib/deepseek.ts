// ============================================================
// GLOBAL INTELLIGENCE ELITE — DeepSeek API Service
// Design: Cyberpunk Intelligence Terminal
// ============================================================

const API_BASE = 'https://api.deepseek.com/v1';
const MODEL_NAME = 'deepseek-chat';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
  let lastError: Error | null = null;
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API 錯誤 ${response.status}：${text}`);
      }
      return response;
    } catch (e) {
      lastError = e as Error;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  throw lastError || new Error('無法連線至 AI 服務');
};

export const callDeepSeek = async (
  apiKey: string,
  messages: Message[],
  temperature = 0.4
): Promise<string> => {
  if (!apiKey) throw new Error('請先輸入 DeepSeek API Key');
  const response = await fetchWithRetry(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      temperature,
      messages,
      stream: false,
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};
