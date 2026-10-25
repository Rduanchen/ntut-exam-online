# NTUT Exam Online

學生線上作答與評測介面，搭配 NTUT Exam Host 使用。題目、學生名單、提交紀錄與評測結果由 host 管理。

## 環境需求

- Node.js 24
- pnpm 10（專案使用 10.33.0）
- 已啟動的 host，並已設定考卷、初始化學生名單及安裝評測所需的語言 runtime。

## 首次設定

在專案根目錄執行：

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
```

編輯 `apps/backend/.env`：

```dotenv
V2_API_URL=http://127.0.0.1:3001
ADMIN_TOKEN=填入與運行中_host_相同的_token
```

- `V2_API_URL`：host 的**管理 API 位址**，不含 `/admin`。此處 3001 對應目前本機服務；其他環境請依 host 實際管理埠調整（host 原始碼預設為 3000）。容器間連線請使用可解析的服務名稱或主機位址。
- `ADMIN_TOKEN`：必須與運行中的 host 相同，不可留空，也不可使用 `admin` 或 `admin-secret`。

後端固定讀取 `apps/backend/.env`，外部環境變數優先。修改設定後需重新啟動後端；不要提交 `.env`。

## 開發

```bash
pnpm dev
```

| 服務 | 預設位址 |
| --- | --- |
| 學生前端 | http://localhost:5173 |
| TA 前端 | http://localhost:5174 |
| 學生 API | http://localhost:3003/api |
| TA API | http://localhost:3004/api |

前端開發伺服器會將 `/api` 代理到對應後端；Vite 埠號若被占用，請以終端機顯示的位址為準。

## 正式執行

```bash
pnpm start:prod
```

此指令先建構，再啟動後端託管前端靜態檔案：

- 學生介面：http://localhost:3003
- TA 介面：http://localhost:3004

可透過 `USER_PORT`、`ADMIN_PORT` 調整後端埠號；開發時也需同步調整對應的 Vite proxy。若前後端分開部署，在建構前端時設定 `VITE_API_BASE_URL`，包含 `/api`。

## 檢查與排錯

```bash
pnpm test
pnpm build
curl --fail http://localhost:3003/api/questions
```

`/api/questions` 應回傳 host 的題目列表：

- host 回傳 **404**：確認 `V2_API_URL` 指向管理埠，且沒有多加 `/admin`。
- host 回傳 **401**：確認 `ADMIN_TOKEN` 與運行中的 host 一致。
- 上傳失敗：確認學號已存在於 host 初始化後的學生名單。

需要提供題目壓縮檔下載時，將 `exam.zip` 放在 `apps/backend/`。

## 目錄

```text
apps/backend/   Express API，轉接 host
apps/frontend/  學生介面
apps/ta/        TA 介面（本機檔案與日誌管理）
packages/       共用型別與 schema
```

目前線上提交存入 host；TA 的本機檔案列表不會同步顯示這些提交。
