<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{ values: number[]; labels?: string[]; height?: number }>(),
  { labels: () => [], height: 120 }
)

const el = ref<HTMLDivElement>()
let chart: ECharts | null = null

function render(): void {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  chart.setOption({
    grid: { left: 4, right: 4, top: 10, bottom: 4, containLabel: false },
    xAxis: {
      type: 'category',
      data: props.labels.length ? props.labels : props.values.map((_, i) => String(i + 1)),
      show: false,
      boundaryGap: false
    },
    yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
    tooltip: { trigger: 'axis' },
    series: [
      {
        type: 'line',
        data: props.values,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#6366f1', width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99,102,241,0.22)' },
            { offset: 1, color: 'rgba(99,102,241,0)' }
          ])
        }
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

watch(() => props.values, render, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" :style="{ width: '100%', height: height + 'px' }"></div>
</template>
