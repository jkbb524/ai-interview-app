<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useInterviewStore } from '../stores/interview'
import { DIFFICULTY_LABEL, MODE_LABEL, TYPE_LABEL, positionLabel } from '../mock/data'
import type { Difficulty, InterviewMode } from '../types'

const store = useInterviewStore()
const route = useRoute()
const router = useRouter()

const inputText = ref('')
const chatScroll = ref<HTMLElement>()
const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const timerText = computed(() => {
  const m = String(Math.floor(elapsed.value / 60)).padStart(2, '0')
  const s = String(elapsed.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

const questionNo = computed(() => {
  if (store.finished) return store.totalQuestions
  return store.currentIndex + 1
})

const isThinking = computed(
  () => store.busy && store.messages[store.messages.length - 1]?.role === 'user'
)

function scrollBottom(): void {
  nextTick(() => {
    if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight
  })
}

watch(() => store.messages.length, scrollBottom)

async function send(): Promise<void> {
  const text = inputText.value
  inputText.value = ''
  await store.send(text)
  scrollBottom()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    void send()
  }
}

async function endInterview(): Promise<void> {
  try {
    await ElMessageBox.confirm('确定结束本次面试并生成复盘报告吗？', '结束面试', {
      confirmButtonText: '生成报告',
      cancelButtonText: '继续作答',
      type: 'warning'
    })
  } catch {
    return
  }
  const record = await store.complete()
  ElMessage.success('报告生成完成')
  router.push(`/report/${record.id}`)
}

onMounted(async () => {
  const cfg = {
    mode: (route.query.mode as InterviewMode) || 'question-bank',
    position: (route.query.position as string) || '后端开发',
    difficulty: (route.query.difficulty as Difficulty) || 'medium',
    totalQuestions: Number(route.query.count) || 10
  }
  await store.start(cfg)
  scrollBottom()
  timer = setInterval(() => {
    elapsed.value += 1
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="interview-shell">
    <header class="interview-top">
      <router-link class="brand" to="/dashboard">
        <span class="logo logo-block">AI</span>
        <span>AI 模拟面试</span>
      </router-link>
      <el-tag type="primary" effect="light" round>{{ store.config?.position }}</el-tag>
      <el-tag effect="plain" round>
        {{ store.config ? MODE_LABEL[store.config.mode] : '' }} ·
        {{ store.config ? DIFFICULTY_LABEL[store.config.difficulty] : '' }}
      </el-tag>
      <span class="sep"></span>
      <div class="timer">⏱ {{ timerText }}</div>
    </header>

    <div class="interview-body">
      <div class="chat-col">
        <div ref="chatScroll" class="chat-scroll">
          <div class="chat-inner">
            <div
              v-for="m in store.messages"
              :key="m.id"
              class="msg"
              :class="m.role === 'user' ? 'user' : 'ai'"
            >
              <span class="avatar" :class="{ green: m.role === 'user' }">
                {{ m.role === 'user' ? '我' : 'AI' }}
              </span>
              <div class="bubble">
                <span class="who">{{ m.role === 'user' ? '候选人' : 'AI 面试官' }}</span>
                <span class="txt">{{ m.content }}</span>
              </div>
            </div>

            <div v-if="isThinking" class="msg ai">
              <span class="avatar">AI</span>
              <div class="bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="inner">
            <textarea
              v-model="inputText"
              rows="1"
              placeholder="输入你的回答，Enter 发送…"
              :disabled="store.busy || store.finished"
              @keydown="onKeydown"
            ></textarea>
            <button class="send-btn" :disabled="store.busy || store.finished" @click="send">➤</button>
          </div>
          <div class="hint">AI 流式回复 · 按 Enter 发送 · Shift+Enter 换行</div>
        </div>
      </div>

      <aside class="side-col">
        <div class="side-card">
          <h4>面试进度</h4>
          <div class="q-count">#{{ questionNo }} <small>/ {{ store.totalQuestions }} 题</small></div>
          <div class="progress-label">
            <span>整体进度</span>
            <span>{{ store.progress }}%</span>
          </div>
          <div class="progress">
            <div class="bar" :style="{ width: store.progress + '%' }"></div>
          </div>
        </div>

        <div class="side-card" v-if="store.currentQuestion">
          <h4>当前题目</h4>
          <div class="kv"><span class="k">知识点</span><span class="v">{{ store.currentQuestion.tags.join(' / ') }}</span></div>
          <div class="kv"><span class="k">难度</span><span class="v">{{ DIFFICULTY_LABEL[store.currentQuestion.difficulty] }}</span></div>
          <div class="kv"><span class="k">类型</span><span class="v">{{ TYPE_LABEL[store.currentQuestion.category] }}</span></div>
          <div class="kv"><span class="k">岗位</span><span class="v">{{ positionLabel(store.currentQuestion.positionTag) }}</span></div>
        </div>

        <el-button type="danger" size="large" class="w-full" :loading="store.busy" @click="endInterview">
          {{ store.finished ? '生成复盘报告' : '结束面试并生成报告' }}
        </el-button>
        <div class="end-hint">结束后将触发 AI 多维评分</div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.interview-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
}
.interview-top {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
}
.interview-top .brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.2px;
  margin-right: 8px;
}
.interview-top .brand .logo {
  width: 28px;
  height: 28px;
  font-size: 13px;
  border-radius: 8px;
}
.interview-top .sep {
  flex: 1;
}
.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 15px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--warning-bg);
  color: var(--warning);
}
.interview-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  overflow: hidden;
}
.chat-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px;
}
.chat-inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.msg {
  display: flex;
  gap: 12px;
  max-width: 88%;
}
.msg .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.msg .avatar.green {
  background: #10b981;
}
.msg .bubble {
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.7;
  box-shadow: var(--shadow-sm);
  min-width: 0;
}
.msg .bubble .who {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  margin-bottom: 3px;
  display: block;
}
.msg.ai {
  align-self: flex-start;
}
.msg.ai .bubble {
  background: #fff;
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
}
.msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.msg.user .bubble {
  background: var(--primary);
  color: #fff;
  border-top-right-radius: 4px;
}
.msg.user .bubble .who {
  color: rgba(255, 255, 255, 0.6);
}
.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  min-height: 40px;
}
.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-3);
  animation: blink 1.2s infinite;
}
.typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%,
  60%,
  100% {
    opacity: 0.25;
  }
  30% {
    opacity: 1;
  }
}
.chat-input {
  flex-shrink: 0;
  border-top: 1px solid var(--border);
  background: #fff;
  padding: 14px 32px 18px;
}
.chat-input .inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.chat-input textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  font-size: 14px;
  font-family: var(--font);
  resize: none;
  height: 46px;
  max-height: 140px;
  outline: none;
  line-height: 1.5;
}
.chat-input textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-50);
}
.send-btn {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--primary);
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
}
.send-btn:hover:not(:disabled) {
  background: var(--primary-600);
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.chat-input .hint {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 8px;
  text-align: center;
}
.side-col {
  border-left: 1px solid var(--border);
  background: #fff;
  padding: 22px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.side-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.side-card h4 {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.q-count {
  font-size: 26px;
  font-weight: 800;
}
.q-count small {
  font-size: 14px;
  color: var(--text-3);
  font-weight: 600;
}
.kv {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 5px 0;
  gap: 12px;
}
.kv .k {
  color: var(--text-2);
  flex-shrink: 0;
}
.kv .v {
  font-weight: 600;
  text-align: right;
}
.progress {
  height: 8px;
  border-radius: 99px;
  background: var(--primary-100);
  overflow: hidden;
}
.progress .bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
  border-radius: 99px;
  transition: 0.4s;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 6px;
}
.end-hint {
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
}
.w-full {
  width: 100%;
}
</style>
