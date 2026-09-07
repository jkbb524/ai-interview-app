<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHistoryStore } from '../stores/history'
import { DIFFICULTY_LABEL, MODE_LABEL } from '../mock/data'
import { DIMENSION_SHORT, levelLabel, starString } from '../utils/format'
import type { InterviewRecord } from '../types'
import ScoreRing from '../components/ScoreRing.vue'
import RadarChart from '../components/RadarChart.vue'

const historyStore = useHistoryStore()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const record = ref<InterviewRecord | null>(null)

const radarData = computed(() =>
  (record.value?.dimensions ?? []).map((d) => ({
    name: DIMENSION_SHORT[d.key] ?? d.name,
    score: d.score
  }))
)

const topDim = computed(() =>
  [...(record.value?.dimensions ?? [])].sort((a, b) => b.score - a.score)[0]
)
const lowDim = computed(() =>
  [...(record.value?.dimensions ?? [])].sort((a, b) => a.score - b.score)[0]
)

onMounted(async () => {
  const id = route.params.sessionId as string
  await historyStore.fetchHistory()
  record.value = historyStore.getById(id) ?? (await historyStore.fetchReport(id))
  loading.value = false
})
</script>

<template>
  <div class="container narrow">
    <div class="page-head">
      <div>
        <h1>复盘报告</h1>
        <div class="sub" v-if="record">
          {{ record.position }} · {{ MODE_LABEL[record.mode] }} · {{ record.startedAt }} ·
          {{ record.questionCount }} 题 · {{ DIFFICULTY_LABEL[record.difficulty] }}
        </div>
      </div>
      <el-button @click="router.push('/history')">← 返回历史</el-button>
    </div>

    <div v-loading="loading">
      <template v-if="record">
        <div class="card report-hero">
          <ScoreRing :score="record.overallScore" />
          <div class="info">
            <h2>总体表现：{{ levelLabel(record.overallScore) }}</h2>
            <div class="stars">{{ starString(record.overallScore) }}</div>
            <div class="meta">
              <el-tag type="success" effect="light" round>✅ {{ levelLabel(record.overallScore) }}</el-tag>
              <el-tag type="primary" effect="light" round v-if="topDim">
                ⚡ {{ topDim.name }} {{ topDim.score }}
              </el-tag>
              <el-tag type="warning" effect="light" round v-if="lowDim">
                ⚠ {{ lowDim.name }} {{ lowDim.score }}
              </el-tag>
            </div>
            <p class="summary">{{ record.summary }}</p>
          </div>
        </div>

        <div class="report-grid">
          <div class="card r-card">
            <div class="card-title">各维度得分</div>
            <RadarChart :data="radarData" />
          </div>

          <div class="card r-card">
            <div class="card-title">维度明细</div>
            <div v-for="d in record.dimensions" :key="d.key" class="dim-row">
              <span class="dname">{{ d.name }}</span>
              <div class="bar">
                <i :style="{ width: d.score + '%' }"></i>
              </div>
              <span class="dval">{{ d.score }}</span>
            </div>
            <div class="weight-note">各维度按权重加权得出总分（准确性 30% · 逻辑 25% · 表达 20% · 应变 15% · 匹配 10%）</div>
          </div>

          <div class="card r-card">
            <div class="card-title">你的优势</div>
            <ul class="bullet-list">
              <li v-for="s in record.strengths" :key="s">
                <span class="dot" style="background: var(--success-bg)">✅</span>{{ s }}
              </li>
            </ul>
          </div>

          <div class="card r-card">
            <div class="card-title">需要改进</div>
            <ul class="bullet-list">
              <li v-for="w in record.weaknesses" :key="w">
                <span class="dot" style="background: var(--warning-bg)">⚠️</span>{{ w }}
              </li>
            </ul>
            <div class="card-title plan-title">行动建议</div>
            <ul class="plan-list">
              <li v-for="a in record.actionPlan" :key="a">{{ a }}</li>
            </ul>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="未找到该复盘报告" :image-size="120">
        <el-button type="primary" @click="router.push('/history')">返回历史记录</el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped>
.container.narrow {
  max-width: 920px;
}
.report-hero {
  padding: 28px;
  display: flex;
  gap: 28px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.report-hero .info {
  flex: 1;
  min-width: 260px;
}
.report-hero .info h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
}
.stars {
  color: #f59e0b;
  font-size: 18px;
  letter-spacing: 2px;
}
.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 10px 0 12px;
}
.summary {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.7;
}
.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.r-card {
  padding: 20px;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
}
.dim-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.dim-row .dname {
  width: 74px;
  font-size: 13px;
  color: var(--text-2);
  font-weight: 600;
  flex-shrink: 0;
}
.dim-row .bar {
  flex: 1;
  height: 9px;
  border-radius: 99px;
  background: #eef0f7;
  overflow: hidden;
}
.dim-row .bar i {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
}
.dim-row .dval {
  width: 32px;
  text-align: right;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.weight-note {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 6px;
}
.bullet-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bullet-list li {
  display: flex;
  gap: 10px;
  font-size: 14px;
  line-height: 1.55;
  align-items: flex-start;
}
.bullet-list .dot {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.plan-title {
  margin-top: 20px;
}
.plan-list {
  counter-reset: plan;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.plan-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.55;
}
.plan-list li::before {
  counter-increment: plan;
  content: counter(plan);
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--primary-50);
  color: var(--primary-600);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
