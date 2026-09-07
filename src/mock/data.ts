// ============================================================
// 模拟数据源（Mock Data）
// 依据 PRD 第 3 章标签体系 + ai-interview-prototype 文案构造
// ============================================================

import type {
  Difficulty,
  InterviewMode,
  InterviewRecord,
  Question,
  QuestionType,
  Resume
} from '../types'

// ---------- 枚举与标签 ----------

export const POSITIONS: { label: string; value: string }[] = [
  { label: '后端开发', value: 'backend' },
  { label: '前端开发', value: 'frontend' },
  { label: '算法工程师', value: 'algorithm' },
  { label: '产品经理', value: 'product' },
  { label: '运营', value: 'ops' },
  { label: '数据分析', value: 'data' }
]

export const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

export const QUESTION_TYPES: { label: string; value: QuestionType }[] = [
  { label: '技术基础', value: 'tech' },
  { label: '行为面试', value: 'behavioral' },
  { label: '系统设计', value: 'system-design' },
  { label: '代码题', value: 'coding' }
]

export const MODES: { label: string; value: InterviewMode }[] = [
  { label: '题库抽题', value: 'question-bank' },
  { label: 'AI 动态追问', value: 'dynamic-ai' }
]

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

export const MODE_LABEL: Record<InterviewMode, string> = {
  'question-bank': '题库抽题',
  'dynamic-ai': 'AI 动态追问'
}

export const TYPE_LABEL: Record<QuestionType, string> = {
  tech: '技术基础',
  behavioral: '行为面试',
  'system-design': '系统设计',
  coding: '代码题'
}

/** 职位 value -> label 反查 */
export function positionLabel(value: string): string {
  return POSITIONS.find((p) => p.value === value)?.label ?? value
}

// ---------- 题库 ----------

