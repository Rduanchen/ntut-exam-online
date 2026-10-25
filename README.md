# NTUT Exam Online

學生線上作答與評測介面，搭配 NTUT Exam Host 使用。題目、學生名單、提交紀錄與評測結果由 host 管理。

## 環境需求

- Node.js 24
- pnpm 10（專案使用 10.33.0）
- 可從本專案後端連線的 host 管理 API；host 已設定考卷、初始化學生名單，並安裝評測所需的語言 runtime。

## 環境變數

### 後端：`apps/backend/.env`

首次設定時，在專案根目錄執行；已有 `.env` 時直接編輯，不要覆蓋原有設定：

```bash
cp apps/backend/.env.example apps/backend/.env
```

最小設定：

```dotenv
V2_API_URL=http://127.0.0.1:3001
ADMIN_TOKEN=replace-with-host-admin-token
```

| 變數 | 程式預設值 | 用途 |
| --- | --- | --- |
| `V2_API_URL` | `http://localhost:3000` | host 管理 API 位址，不含 `/admin` 或 `/api`。請明確填入實際位址。 |
| `ADMIN_TOKEN` | 無，必填 | 與運行中的 host 使用相同 token；留空、`admin`、`admin-secret` 會使後端停止啟動。 |
| `USER_PORT` | `3003` | online 學生 API 與正式學生前端的埠號。 |
| `ADMIN_PORT` | `3004` | online TA API 與正式 TA 前端的埠號；須與 `USER_PORT` 不同。 |
| `FRONTEND_DIST_DIR` | `../frontend/dist` | 學生前端建構產物目錄。一般部署不需設定。 |
| `TA_DIST_DIR` | `../ta/dist` | TA 前端建構產物目錄。一般部署不需設定。 |
| `TARGET_FOLDER` | `./target` | TA 本機檔案搬移功能的輸出目錄；線上提交至 host 不需設定。自訂時先建立目錄。 |

位址範例中的 **3001 是目前本機 host 的管理埠**，不是所有 host 的固定值；host 原始碼預設管理埠為 3000。online 的 `ADMIN_PORT` 則是自己的 TA 服務埠，與 host 的管理埠分別設定。

後端固定讀取 `apps/backend/.env`，不會自動讀取專案根目錄的 `.env` 或 `.env.example`。已傳入後端程序的環境變數優先於 `.env`；使用 `pnpm dev` 時建議直接在此檔設定，避免 Turborepo 過濾 shell 環境變數。修改後需重新啟動後端。

路徑預設值以後端的工作目錄為基準；下方 `pnpm --filter backend start` 會在 `apps/backend` 執行。若自行使用 Node 或程序管理器啟動，也應使用此工作目錄，或為目錄變數指定絕對路徑。

若 host 在另一台機器，請將 `127.0.0.1` 改成後端可連線的 host 位址；容器內的 `localhost` 指向容器本身，需改用可解析的服務名稱或主機位址。`JUDGER_URL` 不參與目前的 host 提交與評測流程，不需設定。

### 前端：學生與 TA 各自設定

| 變數 | 預設值 | 用途 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | 瀏覽器呼叫的 **online 後端**位址，包含 `/api`；不是 host 管理 API。 |

預設同源部署不需設定。分開部署時，可在 `apps/frontend/.env.local` 與 `apps/ta/.env.local` 各自設定，例如：

```dotenv
# apps/frontend/.env.local
VITE_API_BASE_URL=https://student.example.com/api
```

```dotenv
# apps/ta/.env.local
VITE_API_BASE_URL=https://ta.example.com/api
```

`VITE_` 變數會寫入瀏覽器程式，請只放公開的 API 位址；`ADMIN_TOKEN` 留在後端。修改前端環境變數後，開發環境需重啟 Vite，正式環境需重新建構。範例網域需由反向代理轉送到對應的 online 後端；跨來源部署也需自行配置代理或 CORS，目前後端未內建 CORS 設定。

## 開發

在專案根目錄完成環境變數設定後執行：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

| 服務 | 預設位址 |
| --- | --- |
| 學生前端 | http://localhost:5173 |
| TA 前端 | http://localhost:5174 |
| 學生 API | http://localhost:3003/api |
| TA API | http://localhost:3004/api |

