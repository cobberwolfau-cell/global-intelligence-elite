import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("DeepSeek API Key", () => {
  it("should have DEEPSEEK_API_KEY set in environment", () => {
    expect(ENV.deepseekApiKey).toBeTruthy();
    expect(ENV.deepseekApiKey.length).toBeGreaterThan(0);
  });

  it("should be able to call DeepSeek API with the configured key", async () => {
    const apiKey = ENV.deepseekApiKey;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Say 'ok' in one word." }],
        max_tokens: 5,
        stream: false,
      }),
    });

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    
    if (response.ok) {
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      expect(data.choices?.[0]?.message?.content).toBeTruthy();
    } else {
      // 402 means insufficient balance but key is valid
      const text = await response.text();
      console.log(`DeepSeek API response: ${response.status} ${text}`);
      // Accept 402 (insufficient balance) as key is valid
      expect([200, 402]).toContain(response.status);
    }
  }, 30000);
});