export const QUESTIONS: Question[] = [
  // 后端
  {
    id: 'q-backend-01',
    category: 'tech',
    positionTag: 'backend',
    difficulty: 'medium',
    tags: ['Redis', '缓存'],
    content: 'Redis 为什么快？为什么单线程还能支撑高并发？',
    modelAnswer: '内存存储、非阻塞 I/O 多路复用、单线程避免上下文切换与锁竞争。'
  },
  {
    id: 'q-backend-02',
    category: 'system-design',
    positionTag: 'backend',
    difficulty: 'hard',
    tags: ['系统设计', '短链接'],
    content: '设计一个短链接服务，需要考虑哪些点？',
    modelAnswer: '发号器、Base62 编码、缓存、301/302、统计与限流。'
  },
  {
    id: 'q-backend-03',
    category: 'tech',
    positionTag: 'backend',
    difficulty: 'hard',
    tags: ['Redis', '缓存'],
    content: '如何防止缓存雪崩、穿透和击穿？',
    modelAnswer: '雪崩：随机过期时间 + 多级缓存；穿透：布隆过滤器 + 空值缓存；击穿：互斥锁 + 热点永不过期。'
  },
  {
    id: 'q-backend-04',
    category: 'tech',
    positionTag: 'backend',
    difficulty: 'medium',
    tags: ['MySQL', '索引'],
    content: 'MySQL 索引失效的常见场景有哪些？',
    modelAnswer: '最左前缀不满足、对索引列做函数运算、隐式类型转换、like 前置通配符等。'
  },
  {
    id: 'q-backend-05',
    category: 'tech',
    positionTag: 'backend',
    difficulty: 'hard',
    tags: ['分布式', '锁'],
    content: '分布式锁的实现方案与各自的优缺点？',
    modelAnswer: 'Redis（setnx + 过期时间）性能高但有脑裂风险；Zookeeper 一致性强但性能较差；数据库锁实现简单但可用性一般。'
  },
  {
    id: 'q-backend-06',
    category: 'tech',
    positionTag: 'backend',
    difficulty: 'hard',
    tags: ['Kafka', '消息队列'],
    content: '消息队列如何保证消息不丢失？',
    modelAnswer: '生产端确认 + 重试、Broker 持久化与多副本、消费端手动提交 offset 保证至少一次投递。'
  },
  // 前端
  {
    id: 'q-frontend-01',
    category: 'tech',
    positionTag: 'frontend',
    difficulty: 'medium',
    tags: ['Vue', '响应式'],
    content: 'Vue3 响应式原理与 Vue2 相比有何区别？',
    modelAnswer: 'Vue2 用 Object.defineProperty 无法监听数组索引与新增属性；Vue3 用 Proxy 实现深度响应式，性能更好且能拦截更多操作。'
  },
  {
    id: 'q-frontend-02',
    category: 'tech',
    positionTag: 'frontend',
    difficulty: 'medium',
    tags: ['网络', '浏览器'],
    content: '浏览器从输入 URL 到页面渲染，发生了什么？',
    modelAnswer: 'DNS 解析 → TCP 握手 → TLS → HTTP 请求 → 服务端响应 → 解析 HTML/CSS/JS → 构建 DOM/CSSOM → 布局 → 绘制。'
  },
  {
    id: 'q-frontend-03',
    category: 'tech',
    positionTag: 'frontend',
    difficulty: 'hard',
    tags: ['性能', '优化'],
    content: '如何优化前端首屏加载性能？',
    modelAnswer: '路由懒加载、资源压缩与 CDN、关键路径 CSS 内联、图片懒加载、Tree-shaking、骨架屏。'
  },
  {
    id: 'q-frontend-04',
    category: 'tech',
    positionTag: 'frontend',
    difficulty: 'easy',
    tags: ['虚拟DOM'],
    content: '谈谈你对虚拟 DOM 的理解。',
    modelAnswer: '用 JS 对象描述真实 DOM，通过 diff 算法最小化更新，减少直接操作真实 DOM 的开销。'
  },
  // 算法
  {
    id: 'q-algorithm-01',
    category: 'coding',
    positionTag: 'algorithm',
    difficulty: 'medium',
    tags: ['LRU', '数据结构'],
    content: '手写一个 LRU 缓存实现。',
    modelAnswer: '哈希表 + 双向链表，get/put 均为 O(1)，访问时移动到链表头部，超容量淘汰尾部。'
  },
  {
    id: 'q-algorithm-02',
    category: 'coding',
    positionTag: 'algorithm',
    difficulty: 'easy',
    tags: ['链表', '快慢指针'],
    content: '如何判断一个链表是否有环？',
    modelAnswer: '快慢指针：慢指针每次走一步，快指针每次走两步，若相遇则有环；快指针走到 null 则无环。'
  },
  {
    id: 'q-algorithm-03',
    category: 'tech',
    positionTag: 'algorithm',
    difficulty: 'medium',
    tags: ['排序'],
    content: '讲讲快速排序的思想与时间复杂度。',
    modelAnswer: '分治思想，选基准值将数组划分为左右两部分，递归排序；平均 O(n log n)，最坏 O(n²)。'
  },
  // 产品
  {
    id: 'q-product-01',
    category: 'behavioral',
    positionTag: 'product',
    difficulty: 'medium',
    tags: ['数据分析', '指标'],
    content: '如何衡量一个功能上线后的效果？',
    modelAnswer: '先明确北极星指标与功能目标，再拆解过程指标（使用率、转化率、留存），结合 A/B 测试与漏斗分析。'
  },
  {
    id: 'q-product-02',
    category: 'system-design',
    positionTag: 'product',
    difficulty: 'hard',
    tags: ['增长', '分析'],
    content: '如果产品 DAU 下降 10%，你会如何排查？',
    modelAnswer: '先确认是否数据口径问题，再按渠道、版本、机型、时段拆分定位下降人群，结合近期改动与竞品动态归因。'
  },
  // 运营
  {
    id: 'q-ops-01',
    category: 'behavioral',
    positionTag: 'ops',
    difficulty: 'medium',
    tags: ['运营', '活动'],
    content: '如何策划一场拉新活动？',
    modelAnswer: '明确目标与预算 → 确定目标人群与渠道 → 设计活动玩法与利益点 → 制定传播机制 → 埋点复盘。'
  },
  {
    id: 'q-ops-02',
    category: 'behavioral',
    positionTag: 'ops',
    difficulty: 'medium',
    tags: ['留存'],
    content: '如何提升用户留存率？',
    modelAnswer: '通过新用户引导、push 召回、内容/功能持续价值供给、会员体系与积分等手段分层运营。'
  },
  // 数据
  {
    id: 'q-data-01',
    category: 'system-design',
    positionTag: 'data',
    difficulty: 'medium',
    tags: ['用户画像', '标签'],
    content: '如何设计一个用户画像标签体系？',
    modelAnswer: '按统计/规则/算法三类标签分层，覆盖人口属性、行为偏好、消费能力，统一元数据与更新机制。'
  },
  {
    id: 'q-data-02',
    category: 'tech',
    positionTag: 'data',
    difficulty: 'medium',
    tags: ['A/B测试'],
    content: 'A/B 测试的样本量如何确定？',
    modelAnswer: '由显著性水平、统计功效、最小可检测效应（MDE）和基线转化率共同决定，可用公式或在线计算器估算。'
  },
  // 通用行为面试
  {
    id: 'q-general-01',
    category: 'behavioral',
    positionTag: 'general',
    difficulty: 'easy',
    tags: ['STAR'],
    content: '介绍一个你最有成就感的项目，重点说一下你的贡献。',
    modelAnswer: '用 STAR 结构：背景 → 任务 → 行动 → 结果，突出个人贡献并用数据量化产出。'
  },
  {
    id: 'q-general-02',
    category: 'behavioral',
    positionTag: 'general',
    difficulty: 'easy',
    tags: ['规划'],
    content: '讲讲你遇到过的最大的困难，以及你是如何解决的？',
    modelAnswer: '描述困难背景、当时的分析过程、采取的行动、最终结果与个人收获，体现复盘能力。'
  }
]

