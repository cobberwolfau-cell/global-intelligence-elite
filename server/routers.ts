import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const DEEPSEEK_API_BASE = "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = "deepseek-chat";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const NON_RETRYABLE_STATUSES = new Set([400, 401, 402, 403, 422]);

// Friendly error messages for known DeepSeek API errors
const friendlyErrorMessage = (status: number, body: string): string => {
  try {
    const json = JSON.parse(body);
    const code = json?.error?.code as string | undefined;
    const msg = json?.error?.message as string | undefined;
    if (status === 402 || msg?.toLowerCase().includes("insufficient balance")) {
      return "DeepSeek 帳戶餘額不足，請聯絡管理員充值後再試。";
    }
    if (status === 401 || code === "invalid_api_key") {
      return "伺服器端 API Key 無效或已過期，請聯絡管理員重新設定。";
    }
    if (status === 403) {
      return "API Key 沒有存取權限，請聯絡管理員確認帳戶狀態。";
    }
    if (status === 429 || code === "rate_limit_exceeded") {
      return "請求過於頻繁，已達到速率限制，請稍候再試。";
    }
    if (msg) return `AI 服務錯誤：${msg}`;
  } catch {
    /* ignore parse errors */
  }
  return `API 錯誤 ${status}，請稍後再試。`;
};

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  deepseek: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(MessageSchema),
          temperature: z.number().min(0).max(2).optional().default(0.4),
        })
      )
      .mutation(async ({ input }) => {
        const apiKey = ENV.deepseekApiKey;
        if (!apiKey) {
          throw new Error("伺服器尚未設定 DeepSeek API Key，請聯絡管理員。");
        }

        let lastError: Error | null = null;
        let delay = 1000;
        const maxRetries = 3;

        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                temperature: input.temperature,
                messages: input.messages,
                stream: false,
              }),
            });

            if (!response.ok) {
              const text = await response.text();
              const friendly = friendlyErrorMessage(response.status, text);
              // Do not retry on client-side / billing errors
              if (NON_RETRYABLE_STATUSES.has(response.status)) {
                throw new Error(friendly);
              }
              lastError = new Error(friendly);
              if (i < maxRetries - 1) {
                await new Promise((r) => setTimeout(r, delay));
                delay *= 2;
              }
              continue;
            }

            const data = (await response.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            return {
              content: data.choices?.[0]?.message?.content || "",
            };
          } catch (e) {
            // Rethrow non-retryable errors immediately
            if (e instanceof Error && (
              e.message.includes("餘額不足") ||
              e.message.includes("API Key 無效") ||
              e.message.includes("沒有存取權限") ||
              e.message.includes("伺服器尚未設定")
            )) {
              throw e;
            }
            lastError = e as Error;
            if (i < maxRetries - 1) {
              await new Promise((r) => setTimeout(r, delay));
              delay *= 2;
            }
          }
        }
        throw lastError || new Error("無法連線至 AI 服務，請檢查網路連線。");
      }),
  }),
});

export type AppRouter = typeof appRouter;
