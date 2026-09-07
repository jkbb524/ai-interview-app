// ============================================================
// 全局类型定义
// 对应 PRD 第 3 章各模块的数据模型
// ============================================================

export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType = 'tech' | 'behavioral' | 'system-design' | 'coding'

export type InterviewMode = 'question-bank' | 'dynamic-ai'

export type ChatRole = 'ai' | 'user' | 'system'

/** 题库题目（PRD 3.3） */
export interface Question {
  id: string
  category: QuestionType
  positionTag: string
  difficulty: Difficulty
  tags: string[]
  content: string
  modelAnswer: string
}

/** 简历（PRD 3.2） */
export interface Resume {
  id: string
  title: string
  positionTag: string
  format: 'markdown' | 'text'
  content: string
  parsed: {
    education: string
    workExperience: string
    skills: string
    projects: string
  }
  summary: string
  updatedAt: string
}

/** 对话消息（PRD 3.4 DialogueTurn） */
export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

/** 面试配置（PRD 3.4） */
export interface InterviewConfig {
  mode: InterviewMode
  position: string
  difficulty: Difficulty
  totalQuestions: number
}

/** 评分维度（PRD 3.5） */
export interface ScoreDimension {
  key: string
  name: string
  score: number
  weight: number
}

/** 历史面试记录 / 复盘报告（PRD 3.5 + 3.6） */
export interface InterviewRecord {
  id: string
  position: string
  mode: InterviewMode
  difficulty: Difficulty
  questionCount: number
  startedAt: string
  durationMin: number
  overallScore: number
  dimensions: ScoreDimension[]
  strengths: string[]
  weaknesses: string[]
  actionPlan: string[]
  summary: string
}

/** 当前用户 */
export interface User {
  username: string
  email: string
  position: string
}
