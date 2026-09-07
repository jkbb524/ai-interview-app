<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ data: { name: string; score: number }[] }>()

const el = ref<HTMLDivElement>()
let chart: ECharts | null = null

function render(): void {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  chart.setOption({
    radar: {
      indicator: props.data.map((d) => ({ name: d.name, max: 100 })),
      radius: '62%',
      splitNumber: 4,
      axisName: { color: '#5c6370', fontSize: 12 },
      splitLine: { lineStyle: { color: ['#e7e9f2'] } },
      splitArea: { areaStyle: { color: ['transparent'] } },
      axisLine: { lineStyle: { color: '#e7e9f2' } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: props.data.map((d) => d.score),
            name: '得分',
            areaStyle: { color: 'rgba(99,102,241,0.20)' },
            lineStyle: { color: '#6366f1', width: 2 },
            itemStyle: { color: '#6366f1' }
          }
        ]
      }
    ]
  })
}

function resize(): void {
  chart?.resize()
}

onMounted(() => {
  render()
  window.addEventListener('resize', resize)
})

watch(() => props.data, render, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" class="chart"></div>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 260px;
}
</style>
