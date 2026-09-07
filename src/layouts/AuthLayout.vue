<script setup lang="ts">
defineProps<{
  headline: string
  subtitle: string
  features: { icon: string; title: string; desc: string }[]
  foot: string
}>()
</script>

<template>
  <div class="auth">
    <div class="auth-left">
      <div class="logo-row">
        <span class="logo">AI</span>
        <span>AI 模拟面试</span>
      </div>

      <div class="pitch">
        <h2 v-html="headline"></h2>
        <p>{{ subtitle }}</p>
        <div class="features">
          <div v-for="f in features" :key="f.title" class="f">
            <span class="ic">{{ f.icon }}</span>
            <div>
              <b>{{ f.title }}</b>
              <span>{{ f.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="foot">{{ foot }}</div>
    </div>

    <div class="auth-right">
      <div class="auth-box">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 100vh;
}
.auth-left {
  background: linear-gradient(150deg, #4338ca 0%, #6366f1 45%, #8b5cf6 100%);
  color: #fff;
  padding: 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.auth-left::after {
  content: '';
  position: absolute;
  right: -140px;
  bottom: -140px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.auth-left::before {
  content: '';
  position: absolute;
  right: -60px;
  top: 120px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 800;
  position: relative;
  z-index: 1;
}
.logo-row .logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.pitch {
  position: relative;
  z-index: 1;
  max-width: 420px;
}
.pitch h2 {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 18px;
}
.pitch > p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
}
.features {
  margin-top: 34px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.features .f {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.features .f .ic {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
}
.features .f b {
  display: block;
  font-size: 14px;
}
.features .f span {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}
.foot {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
}
.auth-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.auth-box {
  width: 100%;
  max-width: 380px;
}
.auth-box h3 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}
.auth-box .sub {
  color: var(--text-2);
  margin-bottom: 28px;
  font-size: 14px;
}
.auth-box .switch {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-2);
}
.auth-box .switch a {
  color: var(--primary-600);
  font-weight: 600;
}
</style>
