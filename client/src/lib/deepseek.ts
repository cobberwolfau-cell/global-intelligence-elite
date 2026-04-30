// ============================================================
// GLOBAL INTELLIGENCE ELITE — DeepSeek API Service (Backend Proxy)
// API Key is securely stored on the server side.
// Frontend calls the tRPC backend proxy instead of DeepSeek directly.
// ============================================================

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Call DeepSeek via the backend tRPC proxy.
 * The API key is stored in the server environment variable DEEPSEEK_API_KEY.
 * This function uses a direct fetch to /api/trpc/deepseek.chat to avoid
 * requiring React context (hooks) in non-component code.
 */
export const callDeepSeek = async (
  _apiKey: string,
  messages: Message[],
  temperature = 0.4
): Promise<string> => {
  // Call the backend tRPC mutation via direct fetch (works outside React hooks)
  const response = await fetch('/api/trpc/deepseek.chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      json: {
        messages,
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      const msg = json?.error?.message || json?.message;
      if (msg) throw new Error(msg);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
    }
    throw new Error(`後端 API 錯誤 ${response.status}，請稍後再試。`);
  }

  const data = await response.json() as { result?: { data?: { json?: { content?: string } } } };
  const content = data?.result?.data?.json?.content;
  if (content === undefined || content === null) {
    throw new Error('後端回應格式異常，請稍後再試。');
  }
  return content;
};
