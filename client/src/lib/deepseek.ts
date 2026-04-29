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

// Non-retryable HTTP status codes
const NON_RETRYABLE_STATUSES = new Set([400, 401, 402, 403, 422]);

// Friendly error messages for known API error codes
const friendlyErrorMessage = (status: number, body: string): string => {
  try {
    const json = JSON.parse(body);
    const code = json?.error?.code as string | undefined;
    const msg = json?.error?.message as string | undefined;
    if (status === 402 || msg?.toLowerCase().includes('insufficient balance')) {
      return 'DeepSeek 帳戶餘額不足，請前往 platform.deepseek.com 充值後再試。';
    }
    if (status === 401 || code === 'invalid_api_key') {
      return 'API Key 無效或已過期，請重新設定正確的 DeepSeek API Key。';
    }
    if (status === 403) {
      return 'API Key 沒有存取權限，請確認帳戶狀態。';
    }
    if (status === 429 || code === 'rate_limit_exceeded') {
      return '請求過於頻繁，已達到速率限制，請稍候再試。';
    }
    if (msg) return `AI 服務錯誤：${msg}`;
  } catch { /* ignore parse errors */ }
  return `API 錯誤 ${status}，請稍後再試。`;
};

// Marker to identify non-retryable errors thrown by this module
class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
  let lastError: Error | null = null;
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        const friendly = friendlyErrorMessage(response.status, text);
        // Do not retry on client-side / billing errors — throw immediately
        if (NON_RETRYABLE_STATUSES.has(response.status)) {
          throw new NonRetryableError(friendly);
        }
        lastError = new Error(friendly);
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
        continue;
      }
      return response;
    } catch (e) {
      // Always re-throw NonRetryableError immediately without retrying
      if (e instanceof NonRetryableError) throw e;
      lastError = e as Error;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  throw lastError || new Error('無法連線至 AI 服務，請檢查網路連線。');
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
