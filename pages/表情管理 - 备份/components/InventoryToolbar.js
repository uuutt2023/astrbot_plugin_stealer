// 工具栏组件
export const InventoryToolbar = {
    props: {
        searchQuery: String,
        sortBy: String,
        isBatchMode: Boolean,
    },
    emits: ['update:searchQuery', 'update:sortBy', 'search', 'toggleBatch', 'openEmotions', 'openUpload', 'openBatchUpload'],
    template: `
        <div class="inventory-toolbar">
            <div class="toolbar-search">
                <svg style="width:16px;height:16px;position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                    :value="searchQuery"
                    @input="$emit('update:searchQuery', $event.target.value); $emit('search')"
                    placeholder="搜索表情包..."
                >
            </div>

            <div class="toolbar-actions">
                <div class="toolbar-group">
                    <select
                        :value="sortBy"
                        @change="$emit('update:sortBy', $event.target.value); $emit('search')"
                        class="codex-input toolbar-sort-select"
                    >
                        <option value="newest">最新</option>
                        <option value="oldest">最早</option>
                    </select>
                </div>

                <div class="toolbar-group">
                    <button @click="$emit('toggleBatch')" class="codex-btn" :class="{ primary: isBatchMode }">
                        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        {{ isBatchMode ? '完成' : '批量' }}
                    </button>

                    <button @click="$emit('openEmotions')" class="codex-btn">
                        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                        </svg>
                        分类
                    </button>
                </div>

                <div class="toolbar-group">
                    <button @click="$emit('openUpload')" class="codex-btn primary">
                        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        添加
                    </button>

                    <button @click="$emit('openBatchUpload')" class="codex-btn">
                        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        批量导入
                    </button>
                </div>
            </div>
        </div>
    `,
};