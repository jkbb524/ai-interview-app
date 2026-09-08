// ============================================================
// 模拟服务层（Mock Service）
// 以 Promise 模拟后端 REST API，数据持久化到 localStorage，
// 便于前端在无后端情况下完整体验「简历 → 面试 → 评分 → 报告」闭环。
// 对接真实后端时，只需将本层替换为 axios 请求实现。
// ============================================================

import type {
  Difficulty,
  InterviewConfig,
  InterviewRecord,
  Question,
  Resume,
  ScoreDimension,
  User
} from '../types'
import {
  ACTION_POOL,
  DIFFICULTIES,
  POSITIONS,
  QUESTIONS,
  SEED_HISTORY,
  SEED_RESUMES,
  STRENGTH_POOL,
  WEAKNESS_POOL
} from './data'

const LS = {
  token: 'ai-interview:token',
  user: 'ai-interview:user',
  users: 'ai-interview:users',
  resumes: 'ai-interview:resumes',
  history: 'ai-interview:history'
}

interface StoredUser extends User {
  password: string
}

// ---------- 工具 ----------

function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 200))
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function ensureSeed(): void {
  if (!localStorage.getItem(LS.users)) {
    write<StoredUser[]>(LS.users, [{ ...DEMO_USER, password: DEMO_PASSWORD }])
  }
  if (!localStorage.getItem(LS.resumes)) {
    write(LS.resumes, SEED_RESUMES)
  }
  if (!localStorage.getItem(LS.history)) {
    write(LS.history, SEED_HISTORY)
  }
}

