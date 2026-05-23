<script setup>
import { ref, onMounted } from 'vue'

const isDarkTheme = ref(true)

const initTheme = () => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDarkTheme.value = saved === 'dark'
    } else {
      isDarkTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  } catch (e) {
    // localStorage not available in sandboxed environment
  }
  applyTheme()
}

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  try {
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  } catch (e) {
    // localStorage not available in sandboxed environment
  }
  applyTheme()
}

onMounted(initTheme)

defineExpose({ isDarkTheme, initTheme, toggleTheme })
</script>

<template>
  <header class="codex-header">
    <div class="header-title">
      <div class="header-icon">
        <IconPackage style="width: 28px; height: 28px" />
      </div>
      <div class="header-text">
        <h1>亨利的战利品</h1>
        <p>表情包小偷管理面板</p>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ stats?.total || 0 }}</span>
        <span class="stat-label">总数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats?.categories || 0 }}</span>
        <span class="stat-label">分类</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats?.today || 0 }}</span>
        <span class="stat-label">今日新增</span>
      </div>
    </div>

    <button
      class="theme-toggle"
      :class="{ 'is-dark': isDarkTheme }"
      @click="$emit('toggleTheme')"
    >
      <div class="theme-icon-wrapper">
        <IconSun v-if="isDarkTheme" class="sun-icon" />
        <IconMoon v-else class="moon-icon" />
      </div>
      <div class="theme-glow"></div>
    </button>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    stats: Object,
    isDarkTheme: Boolean,
  },
  emits: ['toggleTheme'],
}
</script>