// ---------- 评分素材池 ----------

export const STRENGTH_POOL: string[] = [
  '技术栈回答完整，能主动说明选型理由',
  '面对追问时应变能力强，能快速给出合理方案',
  '项目经验描述有量化数据支撑',
  '回答层次清晰，逻辑结构完整',
  '表达简洁，能抓住问题核心',
  '对岗位核心技能理解到位，匹配度高'
]

export const WEAKNESS_POOL: string[] = [
  '部分回答偏冗长，建议用 STAR 结构压缩',
  '系统设计中边界条件提及不足',
  '对部分底层原理只停留在使用层面，缺乏深入',
  '面对压力问题略有紧张，思考时间偏长',
  '关键术语表述不够精确',
  '缺少对方案优劣与替代选项的对比分析'
]

export const ACTION_POOL: string[] = [
  '针对薄弱知识点补充系统化学习，输出学习笔记',
  '练习用 3 句话概括技术方案的习惯',
  '多看经典系统设计案例，梳理边界条件清单',
  '用 STAR 结构模板反复打磨行为面试故事',
  '限时作答训练，提升临场表达的稳定性',
  '整理高频面试题，建立个人答题框架库'
]

export const SUMMARY_POOL: string[] = [
  '技术功底扎实，面对追问时能快速给出合理方案；建议在表达简洁度与系统设计边界条件上继续打磨。',
  '整体表现良好，逻辑清晰且项目经验丰富；后续可加强底层原理的深度与表达的精炼度。',
  '回答结构完整、态度积极，岗位匹配度较高；在部分高难度追问下仍有提升空间。',
  '基础能力在线，能结合项目实际展开论述；建议进一步规范专业术语与方案对比习惯。'
]

// ---------- 种子简历 ----------

