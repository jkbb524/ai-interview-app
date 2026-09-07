<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useHistoryStore } from '../stores/history'
import { useResumeStore } from '../stores/resume'
import { DIFFICULTIES, MODES, POSITIONS, MODE_LABEL } from '../mock/data'
import type { Difficulty, InterviewMode } from '../types'
import TrendChart from '../components/TrendChart.vue'
import { scoreColor } from '../utils/format'

const auth = useAuthStore()
const historyStore = useHistoryStore()
const resumeStore = useResumeStore()
const router = useRouter()

const setupVisible = ref(false)
const setup = reactive({
  mode: 'question-bank' as InterviewMode,
  position: '后端开发',
  difficulty: 'medium' as Difficulty,
  totalQuestions: 10
})

const posColors: Record<string, string> = {
  后端开发: '#10b981',
  前端开发: '#6366f1',
  算法: '#f59e0b',
  系统设计: '#8b5cf6',
  行为面试: '#ef4444',
  产品经理: '#06b6d4',
  运营: '#f97316',
  数据分析: '#14b8a6'
}

const stats = computed(() => {
  const records = historyStore.records
  const count = records.length
  const avg = count ? records.reduce((s, r) => s + r.overallScore, 0) / count : 0
  const max = count ? Math.max(...records.map((r) => r.overallScore)) : 0
  return { count, avg: avg.toFixed(1), max }
})

const recentRecords = computed(() => historyStore.records.slice(0, 3))

const trendValues = computed(() =>
  [...historyStore.records].reverse().map((r) => r.overallScore)
)

const weakPoint = computed(() => historyStore.records[0]?.weaknesses[0] ?? '')

function posColor(pos: string): string {
  return posColors[pos] ?? '#6366f1'
}

function openSetup(mode?: InterviewMode): void {
  if (mode) setup.mode = mode
  setupVisible.value = true
}

function startInterview(): void {
  setupVisible.value = false
  router.push({
    path: '/interview',
    query: {
      mode: setup.mode,
      position: setup.position,
      difficulty: setup.difficulty,
      count: String(setup.totalQuestions)
    }
  })
}

onMounted(() => {
  historyStore.fetchHistory()
  resumeStore.fetchResumes()
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <div>
        <h1>你好，{{ auth.user?.username }} 👋</h1>
        <div class="sub">今天也来一次模拟面试吧，保持手感。</div>
      </div>
      <el-button type="primary" size="large" @click="openSetup()">＋ 开始模拟面试</el-button>
    </div>

    <div class="stat-grid">
      <div class="card stat">
        <span class="ic" style="background: var(--primary-50)">💬</span>
        <span class="label">累计面试</span>
        <span class="value">{{ stats.count }}</span>
        <span class="delta up">▲ 持续积累中</span>
      </div>
      <div class="card stat">
        <span class="ic" style="background: var(--success-bg)">⭐</span>
        <span class="label">平均得分</span>
        <span class="value">{{ stats.avg }}</span>
        <span class="delta up">▲ 稳步提升</span>
      </div>
      <div class="card stat">
        <span class="ic" style="background: var(--warning-bg)">📈</span>
        <span class="label">最高得分</span>
        <span class="value">{{ stats.max }}</span>
        <span class="delta">历史最佳</span>
      </div>
      <div class="card stat">
        <span class="ic" style="background: #f0f1f6">📝</span>
        <span class="label">我的简历</span>
        <span class="value">{{ resumeStore.resumes.length }}</span>
        <span class="delta">可用于定制面试</span>
      </div>
    </div>

    <div class="quick-actions">
      <div class="card qa" @click="openSetup('question-bank')">
        <span class="ic" style="background: var(--primary-50)">🎯</span>
        <div>
          <b>题库抽题模式</b>
          <span>按岗位 / 难度随机抽题，逐题练习</span>
        </div>
      </div>
      <div class="card qa" @click="openSetup('dynamic-ai')">
        <span class="ic" style="background: #f5f3ff">🧠</span>
        <div>
          <b>AI 动态追问</b>
          <span>AI 基于简历与岗位实时生成追问链</span>
        </div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="card dash-card">
        <div class="card-title">
          最近面试
          <router-link to="/history">查看全部 →</router-link>
        </div>
        <template v-if="recentRecords.length">
          <div v-for="r in recentRecords" :key="r.id" class="row-item">
            <span class="avatar" :style="{ background: posColor(r.position) }">
              {{ r.position.charAt(0) }}
            </span>
            <div class="grow">
              <div class="t">{{ r.position }} · {{ MODE_LABEL[r.mode] }}</div>
              <div class="s">{{ r.startedAt }} · {{ r.questionCount }} 题 · {{ r.durationMin }} 分钟</div>
            </div>
            <span class="score-pill" :style="{ color: scoreColor(r.overallScore) }">
              {{ r.overallScore }}
            </span>
          </div>
        </template>
        <el-empty v-else description="还没有面试记录" :image-size="80" />
      </div>

      <div class="card dash-card">
        <div class="card-title">能力趋势</div>
        <TrendChart :values="trendValues" :height="120" />
        <div class="row-item weak">
          <div class="grow">
            <div class="t">薄弱项提醒</div>
            <div class="s">{{ weakPoint || '完成一次面试后即可获得针对性建议' }}</div>
          </div>
          <el-button size="small" type="primary" plain @click="router.push('/questions')">去练习</el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="setupVisible" title="开始模拟面试" width="520px" align-center>
      <el-form label-position="left" label-width="88px">
        <el-form-item label="面试模式">
          <el-radio-group v-model="setup.mode">
            <el-radio-button v-for="m in MODES" :key="m.value" :value="m.value">
              {{ m.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标岗位">
          <el-select v-model="setup.position" class="w-full">
            <el-option v-for="p in POSITIONS" :key="p.value" :label="p.label" :value="p.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="setup.difficulty" class="w-full">
            <el-option v-for="d in DIFFICULTIES" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目数量">
          <el-input-number v-model="setup.totalQuestions" :min="3" :max="15" />
          <span class="count-hint">建议 5 - 10 题</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="setupVisible = false">取消</el-button>
        <el-button type="primary" @click="startInterview">开始面试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}
.stat {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat .label {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 500;
}
.stat .value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.stat .delta {
  font-size: 12px;
  color: var(--text-3);
}
.stat .delta.up {
  color: var(--success);
}
.stat .ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  font-size: 18px;
}
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
}
.qa {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
  cursor: pointer;
  transition: 0.15s;
}
.qa:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow);
}
.qa .ic {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.qa b {
  display: block;
  font-size: 15px;
}
.qa span {
  font-size: 12px;
  color: var(--text-3);
}
.dash-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
}
.dash-card {
  padding: 20px;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title a {
  font-size: 13px;
  color: var(--primary-600);
  font-weight: 600;
}
.row-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
}
.row-item:last-child {
  border-bottom: none;
}
.row-item .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.row-item .grow {
  flex: 1;
  min-width: 0;
}
.row-item .t {
  font-weight: 600;
  font-size: 14px;
}
.row-item .s {
  font-size: 12px;
  color: var(--text-3);
}
.score-pill {
  font-weight: 800;
  font-size: 15px;
}
.row-item.weak {
  margin-top: 16px;
  border-top: 1px solid var(--border);
}
.w-full {
  width: 100%;
}
.count-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--text-3);
}
</style>
