# 居家照服 LINE Bot

這是一個專題用的長照服務 LINE Bot，提供照顧服務預約、補助試算、附近機構查詢、常見問題、緊急聯絡資訊與管理者 CSV 報表下載。

## 部署資訊

- Render 服務網址：https://my-line-s5ph.onrender.com/
- LINE Webhook URL：https://my-line-s5ph.onrender.com/webhook
- LINE Bot 好友 ID：請填入自己的官方帳號 ID，例如 `@xxxxxxx`

## 公開資料來源

本專題的「找附近機構」功能使用 HTTP 請求取得公開資料，不使用 `fs.readFileSync` 或 `import json` 讀取本機資料檔。

- 預設資料 URL：https://raw.githubusercontent.com/SeanJ-code/my-line/main/dump/abc.json
- 程式位置：`services/institutionSearch.js`
- 使用方式：以 `axios.get()` 取得 JSON，再依使用者分享的 LINE 位置計算附近機構、距離、開車時間與騎車時間。
- 若之後改用政府開放資料平台或 Google API，只要在 Render 環境變數設定 `INSTITUTION_DATA_URL` 即可替換來源。

## 使用方式

1. 加入 LINE Bot 好友。
2. 在聊天室輸入 `照服` 或點選主選單。
3. 若要查詢附近機構，進入「第一次使用，先這樣開始」卡片，點選「找附近機構」並分享位置。
4. 若要預約服務，先選擇 BA01-BA24 照顧項目，再選固定班表，最後填寫姓名、電話、地址與被服務者資料。
5. 管理者可開啟 `/admin` 查看表格，或下載 `/reports/care-records.csv` 用 Excel 開啟。

## 本機執行

```bash
npm install
npm run dev
```

預設會啟動在本機 `http://localhost:4000`。

## 環境變數

- `LINE_CHANNEL_ACCESS_TOKEN`：LINE Messaging API access token。
- `LINE_CHANNEL_SECRET`：LINE Messaging API channel secret。
- `PORT`：Render 或本機服務埠號。
- `INSTITUTION_DATA_URL`：附近機構查詢用的公開 JSON URL，可選填。

## 資料儲存

- 使用者預約與取消紀錄會存入 `data/careRecords.json`。
- 這份檔案是本專題的使用者紀錄，不是公開資料來源。
- 若正式上線，建議改用 Google Sheets、Firebase、Supabase 或資料庫保存，避免 Render Free 服務重啟後資料遺失。
