<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '../stores/history'
import { DIFFICULTIES, MODES, POSITIONS, MODE_LABEL } from '../mock/data'
import { scoreColor } from '../utils/format'
import type { Difficulty, InterviewMode } from '../types'

const historyStore = useHistoryStore()
const router = useRouter()

const filter = reactive({
  position: 'all',
  mode: 'all' as InterviewMode | 'all',
  difficulty: 'all' as Difficulty | 'all'
})

const filtered = computed(() =>
  historyStore.records.filter((r) => {
    if (filter.position !== 'all' && r.position !== filter.position) return false
    if (filter.mode !== 'all' && r.mode !== filter.mode) return false
    if (filter.difficulty !== 'all' && r.difficulty !== filter.difficulty) return false
    return true
  })
)

function modeLabel(m: InterviewMode): string {
  return MODE_LABEL[m]
}

onMounted(() => {
  historyStore.fetchHistory()
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <div>
        <h1>历史记录</h1>
        <div class="sub">回看每一次面试，追踪你的成长轨迹。</div>
      </div>
      <div class="filters">
        <el-select v-model="filter.position" style="width: 130px">
          <el-option label="全部岗位" value="all" />
          <el-option v-for="p in POSITIONS" :key="p.value" :label="p.label" :value="p.label" />
        </el-select>
        <el-select v-model="filter.mode" style="width: 130px">
          <el-option label="全部模式" value="all" />
          <el-option v-for="m in MODES" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
        <el-select v-model="filter.difficulty" style="width: 120px">
          <el-option label="全部难度" value="all" />
          <el-option v-for="d in DIFFICULTIES" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </div>
    </div>

    <div class="card table-wrap">
      <el-table v-loading="historyStore.loading" :data="filtered" style="width: 100%">
        <el-table-column prop="startedAt" label="日期" min-width="150" />
        <el-table-column label="岗位" min-width="110">
          <template #default="{ row }">
            <span class="pos-chip">{{ row.position }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模式" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.mode === 'question-bank' ? 'primary' : 'info'" effect="light" round>
              {{ modeLabel(row.mode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="questionCount" label="题量" width="70" />
        <el-table-column label="时长" width="90">
          <template #default="{ row }">{{ row.durationMin }} 分</template>
        </el-table-column>
        <el-table-column label="得分" width="80">
          <template #default="{ row }">
            <span class="score-pill" :style="{ color: scoreColor(row.overallScore) }">
              {{ row.overallScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="router.push('/report/' + row.id)">
              查看报告
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无符合条件的面试记录" :image-size="80" />
        </template>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
}
.table-wrap {
  overflow: hidden;
}
.pos-chip {
  font-weight: 600;
}
.score-pill {
  font-weight: 800;
  font-size: 15px;
}
</style>