export const SEED_RESUMES: Resume[] = [
  {
    id: 'resume-1',
    title: '后端开发工程师简历',
    positionTag: 'backend',
    format: 'markdown',
    content: `# 林晓雨
3 年 Java 后端开发经验，熟悉 Redis、分布式、消息队列。

## 教育经历
- 2020 - 2024 某大学 计算机科学与技术 本科

## 工作经历
- 2024 - 至今 某公司 后端工程师：负责订单系统重构，QPS 提升 40%

## 技能
Java / Spring / Redis / MySQL / Kafka`,
    parsed: {
      education: '2020-2024 · 某大学 · 计算机科学与技术 · 本科',
      workExperience: '2024-至今 · 某公司 · 后端工程师 · 订单系统重构',
      skills: 'Java, Spring, Redis, MySQL, Kafka',
      projects: '订单系统重构：微服务拆分 + Redis 缓存，QPS 提升 40%。'
    },
    summary: '3 年经验 · Java / Redis / 分布式',
    updatedAt: '2026-09-04'
  },
  {
    id: 'resume-2',
    title: '校招求职简历（通用）',
    positionTag: 'frontend',
    format: 'text',
    content: '2026 届 · 计算机科学与技术\n熟悉 Vue3、TypeScript、Web 性能优化，有 2 段实习经历。',
    parsed: {
      education: '2022-2026 · 某大学 · 计算机科学与技术 · 本科',
      workExperience: '2025 · 某互联网公司 · 前端实习生 · 中后台系统开发',
      skills: 'Vue3, TypeScript, Vite, ECharts',
      projects: '中后台管理系统：组件封装 + 权限控制 + 性能优化。'
    },
    summary: '2026 届 · 计算机科学与技术',
    updatedAt: '2026-08-20'
  }
]

// ---------- 种子历史记录 ----------