function clamp(n: number, min = 40, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

/** 取数组中随机 N 项 */
function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

function formatNow(): string {
  const d = new Date()
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ---------- 认证 ----------

const DEMO_USER: User = {
  username: '林晓雨',
  email: 'demo@example.com',
  position: '后端开发'
}
const DEMO_PASSWORD = '123456'

export async function login(username: string, password: string): Promise<User> {
  await delay(500)
  ensureSeed()
  const users = read<StoredUser[]>(LS.users, [])
  const matched = users.find((u) => u.email === username || u.username === username)
  if (!matched) {
    throw new Error('账号不存在,请先注册')
  }
  if (matched.password !== password) {
    throw new Error('账号或密码错误')
  }
  const user: User = {
    username: matched.username,
    email: matched.email,
    position: matched.position
  }
  write(LS.token, uid('token'))
  write(LS.user, user)
  return user
}

export async function register(payload: {
  username: string
  email: string
  position: string
  password: string
}): Promise<User> {
  await delay(500)
  ensureSeed()
  const users = read<StoredUser[]>(LS.users, [])
  if (users.some((u) => u.email === payload.email)) {
    throw new Error('该邮箱已注册,请直接登录或换一个邮箱')
  }
  const user: User = {
    username: payload.username,
    email: payload.email,
    position: payload.position
  }
  users.push({ ...user, password: payload.password })
  write(LS.users, users)
  write(LS.token, uid('token'))
  write(LS.user, user)
  return user
}

export function getCurrentUser(): User | null {
  return read<User | null>(LS.user, null)
}

export function logout(): void {
  localStorage.removeItem(LS.token)
  localStorage.removeItem(LS.user)
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(LS.token)
}

// ---------- 简历 ----------

export async function getResumes(): Promise<Resume[]> {
  await delay(300)
  return read<Resume[]>(LS.resumes, [])
}

export async function createResume(payload: Omit<Resume, 'id' | 'updatedAt'>): Promise<Resume> {
  await delay(400)
  const resumes = read<Resume[]>(LS.resumes, [])
  const resume: Resume = {
    ...payload,
    id: uid('resume'),
    updatedAt: formatNow().slice(0, 10)
  }
  resumes.unshift(resume)
  write(LS.resumes, resumes)
  return resume
}

export async function updateResume(id: string, payload: Partial<Resume>): Promise<Resume> {
  await delay(400)
  const resumes = read<Resume[]>(LS.resumes, [])
  const idx = resumes.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('简历不存在')
  resumes[idx] = {
    ...resumes[idx],
    ...payload,
    id,
    updatedAt: formatNow().slice(0, 10)
  }
  write(LS.resumes, resumes)
  return resumes[idx]
}

export async function deleteResume(id: string): Promise<void> {
  await delay(300)
  write(
    LS.resumes,
    read<Resume[]>(LS.resumes, []).filter((r) => r.id !== id)
  )
}

// ---------- 题库 ----------

export interface QuestionFilter {
  position?: string
  difficulty?: Difficulty | ''
  category?: string
  keyword?: string
}

export async function getQuestions(filter: QuestionFilter = {}): Promise<Question[]> {
  await delay(300)
  return QUESTIONS.filter((q) => {
    if (filter.position && filter.position !== 'all') {
      const tag = POSITIONS.find((p) => p.label === filter.position)?.value
      if (tag && q.positionTag !== tag && q.positionTag !== 'general') return false
    }
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false
    if (filter.category && q.category !== filter.category) return false
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      const hit = [q.content, q.modelAnswer, ...q.tags].some((s) => s.toLowerCase().includes(kw))
      if (!hit) return false
    }
    return true
  })
}

// ---------- 面试会话 ----------

interface AnswerAnalysis {
  /** 答案字数（去空白） */
  length: number
  /** 命中题目的标签关键词数 */
  keywordHits: number
  /** 是否出现量化数据（数字 / 百分比 / QPS 等） */
  hasQuantification: boolean
  /** 是否含 STAR 结构信号词 */
  hasSTAR: boolean
  /** 是否出现结构化连接词 */
  hasStructure: boolean
  /** 是否含对比/取舍表述 */
  hasComparison: boolean
  /** 是否过短（< 30 字） */
  tooShort: boolean
  /** 是否过长（> 500 字） */
  tooLong: boolean
  /** 综合作答质量分（0-100，60 为及格基线） */
  quality: number
  /** 针对当前题目的关键词覆盖度 0-1 */
  coverage: number
  /** 主要欠缺点（用于最终报告） */
  gaps: string[]
  /** 主要亮点（用于最终报告） */
  highlights: string[]
}

const STAR_SIGNALS = ['背景', '任务', '行动', '结果', 'situation', 'task', 'action', 'result', '为了', '于是', '最终', '通过']
const STRUCTURE_SIGNALS = ['首先', '其次', '然后', '最后', '第一', '第二', '一方面', '另一方面', '总结一下', '综上']
const COMPARE_SIGNALS = ['相比', ' versus ', '对比', '取舍', '优缺点', '代价', '权衡', '替代方案', '而不是']
const QUANT_PATTERN = /\d+(\.\d+)?\s*(%|倍|万|千|次|秒|ms|qps|tps|个|条|台|台机器|g|gb|mb|分钟|小时)/i

function analyzeAnswer(question: Question, answer: string): AnswerAnalysis {
  const text = answer.replace(/\s+/g, '')
  const length = text.length
  const lowerAns = answer.toLowerCase()

  const keywords = [...question.tags, ...question.content.split(/[，？、,？\s]+/).filter((s) => s.length >= 2)]
  const keywordHits = keywords.filter((k) => k && answer.includes(k)).length
  const coverage = keywords.length ? Math.min(1, keywordHits / Math.max(2, keywords.length * 0.4)) : 0.5

  const hasQuantification = QUANT_PATTERN.test(answer)
  const hasSTAR = STAR_SIGNALS.some((s) => lowerAns.includes(s.toLowerCase()))
  const hasStructure = STRUCTURE_SIGNALS.some((s) => answer.includes(s))
  const hasComparison = COMPARE_SIGNALS.some((s) => lowerAns.includes(s.toLowerCase()))

  const tooShort = length < 30
  const tooLong = length > 500

  const gaps: string[] = []
  const highlights: string[] = []

  // 质量评分基线 60，逐项加减
  let quality = 60
  if (tooShort) {
    quality -= 18
    gaps.push('回答过短，缺少展开与论据支撑')
  } else if (length < 80) {
    quality -= 8
    gaps.push('回答偏简略，建议补充背景与结果')
  } else if (tooLong) {
    quality -= 5
    gaps.push('回答偏冗长，建议用 STAR 结构压缩')
  } else {
    highlights.push('篇幅适中，信息密度合理')
    quality += 4
  }

  if (keywordHits > 0) {
    quality += Math.min(15, keywordHits * 4)
    highlights.push(`命中知识点关键词 ${keywordHits} 个`)
  } else {
    quality -= 12
    gaps.push('未提及题目核心知识点')
  }

  if (hasQuantification) {
    quality += 8
    highlights.push('回答中包含量化数据，可佐证产出')
  } else if (!tooShort) {
    gaps.push('缺少量化数据支撑结论')
  }

  if (hasSTAR) {
    quality += 6
    highlights.push('具备 STAR 结构意识')
  } else if (question.category === 'behavioral') {
    quality -= 6
    gaps.push('行为题缺少 STAR 结构（背景-任务-行动-结果）')
  }

  if (hasStructure) {
    quality += 5
    highlights.push('层次清晰，使用了结构化连接词')
  } else if (!tooShort) {
    gaps.push('缺少结构化表达，建议加连接词分点')
  }

  if (hasComparison) {
    quality += 6
    highlights.push('体现了方案对比与取舍意识')
  }
  if (question.category === 'system-design' && !hasComparison) {
    quality -= 4
    gaps.push('系统设计题未对比替代方案')
  }

  // 难度系数：困难题基线更高
  if (question.difficulty === 'hard') quality -= 3
  if (question.difficulty === 'easy') quality += 3

  quality = clamp(Math.round(quality), 35, 98)
  if (tooShort) quality = clamp(quality, 35, 55)

  return {
    length,
    keywordHits,
    hasQuantification,
    hasSTAR,
    hasStructure,
    hasComparison,
    tooShort,
    tooLong,
    quality,
    coverage,
    gaps,
    highlights
  }
}

/** 基于分析结果拼一段针对性反馈 */
function buildFeedback(q: Question, a: AnswerAnalysis, isLast: boolean): string {
  const parts: string[] = []

  // 起评：根据质量分档给不同开场
  if (a.tooShort) {
    parts.push(pick(['回答偏简略，可以再展开一些。', '这里信息量不太够，我们再看下一题。', '先记下你的简短回答。'], 1)[0])
  } else if (a.quality >= 85) {
    parts.push(pick(['回答得很到位，', '讲得清楚，', '不错，思路很完整，'], 1)[0])
  } else if (a.quality >= 70) {
    parts.push(pick(['基本说清楚了，', '方向是对的，', '可以，思路基本成立，'], 1)[0])
  } else if (a.quality >= 55) {
    parts.push(pick(['方向可以，但深度不够，', '提到了关键点，但还不够完整，', '思路有点偏，'], 1)[0])
  } else {
    parts.push(pick(['这一题答得不太理想，', '这一块需要再加强，', '这里答得不够清楚，'], 1)[0])
  }

  // 针对性点评：挑 1-2 条亮点或不足
  if (a.highlights.length && a.quality >= 65) {
    parts.push(`${a.highlights[0]}。`)
  } else if (a.gaps.length) {
    parts.push(`${a.gaps[0]}。`)
  }

  // 追问：困难题或覆盖度低时主动追问一个细节
  if (!isLast && a.coverage < 0.5 && !a.tooShort) {
    const tag = q.tags[0] ?? q.content.slice(0, 6)
    parts.push(`顺便追问一下：${tag} 在实际场景里还有什么要注意的？`)
  }

  return parts.join('')
}

interface ActiveSession {
  id: string
  config: InterviewConfig
  questions: Question[]
  answers: { question: Question; answer: string; analysis: AnswerAnalysis }[]
  startedAt: number
}

let activeSession: ActiveSession | null = null

const CLOSING = '感谢你的回答，本次面试到此结束。点击右侧「结束面试并生成报告」即可查看多维度评分与复盘报告。'

function positionTag(label: string): string {
  return POSITIONS.find((p) => p.label === label)?.value ?? 'general'
}

function pickQuestions(config: InterviewConfig): Question[] {
  const tag = positionTag(config.position)
  const pool = QUESTIONS.filter((q) => q.positionTag === tag || q.positionTag === 'general')
  const src = pool.length ? pool : QUESTIONS
  // 难度匹配优先，其余按原顺序补齐
  const sorted = [...src].sort((a, b) => {
    const aMatch = a.difficulty === config.difficulty ? 0 : 1
    const bMatch = b.difficulty === config.difficulty ? 0 : 1
    return aMatch - bMatch
  })
  const result: Question[] = []
  for (let i = 0; i < config.totalQuestions; i++) {
    result.push(sorted[i % sorted.length])
  }
  return result
}

export interface StartResult {
  sessionId: string
  greeting: string
  question: Question
  totalQuestions: number
  currentIndex: number
}

export async function startInterview(config: InterviewConfig): Promise<StartResult> {
  await delay(500)
  const questions = pickQuestions(config)
  activeSession = {
    id: uid('sess'),
    config,
    questions,
    answers: [],
    startedAt: Date.now()
  }
  const diff = DIFFICULTIES.find((d) => d.value === config.difficulty)?.label ?? config.difficulty
  const greeting = `你好，欢迎参加本次「${config.position}」模拟面试。本次共 ${config.totalQuestions} 题，难度为${diff}。我会根据你的作答内容进行针对性追问，结束后给出五维评分与复盘报告。我们先从第 1 题开始：`
  return {
    sessionId: activeSession.id,
    greeting,
    question: questions[0],
    totalQuestions: questions.length,
    currentIndex: 0
  }
}

export interface AnswerResult {
  reply: string
  question: Question | null
  isComplete: boolean
  currentIndex: number
}

export async function sendAnswer(answer: string): Promise<AnswerResult> {
  await delay(700)
  if (!activeSession) throw new Error('会话不存在')
  const currentIndex = activeSession.answers.length
  const question = activeSession.questions[currentIndex] ?? activeSession.questions[0]
  const analysis = analyzeAnswer(question, answer)
  activeSession.answers.push({ question, answer, analysis })

  const nextIndex = activeSession.answers.length
  if (nextIndex < activeSession.questions.length) {
    const nextQ = activeSession.questions[nextIndex]
    const feedback = buildFeedback(question, analysis, false)
    const reply = `${feedback} 我们来看第 ${nextIndex + 1} 题：${nextQ.content}`
    return { reply, question: nextQ, isComplete: false, currentIndex: nextIndex }
  }
  return { reply: CLOSING, question: null, isComplete: true, currentIndex: nextIndex }
}

function buildScores(): { dimensions: ScoreDimension[]; overall: number } {
  if (!activeSession) {
    return { dimensions: [], overall: 0 }
  }
  const { answers, questions, config } = activeSession
  const total = questions.length
  const answered = answers.length
  const completion = total > 0 ? answered / total : 1

  // 每个维度初始 60，根据各题分析结果加权
  const dimBase = {
    accuracy: 60,
    logic: 60,
    expression: 60,
    adaptability: 60,
    match: 60
  }

  answers.forEach(({ analysis, question }) => {
    // 内容准确性：关键词命中 + 量化
    dimBase.accuracy += (analysis.coverage * 18) + (analysis.hasQuantification ? 6 : 0) - (analysis.keywordHits === 0 ? 8 : 0)
    // 逻辑结构：STAR + 结构化连接词
    dimBase.logic += (analysis.hasSTAR ? 8 : 0) + (analysis.hasStructure ? 7 : 0) - (analysis.tooShort ? 6 : 0)
    // 表达清晰度：长度适中加分，过短/过长扣分
    if (analysis.tooShort) dimBase.expression -= 12
    else if (analysis.tooLong) dimBase.expression -= 5
    else dimBase.expression += 8
    // 追问应对：覆盖度低但未太短 -> 体现被追问后还能答 -> 这里用 coverage 折算
    dimBase.adaptability += analysis.coverage * 12 - (analysis.gaps.length > 2 ? 4 : 0)
    // 岗位匹配：题目命中岗位标签 + 关键词
    dimBase.match += question.positionTag === positionTag(config.position) ? 6 : 0
    dimBase.match += analysis.keywordHits > 0 ? 4 : 0
  })

  // 难度系数：困难题整体 +3
  const diffBonus = config.difficulty === 'hard' ? 3 : config.difficulty === 'easy' ? -3 : 0

  const dims: ScoreDimension[] = [
    { key: 'accuracy', name: '内容准确性', weight: 0.3, score: clamp(Math.round(dimBase.accuracy / Math.max(1, answered) + diffBonus)) },
    { key: 'logic', name: '逻辑结构', weight: 0.25, score: clamp(Math.round(dimBase.logic / Math.max(1, answered) + diffBonus)) },
    { key: 'expression', name: '表达清晰度', weight: 0.2, score: clamp(Math.round(dimBase.expression / Math.max(1, answered) + diffBonus)) },
    { key: 'adaptability', name: '追问应对', weight: 0.15, score: clamp(Math.round(dimBase.adaptability / Math.max(1, answered) + diffBonus)) },
    { key: 'match', name: '岗位匹配度', weight: 0.1, score: clamp(Math.round(dimBase.match / Math.max(1, answered) + diffBonus)) }
  ]

  // 完成度不足时整体下修
  if (completion < 1) {
    dims.forEach((d) => {
      d.score = clamp(Math.round(d.score * (0.7 + 0.3 * completion)))
    })
  }

  const overall = Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0))
  return { dimensions: dims, overall }
}

