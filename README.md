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

## 快速開始

```bash
# 安裝依賴
pnpm install

# 啟動所有開發伺服器
pnpm dev

# 或分別啟動
pnpm --filter backend dev    # Backend (user: 3003, admin: 3004)
pnpm --filter frontend dev   # 學生前端 (5173)
pnpm --filter ta dev          # TA 後台 (5174)
```

## 環境變數

| 變數            | 預設值                                       | 說明             |
| --------------- | -------------------------------------------- | ---------------- |
| `JUDGER_URL`    | `http://localhost:3002/code/judge-from-file` | 評測服務位址     |
| `TARGET_FOLDER` | `./target`                                   | 目標檔案存放路徑 |
| `USER_PORT`     | `3003`                                       | 學生 API 埠號    |
| `ADMIN_PORT`    | `3004`                                       | 管理 API 埠號    |

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
  { name: "Q4", language: "python" },
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
