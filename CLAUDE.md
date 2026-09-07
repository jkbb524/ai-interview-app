# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

AI 模拟面试陪练平台（PC 端前端）。技术栈：Vue 3 + TypeScript + Vue Router + Pinia + Element Plus + ECharts，Vite 构建。纯前端 **Mock 数据**驱动，无真实后端。覆盖「登录注册 → 简历管理 → 模拟面试 → 多维度评分 → 复盘报告 → 历史记录」完整闭环。

- 产品需求：仓库外的 `../PRD.md`
- 详细设计：`ANALYSIS_REPORT.md`

## 常用命令

```bash
npm install          # 装依赖；私有源不可用时加 --registry https://registry.npmjs.org
npm run dev          # 开发服务器 → http://localhost:5173
npm run build        # 生产构建 → dist/
npm run preview      # 预览生产构建
npm run type-check   # vue-tsc --noEmit 严格类型检查
```

没有配置测试框架或 lint。改完代码的验证方式就是 `npm run type-check` + `npm run build`。TS 开启了 `strict` + `noUnusedLocals` + `noUnusedParameters`，未使用的变量/参数会直接报错。

## 架构总览

**数据流**：`src/views/`（页面）→ `src/stores/`（Pinia）→ `src/mock/`（模拟 API）→ `localStorage`。

**Mock 服务层就是「后端」**（`src/mock/index.ts` + `data.ts`）：所有数据操作以 Promise 异步函数暴露，函数签名对应 PRD 的 REST 端点（`login/register/getResumes/createResume/updateResume/deleteResume/getQuestions/startInterview/sendAnswer/completeInterview/getHistory/getReport`），内部带 300–900ms 模拟延迟并持久化到 localStorage。**对接真实后端时只需把 `src/mock` 换成同签名的 axios 实现，Store 层无需改动**（各 store 通过 `import * as api from '../mock'` 调用）。

**面试会话是内存态**：`src/mock/index.ts` 里的模块级变量 `activeSession` 保存进行中的会话，刷新页面即丢失；只有 `completeInterview` 才把记录写入 localStorage 历史。

**评分模型**：五维度按权重加权——准确性 30% / 逻辑 25% / 表达 20% / 应变 15% / 匹配 10%，总分 = Σ(维度分 × 权重)。结构见 `src/types/index.ts` 的 `ScoreDimension` / `InterviewRecord`。

**流式输出是模拟的**：`src/stores/interview.ts` 的 `typeOut()` 逐字追加到 AI 消息（每 2 字符 sleep 12ms）模拟 SSE；`busy` 标志在「思考中/流式中」期间锁定输入，防止并发作答。

## 关键约定与陷阱

- **localStorage 键**：`ai-interview:token` / `ai-interview:user` / `ai-interview:resumes` / `ai-interview:history`。首次访问自动注入种子数据（`ensureSeed`）。
- **登录是假的**：`login()` 忽略密码，任意用户名密码都能进；演示账号 `demo@example.com` / `123456`。
- **路由用 hash 模式**（`createWebHashHistory`），便于静态部署。守卫在 `router/index.ts` 的 `beforeEach`：未登录访问非 `meta.public` 路由跳 `/login`；已登录访问 `/login`/`/register` 跳 `/dashboard`。`/interview` 是不带布局的全屏路由。
- **主题统一靠 CSS 变量覆盖**：`src/styles/index.css` 定义 `--primary` 等 token，并覆盖 `--el-color-primary` 等 Element Plus 变量（主色 `#6366f1`）。改主题只改这一处，不要在组件里硬编码颜色。
- **Element Plus 是全量引入**（`main.ts` 里 `app.use(ElementPlus)`），导致主 chunk 约 1MB（gzip 350KB）——这是已知取舍，不要「顺手」改成按需引入，除非有明确要求。
- **仅 PC 端**：无移动端适配，不做响应式 breakpoint。
- 图表统一走 `src/components/` 下的 `RadarChart` / `TrendChart` / `ScoreRing` 封装（内部处理 ECharts 初始化/resize/销毁），视图层只传数据。
