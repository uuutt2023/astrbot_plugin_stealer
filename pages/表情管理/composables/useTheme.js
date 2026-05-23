// 主题管理组合式函数
import { ref } from 'vue';

export function useTheme() {
    const isDarkTheme = ref(true);
    const theme = ref('dark');

    const initTheme = () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme.value = prefersDark ? 'dark' : 'light';
        isDarkTheme.value = prefersDark;
        applyTheme();
    };

    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', theme.value);
    };

    const toggleTheme = () => {
        const flash = document.createElement('div');
        flash.className = 'theme-flash active';
        document.body.appendChild(flash);

        isDarkTheme.value = !isDarkTheme.value;
        theme.value = isDarkTheme.value ? 'dark' : 'light';
        applyTheme();

        setTimeout(() => {
            flash.remove();
        }, 600);
    };

    return {
        isDarkTheme,
        theme,
        initTheme,
        toggleTheme,
    };
}