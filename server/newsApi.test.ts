import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("NewsAPI Key Validation", () => {
  it("should have NEWS_API_KEY set", () => {
    expect(ENV.newsApiKey).toBeDefined();
    expect(ENV.newsApiKey.length).toBeGreaterThan(10);
  });

  it("should successfully fetch news from NewsAPI", async () => {
    const url = `https://newsapi.org/v2/top-headlines?country=tw&pageSize=3&apiKey=${ENV.newsApiKey}`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; articles: unknown[] };
    expect(data.status).toBe("ok");
    expect(Array.isArray(data.articles)).toBe(true);
  }, 15000);
});
