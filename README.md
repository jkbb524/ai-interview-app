# AI 模拟面试 · PC 端前端工程

面向求职者的 AI 模拟面试陪练平台（PC 端），覆盖「登录注册 → 简历管理 → 模拟面试 → 多维度评分 → 复盘报告 → 历史记录」完整闭环。

## 技术栈

- **Vue 3.5**（`<script setup>` + Composition API）+ **TypeScript 5**
- **Vue Router 4**（hash 模式）+ **Pinia 2**（状态管理）
- **Element Plus 2**（UI 组件库，主题已对齐设计原型主色 `#6366f1`）
- **ECharts 5**（评分雷达图 / 能力趋势图）
- **Vite 5**（构建工具）

## 快速开始

```bash
npm install
npm run dev      # 开发模式 → http://localhost:5173
npm run build    # 生产构建 → dist/
npm run preview  # 预览生产构建
npm run type-check  # 严格类型检查
```

> 若默认私有 npm 源不可用，可执行 `npm install --registry https://registry.npmjs.org`。

## 演示账号

登录页已预填演示账号，直接点击「登录」即可进入：

- 用户名 / 邮箱：`demo@example.com`
- 密码：`123456`

## 数据说明

v1 采用**前端 Mock 数据**驱动，无需真实后端即可完整体验全流程：

- 简历、历史记录持久化在浏览器 `localStorage`（首次访问自动注入种子数据）。
- 面试对话、评分、报告均由 `src/mock/` 模拟生成（含流式逐字渲染）。
- 对接真实后端时，仅需将 `src/mock/` 替换为 Axios 实现（详见 `ANALYSIS_REPORT.md`）。

## 目录结构

```
src/
├── main.ts            # 应用装配
├── router/            # 路由 + 登录守卫
├── stores/            # Pinia（auth/resume/interview/history）
├── mock/              # 模拟数据 + 模拟服务层
├── layouts/           # 顶栏布局 / 登录注册布局
├── components/        # 得分环 / 雷达图 / 趋势图
├── views/             # 9 个页面
├── types/             # 全局类型
├── utils/             # 格式化工具
└── styles/            # 设计系统 + Element Plus 主题覆盖
```

## 文档

- 产品需求：`../PRD.md`
- 分析设计报告：[`ANALYSIS_REPORT.md`](ANALYSIS_REPORT.md)