Vite 會將 `/api` 代理到對應後端；前端埠號若被占用，以終端機顯示的位址為準。若更改 `USER_PORT` 或 `ADMIN_PORT`，開發時也需同步修改對應 app 的 `vite.config.ts` proxy。

## 手動部署

以下採用同一台主機，由 Express 同時提供 API 與已建構的前端，不需要另外啟動 Vite。

### 1. 準備主機與專案

先安裝 Node.js 24，再安裝 pnpm；主機已有對應版本時可略過安裝指令：

```bash
node --version
npm install --global pnpm@10.33.0
pnpm --version
```

將本專案完整原始碼放到部署主機，進入專案根目錄後安裝相依套件：

```bash
pnpm install --frozen-lockfile
```

建構需要開發相依套件，安裝時不要加 `--prod`。

### 2. 設定 host 連線

依上方說明建立並編輯 `apps/backend/.env`，填入 host 的管理 API 位址與 token。確認 host 已初始化這次考試的學生名單。

若需提供題目壓縮檔下載，將 `exam.zip` 放到 `apps/backend/`；未提供時僅下載端點 `/api/pdf` 回傳 404，不影響題目列表與提交。

### 3. 建構

在專案根目錄執行：

```bash
pnpm build
```

應產生以下檔案：

```text
apps/backend/dist/main.js
apps/frontend/dist/index.html
apps/ta/dist/index.html
```

部署時保留整個 workspace 與相依套件，不要只複製 `dist/main.js`。

### 4. 啟動

在專案根目錄執行以下指令，一次完成建構與正式啟動（可取代步驟 3 的獨立建構）：

```bash
pnpm start:prod
```

若已完成步驟 3 的建構，只需啟動後端：

```bash
pnpm --filter backend start
```

這兩種方式都在前景執行，按 Ctrl+C 停止；需要關閉終端機後持續運作或開機自動啟動時，請交由主機的程序管理器管理，設定如下：

- 工作目錄：專案的 `apps/backend` 絕對路徑。
- 啟動命令：`node dist/main.js`（使用 Node.js 24）。
- 日誌：收集標準輸出與錯誤輸出。

預設瀏覽位址為 `http://部署主機位址:3003`（學生）與 `http://部署主機位址:3004`（TA）。學生網段需能連到 3003；3004 提供管理操作，請限制在管理員可存取的網段。正式部署不需要開放 5173、5174。

### 5. 驗證

在部署主機另開終端機執行；若自訂埠號，請替換下列 3003、3004：

```bash
curl --fail http://127.0.0.1:3003/api/health
curl --fail http://127.0.0.1:3004/api/health
curl --fail http://127.0.0.1:3003/api/questions
```

兩個健康端點應回傳 `status: "ok"`，題目端點應回傳 host 的題目列表。健康端點只確認 online 服務存活；題目端點才會檢查 host 連線與 token。最後從學生電腦開啟學生介面，使用名單內的測試學號走一次上傳與評測，確認 host/Piston 的完整流程。

更新版本時，停止舊程序、更新原始碼、重新執行 `pnpm install --frozen-lockfile` 與 `pnpm build`，再啟動後端並重做上述驗證。保留部署主機原有的 `.env` 與 `exam.zip`。

## 測試與排錯

```bash
pnpm test
```

- 題目載入時 host 回傳 **404**：確認 `V2_API_URL` 指向管理埠，且沒有多加 `/admin` 或 `/api`。
- host 回傳 **401**：確認 `ADMIN_TOKEN` 與運行中的 host 一致。
- 連線遭拒或逾時：確認 host 已啟動、位址正確，且管理埠可由 online 後端連到。
- 上傳失敗：確認學號已存在於 host 初始化後的學生名單。
- API 正常但頁面不存在：確認已完成 `pnpm build`，並從正確的後端工作目錄啟動。

## 目錄

```text
apps/backend/   Express API，轉接 host
apps/frontend/  學生介面
apps/ta/        TA 介面（本機檔案與日誌管理）
packages/       共用型別與 schema
```

目前線上提交存入 host；TA 的本機檔案列表不會同步顯示這些提交。
