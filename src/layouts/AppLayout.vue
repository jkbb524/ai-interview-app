<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const initial = computed(() => (auth.user?.username ?? '用').charAt(0))
const roleText = computed(() => `求职者 · ${auth.user?.position ?? '未设置'}`)

const navs = [
  { path: '/dashboard', label: '仪表盘' },
  { path: '/resumes', label: '简历管理' },
  { path: '/history', label: '历史记录' },
  { path: '/questions', label: '题库浏览' }
]

function handleCommand(command: string) {
  if (command === 'logout') {
    auth.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <router-link class="brand" to="/dashboard">
        <span class="logo logo-block">AI</span>
        <span class="brand-name">AI 模拟面试</span>
      </router-link>

      <nav class="nav">
        <router-link v-for="n in navs" :key="n.path" :to="n.path" class="nav-link">
          {{ n.label }}
        </router-link>
      </nav>

      <div class="topbar-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-chip">
            <span class="avatar">{{ initial }}</span>
            <div class="user-meta">
              <div class="name">{{ auth.user?.username }}</div>
              <div class="role">{{ roleText }}</div>
            </div>
            <el-icon class="caret"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 64px;
  padding: 0 28px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.2px;
}
.brand .logo {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  font-size: 15px;
}
.nav {
  display: flex;
  gap: 4px;
}
.nav-link {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-2);
  transition: 0.15s;
}
.nav-link:hover {
  background: #f1f2f8;
  color: var(--text);
}
.nav-link.router-link-active {
  background: var(--primary-50);
  color: var(--primary-600);
  font-weight: 600;
}
.topbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 10px;
  transition: 0.15s;
}
.user-chip:hover {
  background: #f1f2f8;
}
.user-chip .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.user-meta .name {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.3;
}
.user-meta .role {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.3;
}
.caret {
  color: var(--text-3);
  font-size: 12px;
}
.main {
  min-height: calc(100vh - 64px);
}
</style>