function buildReport(): { strengths: string[]; weaknesses: string[]; actionPlan: string[]; summary: string } {
  if (!activeSession) {
    return { strengths: [], weaknesses: [], actionPlan: [], summary: '' }
  }
  const answers = activeSession.answers

  // 收集所有 highlight / gap，按频次去重抽样
  const highlightCounter = new Map<string, number>()
  const gapCounter = new Map<string, number>()
  answers.forEach(({ analysis }) => {
    analysis.highlights.forEach((h) => highlightCounter.set(h, (highlightCounter.get(h) ?? 0) + 1))
    analysis.gaps.forEach((g) => gapCounter.set(g, (gapCounter.get(g) ?? 0) + 1))
  })

  const topHighlights = [...highlightCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h)
  const topGaps = [...gapCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([g]) => g)

  // 兜底：若分析信号不足，从静态池补
  const strengths = topHighlights.length >= 2
    ? topHighlights
    : [...topHighlights, ...pick(STRENGTH_POOL, 3 - topHighlights.length)].slice(0, 3)
  const weaknesses = topGaps.length >= 1
    ? topGaps
    : [...topGaps, ...pick(WEAKNESS_POOL, 2 - topGaps.length)].slice(0, 2)

  // 行动建议：根据 gap 关键词匹配
  const actionPool = [...ACTION_POOL]
  const actions: string[] = []
  const gapText = topGaps.join('')
  if (gapText.includes('STAR') || gapText.includes('结构')) {
    actions.push('用 STAR 结构模板反复打磨行为面试故事，回答前先在脑中列 3 个要点')
  }
  if (gapText.includes('量化')) {
    actions.push('梳理项目经历，把"提升了""优化了"补成具体数字（如 QPS、转化率、降本幅度）')
  }
  if (gapText.includes('关键词') || gapText.includes('知识点')) {
    actions.push('针对本次未命中的知识点，建立专题学习笔记并输出简短总结')
  }
  if (gapText.includes('冗长')) {
    actions.push('练习用 3 句话概括一个技术方案，提升表达精炼度')
  }
  if (gapText.includes('对比') || gapText.includes('替代')) {
    actions.push('整理常见技术方案的对比表（如 Redis vs Zookeeper 锁），考前快速回顾')
  }
  while (actions.length < 3 && actionPool.length) {
    const item = actionPool.splice(Math.floor(Math.random() * actionPool.length), 1)[0]
    if (!actions.includes(item)) actions.push(item)
  }

  // 总结：基于整体质量
  const avgQuality = answers.length
    ? Math.round(answers.reduce((s, a) => s + a.analysis.quality, 0) / answers.length)
    : 60
  let summary = ''
  if (avgQuality >= 82) {
    summary = '整体作答扎实，思路清晰且能结合项目实际展开；建议继续保持，并在表达精炼度上进一步打磨。'
  } else if (avgQuality >= 70) {
    summary = '基本能力在线，能命中题目核心；后续可在结构化表达与量化数据上继续加强。'
  } else if (avgQuality >= 55) {
    summary = '方向基本正确，但深度与展开不足；建议针对薄弱知识点做系统化复习，并练习结构化答题。'
  } else {
    summary = '本次作答整体偏弱，多个核心知识点未命中；建议先补基础再练表达，不要急于刷难题。'
  }

  return { strengths, weaknesses, actionPlan: actions.slice(0, 3), summary }
}

