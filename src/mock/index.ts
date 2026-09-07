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
  SUMMARY_POOL,
  WEAKNESS_POOL
} from './data'

const LS = {
  token: 'ai-interview:token',
  user: 'ai-interview:user',
  resumes: 'ai-interview:resumes',
  history: 'ai-interview:history'
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

export async function login(username: string, _password: string): Promise<User> {
  await delay(500)
  const name = username || DEMO_USER.username
  const user: User = {
    username: name.includes('@') ? '林晓雨' : name,
    email: name.includes('@') ? name : DEMO_USER.email,
    position: DEMO_USER.position
  }
  write(LS.token, uid('token'))
  write(LS.user, user)
  ensureSeed()
  return user
}

export async function register(payload: {
  username: string
  email: string
  position: string
  password: string
}): Promise<User> {
  await delay(500)
  const user: User = {
    username: payload.username,
    email: payload.email,
    position: payload.position
  }
  write(LS.token, uid('token'))
  write(LS.user, user)
  ensureSeed()
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

interface ActiveSession {
  id: string
  config: InterviewConfig
  questions: Question[]
  answers: { question: Question; answer: string }[]
  startedAt: number
}

let activeSession: ActiveSession | null = null

const OPENINGS = [
  '好的，了解了。',
  '不错，思路很清晰。',
  '明白了，我们继续。',
  '嗯，记下了。',
  '可以，回答得不错。'
]

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
  const greeting = `你好，欢迎参加本次「${config.position}」模拟面试。本次共 ${config.totalQuestions} 题，难度为${diff}。我们先从第 1 题开始：`
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
  activeSession.answers.push({
    question: activeSession.questions[activeSession.answers.length] ?? activeSession.questions[0],
    answer
  })

  const nextIndex = activeSession.answers.length
  if (nextIndex < activeSession.questions.length) {
    const question = activeSession.questions[nextIndex]
    const ack = OPENINGS[Math.floor(Math.random() * OPENINGS.length)]
    const reply = `${ack} 我们来看第 ${nextIndex + 1} 题：${question.content}`
    return { reply, question, isComplete: false, currentIndex: nextIndex }
  }
  return { reply: CLOSING, question: null, isComplete: true, currentIndex: nextIndex }
}

function buildScores(answered: number, total: number): { dimensions: ScoreDimension[]; overall: number } {
  const completion = total > 0 ? answered / total : 1
  const base = 76 + Math.random() * 12
  const jitter = () => Math.round((Math.random() - 0.5) * 8)
  const dims: ScoreDimension[] = [
    { key: 'accuracy', name: '内容准确性', weight: 0.3, score: clamp(Math.round(base + jitter())) },
    { key: 'logic', name: '逻辑结构', weight: 0.25, score: clamp(Math.round(base + jitter())) },
    { key: 'expression', name: '表达清晰度', weight: 0.2, score: clamp(Math.round(base + jitter())) },
    { key: 'adaptability', name: '追问应对', weight: 0.15, score: clamp(Math.round(base + jitter())) },
    { key: 'match', name: '岗位匹配度', weight: 0.1, score: clamp(Math.round(base + jitter())) }
  ]
  if (completion < 1) {
    dims.forEach((d) => {
      d.score = clamp(Math.round(d.score * (0.7 + 0.3 * completion)))
    })
  }
  const overall = Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0))
  return { dimensions: dims, overall }
}

export async function completeInterview(): Promise<InterviewRecord> {
  await delay(900)
  if (!activeSession) throw new Error('会话不存在')
  const { config, questions, answers, startedAt, id } = activeSession
  const answered = answers.length
  const total = questions.length
  const { dimensions, overall } = buildScores(answered, total)
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
    strengths: pick(STRENGTH_POOL, 3),
    weaknesses: pick(WEAKNESS_POOL, 2),
    actionPlan: pick(ACTION_POOL, 3),
    summary: SUMMARY_POOL[Math.floor(Math.random() * SUMMARY_POOL.length)]
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
