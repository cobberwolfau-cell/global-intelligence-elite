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
