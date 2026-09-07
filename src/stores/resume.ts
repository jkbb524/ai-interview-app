import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Resume } from '../types'
import * as api from '../mock'

export const useResumeStore = defineStore('resume', () => {
  const resumes = ref<Resume[]>([])
  const loading = ref(false)

  async function fetchResumes(): Promise<void> {
    loading.value = true
    try {
      resumes.value = await api.getResumes()
    } finally {
      loading.value = false
    }
  }

  async function createResume(payload: Omit<Resume, 'id' | 'updatedAt'>): Promise<Resume> {
    const resume = await api.createResume(payload)
    resumes.value.unshift(resume)
    return resume
  }

  async function updateResume(id: string, payload: Partial<Resume>): Promise<Resume> {
    const resume = await api.updateResume(id, payload)
    const idx = resumes.value.findIndex((r) => r.id === id)
    if (idx !== -1) resumes.value[idx] = resume
    return resume
  }

  async function removeResume(id: string): Promise<void> {
    await api.deleteResume(id)
    resumes.value = resumes.value.filter((r) => r.id !== id)
  }

  return { resumes, loading, fetchResumes, createResume, updateResume, removeResume }
})
