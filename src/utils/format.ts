// 分数相关的展示工具函数

export function scoreColor(score: number): string {
  if (score >= 85) return 'var(--success)'
  if (score >= 75) return 'var(--primary-600)'
  if (score >= 65) return 'var(--warning)'
  return 'var(--danger)'
}

export function levelLabel(score: number): string {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '一般'
  if (score >= 60) return '及格'
  return '待提升'
}

export function starString(score: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(score / 20)))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

/** 评分维度短名（用于雷达图标签） */
export const DIMENSION_SHORT: Record<string, string> = {
  accuracy: '准确性',
  logic: '逻辑性',
  expression: '表达力',
  adaptability: '应变力',
  match: '匹配度'
}
