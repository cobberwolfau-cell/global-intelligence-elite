# Global Intelligence Elite — TODO

- [x] 初始化專案（web-db-user 模板）
- [x] 建立 DeepSeek 後端代理路由（server/routers.ts deepseek.chat）
- [x] 將 DEEPSEEK_API_KEY 加入後端環境變數（server/_core/env.ts）
- [x] 前端 deepseek.ts 改為呼叫後端 tRPC 代理，不再直接呼叫 DeepSeek API
- [x] Home.tsx 移除 API Key 輸入介面（apiKeyInput、showSettings、saveKey）
- [x] Home.tsx 移除所有前端 apiKey state 依賴
- [x] 更新使用說明文字，移除 API Key 相關指引
- [x] 修正 storageProxy.ts TypeScript 錯誤
- [x] DeepSeek API Key 驗證測試通過
- [x] IntelContent.tsx 出處欄位加入可點擊的「查看原文」連結按鈕（SourceBlock 元件）
- [x] AI Prompt 更新：要求 AI 盡量提供真實官方網址而非 N/A
- [x] AI Prompt 加入【報導標題】欄位，要求 AI 提供具體的報導文章名稱
- [x] types.ts 的 IntelData / FinanceData 加入 articleTitle 欄位
- [x] utils.ts 的 parseIntelContent / parseFinanceContent 解析【報導標題】
- [x] IntelContent.tsx 出處區塊顯示報導標題（媒體名稱 + 報導標題超連結）
- [x] 改善 loading 狀態 UI：加入「DeepSeek 正在分析中...」進度提示文字，告知使用者預計等待時間
