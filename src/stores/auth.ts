import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '../types'
import * as api from '../mock'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(api.getCurrentUser())
  const isLoggedIn = computed(() => !!user.value)

  async function login(username: string, password: string): Promise<void> {
    user.value = await api.login(username, password)
  }

  async function register(payload: {
    username: string
    email: string
    position: string
    password: string
  }): Promise<void> {
    user.value = await api.register(payload)
  }

  function logout(): void {
    api.logout()
    user.value = null
  }

  return { user, isLoggedIn, login, register, logout }
})
