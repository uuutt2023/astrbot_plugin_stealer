import { ref } from 'vue'

export function useTheme() {
    const isDarkTheme = ref(true)

    const initTheme = () => {
        const saved = localStorage.getItem('theme')
        if (saved) {
            isDarkTheme.value = saved === 'dark'
        }
        applyTheme()
    }

    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
    }

    const toggleTheme = () => {
        isDarkTheme.value = !isDarkTheme.value
        localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
        applyTheme()
    }

    return { isDarkTheme, initTheme, toggleTheme }
}