export async function completeInterview(): Promise<InterviewRecord> {
  await delay(900)
  if (!activeSession) throw new Error('会话不存在')
  const { config, questions, startedAt, id } = activeSession
  const total = questions.length
  const { dimensions, overall } = buildScores()
  const { strengths, weaknesses, actionPlan, summary } = buildReport()
  const durationMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000))

  const record: InterviewRecord = {
    id,
    position: config.position,
    mode: config.mode,
    difficulty: config.difficulty,
    questionCount: total,
    startedAt: formatNow(),
    durationMin,
    overallScore: overall,
    dimensions,
    strengths,
    weaknesses,
    actionPlan,
    summary
  }

  const history = read<InterviewRecord[]>(LS.history, [])
  history.unshift(record)
  write(LS.history, history)
  activeSession = null
  return record
}

export function isInterviewActive(): boolean {
  return !!activeSession
}

// ---------- 历史 / 报告 ----------

export async function getHistory(): Promise<InterviewRecord[]> {
  await delay(300)
  return read<InterviewRecord[]>(LS.history, [])
}

export async function getReport(sessionId: string): Promise<InterviewRecord | null> {
  await delay(300)
  const history = read<InterviewRecord[]>(LS.history, [])
  return history.find((r) => r.id === sessionId) ?? null
}
