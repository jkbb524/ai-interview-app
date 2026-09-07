# AI 模拟面试 · 前端工程 分析设计报告

> 版本：release 1.0.0
> 日期：2026-09-07
> 技术栈：Vue 3 + TypeScript + Vue Router + Pinia + Element Plus + ECharts
> 依据文档：`PRD.md`（产品需求文档 v1.0）与 UI 原型（`ai-interview-prototype/index.html`）

---

## 1. 项目概述

本项目是面向求职者的 **AI 模拟面试陪练平台** 的 PC 端前端工程，覆盖「登录注册 → 简历管理 → 模拟面试 → 多维度评分 → 复盘报告 → 历史记录」的完整闭环。

本版本（v1.0）目标：

- 仅适配 PC 端（移动端规划为 v2，见 PRD 第 7 章）。
- 使用**前端模拟数据**（Mock）驱动，无需真实后端即可完整体验全流程。
- 以**文字对话**为唯一交互形态，AI 回复采用流式逐字渲染以模拟 SSE。

---

## 2. 需求分析

依据 PRD，抽取前端需要实现的能力边界：

| PRD 模块 | 前端职责 | 本工程落地 |
|---------|---------|-----------|
| 3.1 用户认证 | 登录 / 注册 / 会话保持 | Mock 认证，localStorage 持久化 + 路由守卫 |
| 3.2 简历模块 | 简历 CRUD + AI 解析 | 简历列表 / 编辑页，Mock 结构化解析 |
| 3.3 题库模块 | 按条件筛选题库 | 题库浏览页，岗位 / 难度 / 类型 / 关键词过滤 |
| 3.4 面试模块 | 会话管理 + 多轮对话 + 流式渲染 | 面试主界面，Mock 抽题 + 追问链 + 打字机流式输出 |
| 3.5 评分模块 | 多维度评分展示 | 五维评分（准确性/逻辑/表达/应变/匹配）按权重加权 |
| 3.6 报告模块 | 复盘报告展示 | 报告页：得分环 + 雷达图 + 维度明细 + 优势/不足/行动建议 |

PRD 明确 5 个评分维度及其权重，前端评分展示严格遵循：

| 维度 | 权重 |
|------|------|
| 内容准确性 | 30% |
| 逻辑结构 | 25% |
| 表达清晰度 | 20% |
| 追问应对 | 15% |
| 岗位匹配度 | 10% |

---

## 3. 技术选型与偏差说明

| 技术 | 版本 | 用途 | 与 PRD 差异 |
|------|------|------|------------|
| Vue | 3.4+ | `<script setup>` + Composition API | 一致 |
| TypeScript | 5.4 | 严格类型（strict + noUnusedLocals） | 一致 |
| Vue Router | 4.x | SPA 路由（hash 模式）+ 守卫 | 一致 |
| Pinia | 2.x | 状态管理（auth/resume/interview/history） | 一致 |
| Element Plus | 2.7+ | UI 组件库 | **PRD 原为 Naive UI，按本工程要求改为 Element Plus** |
| ECharts | 5.x | 雷达图、能力趋势折线图 | 一致 |
| Vite | 5.x | 构建工具 | 一致 |

**关键偏差**：PRD 技术栈表中 UI 组件库为 Naive UI，本工程按交付要求改用 Element Plus，并通过 CSS 变量覆盖将 Element Plus 主色对齐到设计原型的 `#6366f1`。

**后端/Axios/SSE**：PRD 中的 Axios、FastAPI、DeepSeek、PostgreSQL 属于后端或联调层，v1 前端以 **Mock 服务层** 替代，其接口签名按真实 REST 语义设计（见第 7 章），后续替换为 Axios 请求即可无缝对接。

---

## 4. 设计系统（Design Tokens）

设计系统完全对齐 UI 原型（`ai-interview-prototype/index.html`），并在 `src/styles/index.css` 中以 CSS 变量落地，同时覆盖 Element Plus 主题变量。

### 4.1 色彩

| Token | 值 | 用途 |
|-------|-----|------|
| `--primary` | `#6366f1` | 品牌主色（按钮、标签、高亮） |
| `--primary-600` | `#4f46e5` | 主色 hover |
| `--primary-50` | `#eef2ff` | 主色浅底 |
| `--bg` | `#f5f6fb` | 页面背景 |
| `--surface` | `#ffffff` | 卡片 / 表面 |
| `--text` / `--text-2` / `--text-3` | `#181b29 / #5c6370 / #9aa1b0` | 三级文字层级 |
| `--success` | `#10b981` | 成功 / 高分 |
| `--warning` | `#f59e0b` | 警示 / 中等 |
| `--danger` | `#ef4444` | 危险 / 低分 |