export const SEED_HISTORY: InterviewRecord[] = [
  {
    id: 'sess-1001',
    position: '后端开发',
    mode: 'question-bank',
    difficulty: 'medium',
    questionCount: 10,
    startedAt: '2026-09-06 14:22',
    durationMin: 22,
    overallScore: 88,
    dimensions: [
      { key: 'accuracy', name: '内容准确性', score: 90, weight: 0.3 },
      { key: 'logic', name: '逻辑结构', score: 86, weight: 0.25 },
      { key: 'expression', name: '表达清晰度', score: 82, weight: 0.2 },
      { key: 'adaptability', name: '追问应对', score: 92, weight: 0.15 },
      { key: 'match', name: '岗位匹配度', score: 88, weight: 0.1 }
    ],
    strengths: ['技术栈回答完整，能主动说明选型理由', '面对追问时应变能力强', '项目经验描述有量化数据支撑'],
    weaknesses: ['部分回答偏冗长，建议用 STAR 结构压缩', '系统设计中边界条件提及不足'],
    actionPlan: [
      '针对「分布式缓存」补充学习 Redis 底层实现',
      '练习用 3 句话概括技术方案的习惯',
      '多看 TopCoder / LeetCode Medium 题'
    ],
    summary: '技术功底扎实，面对追问时能快速给出合理方案；建议在表达简洁度与系统设计边界条件上继续打磨。'
  },
  {
    id: 'sess-1002',
    position: '系统设计',
    mode: 'dynamic-ai',
    difficulty: 'hard',
    questionCount: 6,
    startedAt: '2026-09-04 09:05',
    durationMin: 31,
    overallScore: 82,
    dimensions: [
      { key: 'accuracy', name: '内容准确性', score: 84, weight: 0.3 },
      { key: 'logic', name: '逻辑结构', score: 80, weight: 0.25 },
      { key: 'expression', name: '表达清晰度', score: 78, weight: 0.2 },
      { key: 'adaptability', name: '追问应对', score: 82, weight: 0.15 },
      { key: 'match', name: '岗位匹配度', score: 84, weight: 0.1 }
    ],
    strengths: ['回答层次清晰，逻辑结构完整', '对系统设计整体框架把握较好'],
    weaknesses: ['系统设计中边界条件提及不足', '对部分底层原理只停留在使用层面'],
    actionPlan: ['多看经典系统设计案例，梳理边界条件清单', '整理高频面试题，建立个人答题框架库'],
    summary: '整体表现良好，逻辑清晰；后续可加强系统设计边界条件与底层原理的深度。'
  },
  {
    id: 'sess-1003',
    position: '行为面试',
    mode: 'question-bank',
    difficulty: 'easy',
    questionCount: 8,
    startedAt: '2026-09-01 20:40',
    durationMin: 18,
    overallScore: 76,
    dimensions: [
      { key: 'accuracy', name: '内容准确性', score: 78, weight: 0.3 },
      { key: 'logic', name: '逻辑结构', score: 74, weight: 0.25 },
      { key: 'expression', name: '表达清晰度', score: 72, weight: 0.2 },
      { key: 'adaptability', name: '追问应对', score: 76, weight: 0.15 },
      { key: 'match', name: '岗位匹配度', score: 80, weight: 0.1 }
    ],
    strengths: ['表达简洁，能抓住问题核心', '对岗位核心技能理解到位'],
    weaknesses: ['部分回答偏冗长，建议用 STAR 结构压缩', '关键术语表述不够精确'],
    actionPlan: ['用 STAR 结构模板反复打磨行为面试故事', '限时作答训练，提升临场表达的稳定性'],
    summary: '回答结构完整、态度积极，岗位匹配度较高；在表达精炼度与 STAR 结构上仍有提升空间。'
  },
  {
    id: 'sess-1004',
    position: '后端开发',
    mode: 'question-bank',
    difficulty: 'medium',
    questionCount: 10,
    startedAt: '2026-08-28 16:12',
    durationMin: 25,
    overallScore: 84,
    dimensions: [
      { key: 'accuracy', name: '内容准确性', score: 86, weight: 0.3 },
      { key: 'logic', name: '逻辑结构', score: 82, weight: 0.25 },
      { key: 'expression', name: '表达清晰度', score: 80, weight: 0.2 },
      { key: 'adaptability', name: '追问应对', score: 84, weight: 0.15 },
      { key: 'match', name: '岗位匹配度', score: 88, weight: 0.1 }
    ],
    strengths: ['技术栈回答完整，能主动说明选型理由', '面对追问时应变能力强'],
    weaknesses: ['缺少对方案优劣与替代选项的对比分析'],
    actionPlan: ['针对薄弱知识点补充系统化学习，输出学习笔记', '练习用 3 句话概括技术方案的习惯'],
    summary: '技术功底扎实，能结合项目实际展开论述；建议进一步规范专业术语与方案对比习惯。'
  },
  {
    id: 'sess-1005',
    position: '算法',
    mode: 'dynamic-ai',
    difficulty: 'hard',
    questionCount: 5,
    startedAt: '2026-08-25 11:30',
    durationMin: 28,
    overallScore: 68,
    dimensions: [
      { key: 'accuracy', name: '内容准确性', score: 66, weight: 0.3 },
      { key: 'logic', name: '逻辑结构', score: 68, weight: 0.25 },
      { key: 'expression', name: '表达清晰度', score: 70, weight: 0.2 },
      { key: 'adaptability', name: '追问应对', score: 64, weight: 0.15 },
      { key: 'match', name: '岗位匹配度', score: 74, weight: 0.1 }
    ],
    strengths: ['基础算法思路正确，能写出手写代码'],
    weaknesses: ['面对压力问题略有紧张，思考时间偏长', '对部分底层原理只停留在使用层面'],
    actionPlan: ['多看 TopCoder / LeetCode Medium 题', '限时作答训练，提升临场表达的稳定性'],
    summary: '算法基础在线，但复杂度的边界分析不够深入；建议加强限时练习与复杂度推导。'
  }
]
