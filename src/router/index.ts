import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: '注册', public: true }
  },
  {
    path: '/interview',
    name: 'interview',
    component: () => import('../views/InterviewView.vue'),
    meta: { title: '模拟面试' }
  },
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'resumes',
        name: 'resumes',
        component: () => import('../views/ResumeListView.vue'),
        meta: { title: '简历管理' }
      },
      {
        path: 'resume-edit',
        name: 'resume-edit',
        component: () => import('../views/ResumeEditView.vue'),
        meta: { title: '简历编辑' }
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('../views/HistoryView.vue'),
        meta: { title: '历史记录' }
      },
      {
        path: 'report/:sessionId',
        name: 'report',
        component: () => import('../views/ReportView.vue'),
        meta: { title: '复盘报告' }
      },
      {
        path: 'questions',
        name: 'questions',
        component: () => import('../views/QuestionsView.vue'),
        meta: { title: '题库浏览' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 登录守卫：未登录访问受保护页面时重定向到登录页
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && auth.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }
  return true
})

router.afterEach((to) => {
  const base = 'AI 模拟面试'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router