### 4.2 其他

- 圆角：卡片 `12px`、控件 `8px`。
- 阴影：三级（`--shadow-sm / --shadow / --shadow-lg`）。
- 字体：系统字体栈（`-apple-system / Segoe UI / PingFang SC / Microsoft YaHei`）。
- 布局容器：`max-width: 1120px` 居中（简历编辑 / 报告页收窄至 900/920px）。

---

## 5. 目录结构

```
ai-interview-app/
├── index.html                     # 入口 HTML
├── package.json
├── vite.config.ts
├── tsconfig.json
├── ANALYSIS_REPORT.md             # 本报告
└── src/
    ├── main.ts                    # 应用装配（Pinia/Router/ElementPlus）
    ├── App.vue                    # 根组件（路由出口 + 过渡）
    ├── styles/index.css           # 设计系统 + 全局样式 + EP 主题覆盖
    ├── types/index.ts             # 全局类型（对应 PRD 数据模型）
    ├── utils/format.ts            # 分数色阶 / 星级 / 等级 / 维度短名
    ├── mock/
    │   ├── data.ts                # 静态 Mock 数据（题库/种子简历/种子历史/评分素材）
    │   └── index.ts               # Mock 服务层（Promise 模拟 REST + localStorage）
    ├── router/index.ts            # 路由表 + 登录守卫 + 标题
    ├── stores/
    │   ├── auth.ts                # 认证状态
    │   ├── resume.ts              # 简历状态
    │   ├── interview.ts           # 面试会话状态（含流式输出）
    │   └── history.ts             # 历史记录状态
    ├── layouts/
    │   ├── AppLayout.vue          # 顶栏布局（导航 + 用户菜单）
    │   └── AuthLayout.vue         # 登录/注册双栏布局
    ├── components/
    │   ├── ScoreRing.vue          # SVG 得分环
    │   ├── RadarChart.vue         # ECharts 雷达图
    │   └── TrendChart.vue         # ECharts 能力趋势折线图
    └── views/
        ├── LoginView.vue          # 登录
        ├── RegisterView.vue       # 注册
        ├── DashboardView.vue      # 仪表盘（含面试配置弹窗）
        ├── ResumeListView.vue     # 简历列表
        ├── ResumeEditView.vue     # 简历新建/编辑
        ├── InterviewView.vue      # 模拟面试（全屏对话）
        ├── HistoryView.vue        # 历史记录（表格 + 筛选）
        ├── ReportView.vue         # 复盘报告
        └── QuestionsView.vue      # 题库浏览
```

---

## 6. 路由设计

采用 **hash 模式**（`createWebHashHistory`），便于静态部署与 Mock 演示（无需服务端重写）。

| 路径 | 视图 | 布局 | 鉴权 |
|------|------|------|------|
| `/login` | LoginView | AuthLayout | 公开 |
| `/register` | RegisterView | AuthLayout | 公开 |
| `/dashboard` | DashboardView | AppLayout | 需登录 |
| `/resumes` | ResumeListView | AppLayout | 需登录 |
| `/resume-edit` | ResumeEditView | AppLayout | 需登录 |
| `/history` | HistoryView | AppLayout | 需登录 |
| `/report/:sessionId` | ReportView | AppLayout | 需登录 |
| `/questions` | QuestionsView | AppLayout | 需登录 |
| `/interview` | InterviewView | **无布局（全屏）** | 需登录 |

**守卫逻辑**（`router.beforeEach`）：

- 未登录访问受保护路由 → 重定向 `/login`（携带 `redirect` 参数）。
- 已登录访问 `/login`、`/register` → 重定向 `/dashboard`。
- 每次路由切换后更新 `document.title`。

> 面试页 `/interview` 是独立全屏路由，不带标准顶栏，以自身精简头部（品牌 + 岗位标签 + 计时器）呈现，符合原型设计。

---

## 7. Mock 服务层设计

`src/mock/index.ts` 是前端「后端」的替身，全部以 `Promise` 返回并带 300–900ms 模拟延迟，接口语义对齐 PRD 的 REST 端点。

### 7.1 接口清单

