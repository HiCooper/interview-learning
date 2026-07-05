# Interview Learning

面试知识库文档项目，基于 Fumadocs + 交互式学习工具。

## 项目结构

- `docs/` — Fumadocs 文档站点（Next.js 16 + Tailwind 4 + MDX）
- `study-app/` — 交互式闪卡学习应用（Vite 6 + React 19 + Tailwind 3）

## 常用命令

### 文档站点 (docs/)

- `cd docs && npm run dev` — 启动文档开发服务器
- `cd docs && npm run build` — 构建文档站点
- `cd docs && npm run types:check` — 类型检查（fumadocs-mdx + next typegen + tsc）

### 学习应用 (study-app/)

- `cd study-app && npm run dev` — 启动 Vite 开发服务器
- `cd study-app && npm run build` — 构建学习应用

## 内容结构

- `docs/content/docs/` — MDX 文档（Java、中间件、架构、AI、Leetcode 等）
- `docs/content/docs/middleware/meta.json` — 中间件页面排序
- `docs/src/lib/study-data.ts` — 闪卡数据源
- `study-app/data.js` / `study-app/src/data.ts` — 闪卡数据（与上述保持同步）

## 文档规范

- 每个主题一个 `.mdx` 文件，位于对应分类目录下
- 文档结构：概述 → 速查卡 → 详细章节 → 自测题
- 闪卡数据需同时在 `study-app/data.js`、`study-app/src/data.ts`、`docs/src/lib/study-data.ts` 三处同步
- 中间件新页面需在 `docs/content/docs/middleware/meta.json` 注册
