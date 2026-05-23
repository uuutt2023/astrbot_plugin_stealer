import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * @description 主题管理 Composable
 * @returns {Object} 主题状态和切换方法
 */
export function useTheme() {
  const STORAGE_KEY = 'theme'
  const isDarkTheme = ref(true)
  let _cleanupFn = null

  /**
   * @description 初始化主题(从 localStorage 读取)
   */
  const initTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      isDarkTheme.value = saved === 'dark'
    }
    applyTheme()
  }

  /**
   * @description 应用主题到 DOM
   */
  const applyTheme = () => {
    const theme = isDarkTheme.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    // 更新 meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', isDarkTheme.value ? '#1a1a2e' : '#ffffff')
    }
  }

  /**
   * @description 切换主题
   */
  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value
    localStorage.setItem(STORAGE_KEY, isDarkTheme.value ? 'dark' : 'light')
    applyTheme()
  }

  /**
   * @description 监听主题变化
   */
  const stopWatch = watch(isDarkTheme, () => {
    applyTheme()
  })

  /**
   * @description 设置特定主题
   * @param {'dark'|'light'} theme
   */
  const setTheme = (theme) => {
    isDarkTheme.value = theme === 'dark'
    localStorage.setItem(STORAGE_KEY, isDarkTheme.value ? 'dark' : 'light')
    applyTheme()
  }

  // 清理
  onUnmounted(() => {
    stopWatch()
  })

  return {
    // 只读状态
    isDarkTheme: readonly(isDarkTheme),
    // 可修改状态(用于内部组件)
    _isDarkTheme: isDarkTheme,
    // 方法
    initTheme,
    toggleTheme,
    setTheme
  }
}