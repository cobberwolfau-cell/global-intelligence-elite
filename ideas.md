# Global Intelligence Elite Lite — 設計理念

## 三種設計方向

<response>
<idea>
**設計運動：** 賽博朋克情報終端機（Cyberpunk Intelligence Terminal）

**核心原則：**
- 深黑底色搭配螢光藍/靛藍高光，模擬真實情報終端機的視覺語言
- 玻璃擬態（Glassmorphism）搭配微弱的網格背景，強調科技感與深度
- 數據密度優先——每個像素都承載資訊，無多餘裝飾
- 動態掃描線與脈衝動畫，強化「系統運作中」的臨場感

**色彩哲學：**
- 主背景：#020617（深夜藍黑）
- 主強調：Indigo 400/500（#6366f1/#818cf8）
- 次強調：Cyan 400（#22d3ee）用於金融模式
- 警示色：Rose 400（#fb7185）用於高優先級警報
- 成功色：Emerald 400（#34d399）用於正向指標

**版面典範：**
- 三欄式儀表板：左側導航控制台（320px）、中央主面板（彈性）、右側分析助手（360px）
- 頂部全寬 Header 含跑馬燈警報
- 非對稱資訊密度：左側緊湊、中央寬鬆、右側聚焦

**標誌性元素：**
- 脈衝網格背景（pulseGrid 動畫）
- 玻璃卡片邊框（border-slate-800 + backdrop-blur）
- 全大寫字母追蹤間距標籤（text-[11px] uppercase tracking-[0.24em]）

**互動哲學：**
- 所有按鈕有 hover 狀態轉換，0.15s ease
- 展開/收合動畫，讓資訊層次清晰
- 跑馬燈動畫用於高優先級警報，懸停暫停

**動畫指南：**
- 背景網格：6s ease-in-out infinite opacity 脈衝
- 跑馬燈：28s linear infinite translateX
- 載入骨架：animate-pulse
- 展開動畫：高度從 0 到 auto，0.2s ease

**字體系統：**
- 標題：Space Grotesk（粗體、現代感）
- 內文：Inter（清晰易讀）
- 數據標籤：JetBrains Mono（等寬、終端機感）
</idea>
<probability>0.09</probability>
</response>

<response>
<idea>
**設計運動：** 極簡軍事情報（Minimal Military Intelligence）

**核心原則：**
- 純黑白灰配色，偶爾出現橄欖綠作為強調
- 嚴格的網格系統，模擬軍事文件的精確性
- 無裝飾主義——每個元素都有功能性目的
- 高對比度文字，確保在任何環境下可讀

**色彩哲學：**
- 主背景：#0a0a0a（純黑）
- 文字：#e5e5e5（淺灰）
- 強調：#4ade80（軍綠）
- 邊框：#262626（深灰）

**版面典範：**
- 全寬單欄流式佈局
- 左對齊文字，強調文件感
- 最小化視覺噪音

**字體系統：**
- 全站使用 IBM Plex Mono（終端機感）
</idea>
<probability>0.04</probability>
</response>

<response>
<idea>
**設計運動：** 量子情報矩陣（Quantum Intelligence Matrix）

**核心原則：**
- 深空藍黑底色，模擬量子計算界面
- 全息投影感——半透明層疊，光暈效果
- 資料可視化優先，圖表與數字主導視覺
- 動態粒子背景，強調數據流動感

**色彩哲學：**
- 主背景：#000814（深宇宙藍）
- 主強調：#00b4d8（青藍）
- 次強調：#7b2d8b（紫）
- 警示：#ef233c（紅）

**版面典範：**
- 全息儀表板，卡片懸浮感
- 圓形/六邊形元素，強調科技感

**字體系統：**
- Orbitron（科幻感標題）
- Rajdhani（資料標籤）
</idea>
<probability>0.07</probability>
</response>

---

## 選定方向：賽博朋克情報終端機（方向一）

選擇此方向是因為它最貼近原始 News.html 的設計語言，同時提升了視覺精緻度。深黑底色搭配靛藍/青色高光，玻璃擬態卡片，以及終端機風格的字體系統，完美呈現「戰略情報終端機」的專業感。
