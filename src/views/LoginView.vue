<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import AuthLayout from '../layouts/AuthLayout.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const features = [
  { icon: '💬', title: '真实场景模拟', desc: '题库抽题 / AI 动态追问，逐字流式输出' },
  { icon: '📊', title: '五维量化评分', desc: '准确性 · 逻辑 · 表达 · 应变 · 匹配' },
  { icon: '📋', title: '个性化复盘报告', desc: '优势 / 不足 / 可执行行动建议' }
]

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'demo@example.com', password: '123456' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function onSubmit(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    ElMessage.success('登录成功，欢迎回来')
    router.push((route.query.redirect as string) || '/dashboard')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    headline="在真实面试来临前，<br/>先和 AI 练一百次。"
    subtitle="多轮 AI 对话还原真实面试场景，结束后生成多维度评分与个性化复盘报告。"
    :features="features"
    foot="v1.0 · PC 端 · 技术岗 / 产品岗 / 运营岗"
  >
    <h3>欢迎回来 👋</h3>
    <div class="sub">登录后开始你的模拟面试</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
      <el-form-item label="用户名 / 邮箱" prop="username">
        <el-input v-model="form.username" placeholder="name@example.com" size="large" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" show-password />
      </el-form-item>
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="onSubmit">
        登 录
      </el-button>
    </el-form>

    <div class="hint-demo">演示账号已预填，直接点击「登录」即可体验。</div>

    <div class="switch">
      还没有账号？
      <router-link to="/register">立即注册</router-link>
    </div>
  </AuthLayout>
</template>

<style scoped>
.w-full {
  width: 100%;
}
.hint-demo {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
}
</style>
