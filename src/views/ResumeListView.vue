<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResumeStore } from '../stores/resume'
import { positionLabel } from '../mock/data'

const resumeStore = useResumeStore()
const router = useRouter()

function formatLabel(f: 'markdown' | 'text'): string {
  return f === 'markdown' ? 'Markdown' : '纯文本'
}

function goEdit(id?: string): void {
  router.push(id ? { path: '/resume-edit', query: { id } } : '/resume-edit')
}

async function handleDelete(id: string, title: string): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除简历「${title}」吗？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  await resumeStore.removeResume(id)
  ElMessage.success('简历已删除')
}

onMounted(() => {
  resumeStore.fetchResumes()
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <div>
        <h1>简历管理</h1>
        <div class="sub">上传简历，AI 将基于它定制面试提问与评分。</div>
      </div>
      <el-button type="primary" @click="goEdit()">＋ 新建简历</el-button>
    </div>

    <div class="resume-grid">
      <div v-for="r in resumeStore.resumes" :key="r.id" class="card resume-card">
        <div class="ttl">{{ r.title }}</div>
        <div class="meta">
          <el-tag type="primary" effect="light" round>{{ positionLabel(r.positionTag) }}</el-tag>
          <el-tag effect="plain" round>{{ formatLabel(r.format) }}</el-tag>
        </div>
        <div class="desc">{{ r.summary }}</div>
        <div class="foot">
          <span class="time">更新于 {{ r.updatedAt }}</span>
          <span class="ops">
            <el-button size="small" @click="goEdit(r.id)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(r.id, r.title)">删除</el-button>
          </span>
        </div>
      </div>

      <button class="card resume-new" @click="goEdit()">
        <span class="plus">＋</span> 新建简历
      </button>
    </div>
  </div>
</template>

<style scoped>
.resume-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.resume-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: 0.15s;
}
.resume-card:hover {
  box-shadow: var(--shadow);
  border-color: var(--primary-300);
}
.resume-card .ttl {
  font-size: 15px;
  font-weight: 700;
}
.resume-card .meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.resume-card .desc {
  font-size: 13px;
  color: var(--text-2);
}
.resume-card .foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 6px;
}
.resume-card .time {
  font-size: 12px;
  color: var(--text-3);
}
.resume-card .ops {
  display: flex;
  gap: 6px;
}
.resume-new {
  border: 2px dashed var(--border-strong);
  background: transparent;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  gap: 10px;
  min-height: 170px;
  font-weight: 600;
  box-shadow: none;
  cursor: pointer;
  font-size: 14px;
  font-family: var(--font);
  display: flex;
}
.resume-new:hover {
  border-color: var(--primary-300);
  color: var(--primary-600);
  background: var(--primary-50);
}
.resume-new .plus {
  font-size: 30px;
  line-height: 1;
}
</style>
