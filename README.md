# NTUT Exam Online

線上考試系統，提供學生作答上傳、自動評測，以及 TA 管理後台。

## 專案架構

採用 **pnpm workspaces + Turborepo** 管理的 monorepo：

**Note**: 本專案必須要裝 pnpm 10 以上才能正常運行，請確保你的環境符合要求。

```bash
npm install --global corepack@latest
corepack enable
corepack use pnpm@latest-10
# or you can download it with npm
npm install -g pnpm@latest-10
```

```
apps/
  backend/    — Express API 伺服器（學生 & 管理端分離）
  frontend/   — 學生前端（Vue 3）
  ta/         — TA 管理後台（Vue 3）
packages/
  types/      — 共用 TypeScript 型別
  schemas/    — 請求驗證 schema
```

## 技術棧

| 層級         | 技術                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Backend      | Express 5, TypeScript ~6, multer, archiver, axios, p-limit            |
| Frontend     | Vue 3 (Composition API), vue-router, vue-i18n, axios, Tailwind CSS v4 |
| TA Dashboard | Vue 3, vue-i18n, axios, Tailwind CSS v4                               |
| 建構工具     | Vite 8, Turborepo, pnpm                                               |
| 測試         | Vitest, supertest, @vue/test-utils, jsdom                             |

## 環境需求

- Node.js ≥ 20
- pnpm ≥ 10

## 快速部署

```bash
# 安裝依賴
pnpm install

pnpm start:prod
```

1. 設定 TARGET_FOLDER 環境變數（必要），指向存放上傳檔案的絕對路徑
2. 設定 backend/src/constant/config.ts 中的 questionConfig，定義題目名稱與語言(必要設定)
3. 確認 3003 port 或者是自訂的 user port 可以被外部存取。

## 環境變數

### Backend

| 變數                | 預設值                                       | 說明                       |
| ------------------- | -------------------------------------------- | -------------------------- |
| `TARGET_FOLDER`     | `./target`                                   | 目標檔案存放路徑(必要設定) |
| `JUDGER_URL`        | `http://localhost:3002/code/judge-from-file` | 評測服務位址               |
| `USER_PORT`         | `3003`                                       | 學生 API 埠號              |
| `ADMIN_PORT`        | `3004`                                       | 管理 API 埠號              |
| `FRONTEND_DIST_DIR` | `../frontend/dist`                           | 學生前端打包輸出路徑       |
| `TA_DIST_DIR`       | `../ta/dist`                                 | TA 後台打包輸出路徑        |

### Frontend / TA（建構時期）

| 變數                | 預設值 | 說明                                                              |
| ------------------- | ------ | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api` | 後端 API 的 base URL，打包時寫入（例如 `http://example.com/api`） |

## API 路由

### 學生端（Port 3003）

| 方法 | 路徑           | 說明                                |
| ---- | -------------- | ----------------------------------- |
| GET  | `/questions`   | 取得題目列表                        |
| POST | `/upload-file` | 上傳作答檔案（multipart/form-data） |
| POST | `/judge`       | 送出評測請求                        |

### 管理端（Port 3004）

| 方法 | 路徑         | 說明               |
| ---- | ------------ | ------------------ |
| GET  | `/log`       | 取得系統日誌       |
| GET  | `/file-list` | 取得已上傳檔案列表 |
| PUT  | `/move-file` | 移動/重新命名檔案  |

> 學生端與管理端運行於不同 port，路由彼此隔離，確保安全性。

## 題目設定

編輯 `apps/backend/src/constant/config.ts` 中的 `questionConfig`：

```typescript
export const questionConfig: QuestionConfig[] = [
  { name: "Q1", language: "c" },
  { name: "Q2", language: "c" },
  { name: "Q3", language: "c" },
  { name: "Q4", language: "c" },
  { name: "Q5", language: "c" },
  { name: "Q6", language: "c" },
  { name: "Q7", language: "c" },
];
```

支援的語言：`c`、`cpp`、`python`、`java`、`javascript`、`typescript`

## 測試

```bash
# 執行所有測試
pnpm test

# 分別執行
pnpm --filter backend test     # 27 tests
pnpm --filter frontend test    # 21 tests
pnpm --filter ta test           # 19 tests

# Watch 模式
pnpm --filter backend test:watch
```

## 建構

```bash
pnpm build
```

## 部署

部署時會先打包前端靜態檔案，再由 Express 託管：

```bash
# 一鍵部署（建構 + 啟動）
pnpm start:prod
```

等同於：

```bash
# 1. 打包所有 app（frontend、ta 產生 dist/，backend 編譯 TypeScript）
pnpm build

# 2. 啟動 backend，同時託管前端靜態檔案
pnpm --filter backend start
```

啟動後：

- **Port 3003**：學生 API + 學生前端 SPA
- **Port 3004**：管理 API + TA 後台 SPA

### 自訂前端 API 位址

若前端與後端部署在不同網域，可在**打包時**指定後端 URL：

```bash
# 學生前端指向遠端後端
VITE_API_BASE_URL=https://api.example.com/api pnpm --filter frontend build

# TA 後台指向遠端管理端
VITE_API_BASE_URL=https://admin.example.com/api pnpm --filter ta build
```

若前後端同源部署（預設），則不需設定此變數。

## 功能說明

### 學生前端

- 登入頁面（輸入學號）
- 依題目語言限制上傳檔案類型（如 Python 題只能上傳 `.py`）
- 提交評測後顯示結果：測試案例狀態、執行時間、輸出比對、特殊規則檢查
- 中英文切換（zh-TW / en）

### TA 管理後台

- 瀏覽所有學生上傳的檔案
- 關鍵字搜尋篩選
- 檔案移動/重新命名
- 查看系統日誌

### 安全機制

- 學生端與管理端 port 隔離
- 檔案路徑 traversal 防護
- 隱藏測試案例的輸出自動遮蔽（redact）
