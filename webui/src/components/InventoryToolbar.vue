<script setup>
defineProps({
    searchQuery: String,
    sortBy: String,
    isBatchMode: Boolean
})

const emit = defineEmits(['update:searchQuery', 'update:sortBy', 'search', 'toggleBatch', 'openEmotions', 'openUpload', 'openBatchUpload'])
</script>

<template>
    <div class="inventory-toolbar">
        <div class="toolbar-search">
            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                type="text"
                placeholder="搜索表情包..."
                class="search-input"
            >
        </div>

        <div class="toolbar-actions">
            <select :value="sortBy" @change="$emit('update:sortBy', $event.target.value)" class="toolbar-select">
                <option value="newest">最新优先</option>
                <option value="oldest">最早优先</option>
            </select>
            <button @click="$emit('toggleBatch')" class="codex-btn" :class="{ active: isBatchMode }">批量选择</button>
            <button @click="$emit('openEmotions')" class="codex-btn">分类管理</button>
            <button @click="$emit('openUpload')" class="codex-btn primary">上传表情</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'InventoryToolbar'
}
</script>