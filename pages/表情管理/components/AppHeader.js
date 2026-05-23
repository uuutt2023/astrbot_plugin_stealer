// 应用头部组件
export const AppHeader = {
    props: {
        stats: Object,
        isDarkTheme: Boolean,
    },
    emits: ['toggleTheme'],
    template: `
        <header class="codex-header">
            <div class="header-title">
                <div class="header-icon">
                    <svg style="width:28px;height:28px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                </div>
                <div class="header-text">
                    <h1>亨利的战利品</h1>
                    <p>表情包小偷管理面板</p>
                </div>
            </div>

            <div class="stats-bar">
                <div class="stat-item">
                    <span class="stat-value">{{ stats.total || 0 }}</span>
                    <span class="stat-label">总数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ stats.categories || 0 }}</span>
                    <span class="stat-label">分类</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ stats.today || 0 }}</span>
                    <span class="stat-label">今日新增</span>
                </div>
            </div>

            <button
                @click="$emit('toggleTheme')"
                class="theme-toggle"
                :title="isDarkTheme ? '切换到白天模式' : '切换到黑夜模式'"
                :class="{ 'is-dark': isDarkTheme }"
            >
                <div class="theme-icon-wrapper">
                    <svg
                        v-if="isDarkTheme"
                        class="sun-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle cx="12" cy="12" r="4" stroke-width="2"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                    </svg>
                    <svg
                        v-else
                        class="moon-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 3v2M19 6h2" opacity="0.5"/>
                    </svg>
                </div>
                <div class="theme-glow"></div>
            </button>
        </header>
    `,
};