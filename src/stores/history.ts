import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { InterviewRecord } from '../types'
import * as api from '../mock'

export const useHistoryStore = defineStore('history', () => {
  const records = ref<InterviewRecord[]>([])
  const loading = ref(false)

  async function fetchHistory(): Promise<void> {
    loading.value = true
    try {
      records.value = await api.getHistory()
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): InterviewRecord | undefined {
    return records.value.find((r) => r.id === id)
  }

  async function fetchReport(id: string): Promise<InterviewRecord | null> {
    return api.getReport(id)
  }

  return { records, loading, fetchHistory, getById, fetchReport }
})
