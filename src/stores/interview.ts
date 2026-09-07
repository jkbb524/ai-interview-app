import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ChatMessage, InterviewConfig, InterviewRecord, Question } from '../types'
import * as api from '../mock'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const useInterviewStore = defineStore('interview', () => {
  const sessionId = ref('')
  const config = ref<InterviewConfig | null>(null)
  const messages = ref<ChatMessage[]>([])
  const currentQuestion = ref<Question | null>(null)
  const currentIndex = ref(0)
  const totalQuestions = ref(0)
  const status = ref<'idle' | 'active' | 'completed'>('idle')
  const busy = ref(false)
  const finished = ref(false)
  const lastRecord = ref<InterviewRecord | null>(null)

  const progress = computed(() =>
    totalQuestions.value ? Math.round((currentIndex.value / totalQuestions.value) * 100) : 0
  )

  /** 逐字输出 AI 消息，模拟 SSE 流式渲染 */
  async function typeOut(text: string): Promise<void> {
    messages.value.push({ id: uid(), role: 'ai', content: '' })
    const idx = messages.value.length - 1
    for (let i = 0; i < text.length; i++) {
      const target = messages.value[idx]
      // 会话被 reset 时中断输出，避免越界
      if (!target) return
      target.content += text[i]
      if (i % 2 === 0) await sleep(12)
    }
  }

  function reset(): void {
    sessionId.value = ''
    config.value = null
    messages.value = []
    currentQuestion.value = null
    currentIndex.value = 0
    totalQuestions.value = 0
    status.value = 'idle'
    busy.value = false
    finished.value = false
    lastRecord.value = null
  }

  async function start(cfg: InterviewConfig): Promise<void> {
    reset()
    status.value = 'active'
    busy.value = true
    const res = await api.startInterview(cfg)
    sessionId.value = res.sessionId
    config.value = cfg
    totalQuestions.value = res.totalQuestions
    currentIndex.value = res.currentIndex
    currentQuestion.value = res.question
    messages.value.push({ id: uid(), role: 'ai', content: res.greeting })
    await typeOut(res.question.content)
    busy.value = false
  }

  async function send(text: string): Promise<void> {
    if (busy.value || status.value !== 'active') return
    const content = text.trim()
    if (!content) return
    busy.value = true
    messages.value.push({ id: uid(), role: 'user', content })
    const res = await api.sendAnswer(content)
    await typeOut(res.reply)
    if (res.question) {
      currentQuestion.value = res.question
      currentIndex.value = res.currentIndex
    }
    if (res.isComplete) {
      finished.value = true
    }
    busy.value = false
  }

  async function complete(): Promise<InterviewRecord> {
    busy.value = true
    const record = await api.completeInterview()
    lastRecord.value = record
    status.value = 'completed'
    busy.value = false
    return record
  }

  return {
    sessionId,
    config,
    messages,
    currentQuestion,
    currentIndex,
    totalQuestions,
    status,
    busy,
    finished,
    lastRecord,
    progress,
    start,
    send,
    complete,
    reset
  }
})