| Mock 函数 | 对应 PRD 端点 | 说明 |
|----------|--------------|------|
| `login` / `register` / `logout` | `/api/v1/auth/*` | 认证，写入 `localStorage` token + user |
| `getResumes` / `createResume` / `updateResume` / `deleteResume` | `/api/v1/resumes` | 简历 CRUD，持久化 `localStorage` |
| `getQuestions(filter)` | `/api/v1/questions` | 按岗位/难度/类型/关键词筛选 |
| `startInterview(config)` | `/api/v1/interviews` (POST) | 创建会话 + 抽题 + 返回开场白 |
| `sendAnswer(answer)` | `/api/v1/interviews/{id}/turn` | 用户作答 → AI 追问/换题/收尾 |
| `completeInterview()` | `/api/v1/interviews/{id}/complete` | 生成评分 + 落历史 |
| `getHistory` / `getReport` | `/api/v1/reports/{id}` | 历史与报告查询 |

### 7.2 持久化

`localStorage` 键：

- `ai-interview:token` / `ai-interview:user` — 登录态
- `ai-interview:resumes` — 简历列表（首次访问注入种子数据）
- `ai-interview:history` — 面试历史（首次访问注入 5 条种子记录）

### 7.3 模拟数据

- **题库**：21 道题，覆盖后端/前端/算法/产品/运营/数据 6 类岗位、4 类题型、3 档难度，每题含 `tags` 与 `modelAnswer`。
- **种子历史**：5 条，覆盖不同岗位/模式/难度，分数区间 68–88，驱动仪表盘统计、趋势图与报告演示。
- **评分素材池**：优势池、不足池、行动建议池、综述池各 6 条，供报告随机组合。

### 7.4 面试流程模拟

1. `startInterview` 按「岗位 + 难度」优先抽取 N 题（题量不足时循环补齐）。
2. 每轮 `sendAnswer`：记录作答 → 返回「衔接语 + 下一题」或「收尾语」。
3. 完成度影响评分：作答不足时各维度按完成度打折（`0.7 + 0.3 × 完成度`）。
4. `completeInterview` 生成五维分数（`76 + 随机 12` 为基准，逐维 ±4），按权重加权得总分，落库并返回记录。

---

## 8. 状态管理（Pinia）

| Store | 状态 | 关键动作 |
|-------|------|---------|
| `auth` | `user`、`isLoggedIn` | `login` / `register` / `logout` |
| `resume` | `resumes`、`loading` | `fetchResumes` / `createResume` / `updateResume` / `removeResume` |
| `interview` | `messages`、`currentQuestion`、`currentIndex`、`progress`、`busy`、`finished`、`lastRecord` | `start` / `send` / `complete` / `reset` |
| `history` | `records`、`loading` | `fetchHistory` / `getById` / `fetchReport` |

**面试流式渲染**：`interview.send` 在收到 Mock 回复后，调用内部 `typeOut`，逐字追加到 AI 消息的 `content`（每 2 字符间隔 12ms），模拟 SSE 逐字输出；`busy` 标志在「思考中」与「流式中」期间锁定输入，防止并发作答。`typeOut` 内含会话被重置时的越界保护。

---

## 9. 页面设计

### 9.1 登录 / 注册（`AuthLayout`）

- 左：品牌渐变面板（`#4338ca → #8b5cf6`），含口号、卖点列表、版本脚注，装饰圆形元素。
- 右：表单区（用户名/邮箱、密码，注册额外含邮箱与目标岗位）。
- 登录页预填演示账号，一键即可进入。

### 9.2 仪表盘（`DashboardView`）

- 4 张统计卡：累计面试 / 平均得分 / 最高得分 / 我的简历（实时由历史与简历 store 计算）。
- 2 个快捷入口：题库抽题 / AI 动态追问（点击预选模式并打开配置弹窗）。
- 左侧「最近面试」列表 + 右侧「能力趋势」折线图（ECharts，`TrendChart`）与薄弱项提醒。
- 「开始模拟面试」弹窗：模式（单选）、岗位、难度、题目数量（3–15），确认后带查询参数跳转 `/interview`。

### 9.3 简历管理（列表 + 编辑）

- 列表：3 列卡片网格，含岗位/格式标签、摘要、更新时间、编辑/删除；末尾「新建」虚线卡。
- 编辑：粘贴 Markdown/纯文本 → 「AI 解析」提取教育/工作/技能/项目；支持从 `.md/.txt` 文件导入；保存走 create/update。

### 9.4 模拟面试（`InterviewView`）

- 顶部：品牌 + 岗位标签 + 模式·难度标签 + 计时器（递增）。
- 左侧：对话流（AI 左侧白气泡 / 用户右侧主色气泡）+ 输入区（Enter 发送、Shift+Enter 换行）。
- 右侧：面试进度（当前题号、进度条）、当前题目信息（知识点/难度/类型/岗位）、「结束面试并生成报告」按钮。

### 9.5 历史记录（`HistoryView`）

