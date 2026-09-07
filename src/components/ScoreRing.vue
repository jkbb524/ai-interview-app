<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ score: number; size?: number }>(), { size: 150 })

const R = 66
const C = 2 * Math.PI * R
const gid = `ring-${Math.random().toString(36).slice(2, 8)}`
const strokeUrl = computed(() => `url(#${gid})`)
const offset = computed(() => C * (1 - props.score / 100))
</script>

<template>
  <div class="score-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 150 150">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#6366f1" />
          <stop offset="1" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="75" cy="75" :r="R" fill="none" stroke="#eef0f7" stroke-width="12" />
      <circle
        cx="75"
        cy="75"
        :r="R"
        fill="none"
        :stroke="strokeUrl"
        stroke-width="12"
        stroke-linecap="round"
        :stroke-dasharray="C"
        :stroke-dashoffset="offset"
        transform="rotate(-90 75 75)"
      />
    </svg>
    <div class="num">
      <b>{{ score }}</b>
      <span>/ 100</span>
    </div>
  </div>
</template>

<style scoped>
.score-ring {
  position: relative;
  flex-shrink: 0;
}
.score-ring svg {
  transform: rotate(-90deg);
}
.score-ring .num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.score-ring .num b {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -1px;
}
.score-ring .num span {
  font-size: 12px;
  color: var(--text-3);
}
</style>
