<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as api from '../mock'
import { DIFFICULTIES, POSITIONS, QUESTION_TYPES, DIFFICULTY_LABEL, TYPE_LABEL, positionLabel } from '../mock/data'
import type { Difficulty, Question, QuestionType } from '../types'

const loading = ref(false)
const questions = ref<Question[]>([])

const filter = reactive({
  position: 'all',
  difficulty: '' as Difficulty | '',
  category: '' as QuestionType | '',
  keyword: ''
})

function difficultyTag(d: Difficulty): string {
  if (d === 'easy') return 'success'
  if (d === 'medium') return 'warning'
  return 'danger'
}

async function load(): Promise<void> {
  loading.value = true
  try {
    questions.value = await api.getQuestions({
      position: filter.position,
      difficulty: filter.difficulty,
      category: filter.category,
      keyword: filter.keyword
    })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="container">
    <div class="page-head">
      <div>
        <h1>题库浏览</h1>
        <div class="sub">按岗位、难度、类型探索面试题。</div>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filter.position" style="width: 140px" @change="load">
        <el-option label="全部岗位" value="all" />
        <el-option v-for="p in POSITIONS" :key="p.value" :label="p.label" :value="p.label" />
      </el-select>
      <el-select v-model="filter.difficulty" style="width: 130px" clearable placeholder="全部难度" @change="load">
        <el-option v-for="d in DIFFICULTIES" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
      <el-select v-model="filter.category" style="width: 140px" clearable placeholder="全部类型" @change="load">
        <el-option v-for="t in QUESTION_TYPES" :key="t.value" :label="t.label" :value="t.value" />
      </el-select>
      <el-input
        v-model="filter.keyword"
        style="width: 220px"
        placeholder="搜索题目 / 知识点"
        clearable
        :prefix-icon="Search"
        @keyup.enter="load"
        @clear="load"
      />
      <el-button type="primary" @click="load">搜索</el-button>
      <span class="spacer"></span>
      <el-tag effect="plain" round>共 {{ questions.length }} 题</el-tag>
    </div>

    <div v-loading="loading" class="q-grid">
      <div v-for="q in questions" :key="q.id" class="card q-card">
        <div class="q-t">{{ q.content }}</div>
        <div class="q-meta">
          <el-tag type="primary" effect="light" round>{{ positionLabel(q.positionTag) }}</el-tag>
          <el-tag :type="difficultyTag(q.difficulty)" effect="light" round>
            {{ DIFFICULTY_LABEL[q.difficulty] }}
          </el-tag>
          <el-tag effect="plain" round>{{ TYPE_LABEL[q.category] }}</el-tag>
        </div>
        <div class="q-ans">
          <b>参考答案：</b>{{ q.modelAnswer }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.spacer {
  flex: 1;
}
.q-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  min-height: 200px;
}
.q-card {
  padding: 18px;
}
.q-card .q-t {
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.5;
}
.q-card .q-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.q-card .q-ans {
  font-size: 13px;
  color: var(--text-2);
  background: var(--bg);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
}
</style>