- Element Plus 表格：日期 / 岗位 / 模式 / 题量 / 时长 / 得分 / 操作。
- 顶部三组筛选（岗位、模式、难度），实时过滤。

### 9.6 复盘报告（`ReportView`）

- 顶部「报告卡」：SVG 得分环（`ScoreRing`）+ 总评等级 + 五星 + 关键标签 + 综述。
- 「各维度得分」雷达图（`RadarChart`）+「维度明细」进度条 +「你的优势」+「需要改进 + 行动建议」。

### 9.7 题库浏览（`QuestionsView`）

- 过滤栏：岗位 / 难度 / 类型 / 关键词搜索 + 题量统计。
- 双列题目卡：题干 + 标签（岗位/难度/类型）+ 参考答案。

---

## 10. 关键实现要点

1. **主题统一**：通过覆盖 `--el-color-primary` 等 CSS 变量，使 Element Plus 组件与设计原型的 `#6366f1` 视觉一致，避免「双主题」割裂。
2. **图表按需封装**：`RadarChart` / `TrendChart` 直接封装 ECharts 初始化、`resize` 监听与销毁，视图层只传数据。
3. **守卫 + 持久化**：刷新后登录态与数据（简历/历史）均从 `localStorage` 恢复，Mock 环境接近真实体验。
4. **流式输出**：打字机效果 + 「思考中」三点动画，贴近 PRD「SSE 流式输出逐字渲染」的要求。
5. **完整闭环**：结束面试 → 生成评分与报告 → 写入历史 → 跳转报告页，历史/仪表盘数据同步刷新。

---

## 11. 测试验证

### 11.1 静态检查（已执行，全部通过）

| 检查项 | 命令 | 结果 |
|-------|------|------|
| 严格类型检查 | `npm run type-check`（vue-tsc --noEmit） | ✅ 通过，0 错误 |
| 生产构建 | `npm run build` | ✅ 通过，2212 个模块，9.2s |
| 开发服务器启动 | `npm run dev` | ✅ 365ms 启动，HTTP 200，模块正常转译 |

> 构建产物中 Element Plus / ECharts 打出的主 chunk 约 1.0–1.1 MB（gzip 后约 350 KB），触发 Rollup 500KB 体积提醒。此为全量引入组件库与图表库所致，v1 为 Mock 演示可接受；后续可按需引入或配置 `manualChunks` 拆分优化。

### 11.2 功能验证清单（实现完成，建议浏览器逐项复核）

- [x] 未登录访问受保护路由自动跳转登录页（`router.beforeEach` 守卫）
- [x] 登录 / 注册成功进入仪表盘（登录页预填演示账号）
- [x] 仪表盘统计与趋势图随历史数据渲染
- [x] 简历新建 / 编辑 / 删除 / AI 解析 / 文件导入
- [x] 面试全流程：配置 → 抽题 → 多轮对话（流式）→ 结束 → 生成报告
- [x] 报告页得分环 / 雷达图 / 维度明细 / 优势 / 行动建议
- [x] 历史记录筛选与「查看报告」跳转
- [x] 题库筛选与搜索

### 11.3 运行方式

```bash
npm install
npm run dev      # 开发模式，默认 http://localhost:5173
npm run build    # 生产构建，产物输出到 dist/
npm run preview  # 预览生产构建
```

> 注：`npm install` 时若私有 Nexus 源（192.168.3.254:8081）不可用，可用 `npm install --registry https://registry.npmjs.org` 安装。

---

## 12. 后端对接说明

当前 Mock 服务层已按 REST 语义抽象。对接真实后端（FastAPI）时，仅需：

1. 新增 `src/api/` 目录，用 Axios 实现与 `src/mock/index.ts` **同名同签名**的接口（拦截器统一携带 JWT）。
2. 将各 Store 中的 `import * as api from '../mock'` 切换为真实 API 模块。
3. 移除 `localStorage` 持久化逻辑，改由服务端数据驱动。
4. SSE 流式部分：将 `sendAnswer` 的 Promise 返回替换为 `fetch` 流读取，逐片追加到消息内容。

---

## 13. 已知限制与后续规划

- v1 仅 PC 端；移动端适配、语音交互、多人模拟面试等规划在 PRD 第 7 章（v2/v3）。
- 评分、追问、报告由 Mock 规则生成，非真实 AI；接入 DeepSeek 后由后端评分模块替换。
- 题库浏览在 PRD 中标注为「v1 后延期」，本工程以预览形式实现。
- 面试会话为内存态，刷新面试页会重新开始一场面试（符合 Mock 定位）。

---

*本报告随 release 1.0.0 一并提交。*
