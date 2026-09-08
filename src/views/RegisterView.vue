<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import AuthLayout from '../layouts/AuthLayout.vue'
import { useAuthStore } from '../stores/auth'
import { POSITIONS } from '../mock/data'

const auth = useAuthStore()
const router = useRouter()

const features = [
  { icon: '📝', title: '上传简历', desc: 'AI 解析结构化信息，按岗位定制提问' },
  { icon: '🎯', title: '岗位定向', desc: '技术 / 产品 / 运营 / 算法多方向' },
  { icon: '🔒', title: '隐私安全', desc: '简历本地加密存储，绝不外泄' }
]

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  email: '',
  position: '后端开发',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  position: [{ required: true, message: '请选择目标岗位', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少 8 位', trigger: 'blur' }
  ]
}

async function onSubmit(): Promise<void> {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await auth.register({ ...form })
    ElMessage.success('注册成功，开始你的面试进阶之路')
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    headline="开始你的<br/>面试进阶之路。"
    subtitle="注册即享完整面试闭环：简历 → 模拟面试 → 评分 → 复盘报告。"
    :features="features"
    foot="v1.0 · PC 端"
  >
    <h3>创建账号</h3>
    <div class="sub">30 秒完成注册</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="你的昵称" size="large" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="name@example.com" size="large" />
      </el-form-item>
      <el-form-item label="目标岗位" prop="position">
        <el-select v-model="form.position" size="large" class="w-full">
          <el-option v-for="p in POSITIONS" :key="p.value" :label="p.label" :value="p.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="至少 8 位" size="large" show-password />
      </el-form-item>
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="onSubmit">
        注 册
      </el-button>
    </el-form>

    <div class="switch">
      已有账号？
      <router-link to="/login">返回登录</router-link>
    </div>
  </AuthLayout>
</template>

<style scoped>
.w-full {
  width: 100%;
}
</style>
