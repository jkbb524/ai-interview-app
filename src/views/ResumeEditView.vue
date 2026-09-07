<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '../stores/resume'
import { POSITIONS, positionLabel } from '../mock/data'

const resumeStore = useResumeStore()
const route = useRoute()
const router = useRouter()

const editId = computed(() => (route.query.id as string) || '')
const isEdit = computed(() => !!editId.value)

const saving = ref(false)
const parsing = ref(false)
const parsedFlag = ref(false)
const fileInput = ref<HTMLInputElement>()

const form = reactive({
  title: '',
  position: '后端开发',
  content: ''
})
const parsed = reactive({
  education: '',
  workExperience: '',
  skills: '',
  projects: ''
})

const SKILL_KEYWORDS = [
  'Java', 'Spring', 'Redis', 'MySQL', 'Kafka', 'Vue', 'React', 'TypeScript',
  'Python', 'Go', 'Node', 'Docker', 'K8s', '分布式', '消息队列', 'Spark', 'Flink'
]

function mockParse(content: string): void {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean)
  const find = (re: RegExp) => lines.find((l) => re.test(l))
  const skills = SKILL_KEYWORDS.filter((k) => content.includes(k))
  parsed.education = find(/大学|本科|硕士|学院|毕业/) ?? '未识别到教育经历'
  parsed.workExperience = find(/公司|工作|实习|任职|工程师/) ?? '未识别到工作经历'
  parsed.projects = find(/项目|重构|系统|平台|负责/) ?? '未识别到项目经历'
  parsed.skills = skills.length ? skills.join(', ') : '未识别到技能标签'
}

async function handleParse(): Promise<void> {
  if (!form.content.trim()) {
    ElMessage.warning('请先填写简历内容')
    return
  }
  parsing.value = true
  await new Promise((r) => setTimeout(r, 800))
  mockParse(form.content)
  parsedFlag.value = true
  parsing.value = false
  ElMessage.success('AI 解析完成')
}

function handleImport(): void {
  fileInput.value?.click()
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.content = String(reader.result ?? '')
    if (!form.title) form.title = file.name.replace(/\.(md|txt|markdown)$/i, '')
    ElMessage.success('文件已导入')
  }
  reader.readAsText(file)
  input.value = ''
}

async function handleSave(): Promise<void> {
  if (!form.title.trim()) {
    ElMessage.warning('请填写简历标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请填写简历内容')
    return
  }
  saving.value = true
  const payload = {
    title: form.title,
    positionTag: POSITIONS.find((p) => p.label === form.position)?.value ?? 'general',
    format: (form.content.trim().startsWith('#') ? 'markdown' : 'text') as 'markdown' | 'text',
    content: form.content,
    parsed: { ...parsed },
    summary: `${parsed.skills.split(',')[0] ?? '未分类'} 等技能`
  }
  try {
    if (isEdit.value) {
      await resumeStore.updateResume(editId.value, payload)
      ElMessage.success('简历已更新')
    } else {
      await resumeStore.createResume(payload)
      ElMessage.success('简历已保存')
    }
    router.push('/resumes')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await resumeStore.fetchResumes()
  if (isEdit.value) {
    const target = resumeStore.resumes.find((r) => r.id === editId.value)
    if (target) {
      form.title = target.title
      form.position = positionLabel(target.positionTag)
      form.content = target.content
      Object.assign(parsed, target.parsed)
      parsedFlag.value = true
    }
  }
})
</script>

<template>
  <div class="container narrow">
    <div class="page-head">
      <div>
        <h1>{{ isEdit ? '编辑简历' : '新建简历' }}</h1>
        <div class="sub">粘贴 Markdown / 纯文本，点击「AI 解析」自动提取结构化信息。</div>
      </div>
      <div class="head-ops">
        <el-button @click="router.push('/resumes')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存简历</el-button>
      </div>
    </div>

    <div class="card block">
      <el-form label-position="top">
        <el-form-item label="简历标题">
          <el-input v-model="form.title" placeholder="例如：后端开发工程师简历" />
        </el-form-item>
        <el-form-item label="目标岗位">
          <el-select v-model="form.position" class="w-full">
            <el-option v-for="p in POSITIONS" :key="p.value" :label="p.label" :value="p.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="简历内容（Markdown / 纯文本）">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="# 张三&#10;3 年 Java 后端开发经验，熟悉 Redis、分布式..."
          />
          <div class="hint">AI 将解析教育经历、工作经历、技能、项目等内容。</div>
        </el-form-item>
      </el-form>
      <div class="parse-ops">
        <el-button :loading="parsing" @click="handleParse">✨ AI 解析</el-button>
        <el-button @click="handleImport">从文件导入</el-button>
        <input ref="fileInput" type="file" accept=".md,.txt,.markdown" hidden @change="onFileChange" />
      </div>
    </div>

    <div class="card block">
      <div class="parse-head">
        结构化解析结果
        <el-tag v-if="parsedFlag" type="success" effect="light" round>已解析</el-tag>
        <el-tag v-else effect="plain" round>待解析</el-tag>
      </div>
      <el-form label-position="top">
        <el-form-item label="教育经历">
          <el-input v-model="parsed.education" placeholder="点击「AI 解析」自动生成" />
        </el-form-item>
        <el-form-item label="工作经历">
          <el-input v-model="parsed.workExperience" placeholder="点击「AI 解析」自动生成" />
        </el-form-item>
        <el-form-item label="技能标签">
          <el-input v-model="parsed.skills" placeholder="点击「AI 解析」自动生成" />
        </el-form-item>
        <el-form-item label="项目经历">
          <el-input v-model="parsed.projects" type="textarea" :rows="3" placeholder="点击「AI 解析」自动生成" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.container.narrow {
  max-width: 900px;
}
.head-ops {
  display: flex;
  gap: 10px;
}
.block {
  padding: 24px;
  margin-bottom: 16px;
}
.hint {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 4px;
}
.parse-ops {
  display: flex;
  gap: 10px;
}
.parse-head {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.w-full {
  width: 100%;
}
</style>
