<script setup>
defineProps({
  searchQuery: String,
  sortBy: String,
  isBatchMode: Boolean,
});

const emit = defineEmits([
  'update:searchQuery',
  'update:sortBy',
  'search',
  'toggleBatch',
  'openEmotions',
  'openUpload',
  'openBatchUpload',
]);
</script>

<template>
  <div class="inventory-toolbar">
    <div class="toolbar-search">
      <IconSearch style="width: 16px; height: 16px" />
      <input
        :value="searchQuery"
        type="text"
        placeholder="搜索表情包..."
        class="search-input"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
    </div>

    <div class="toolbar-actions">
      <select
        :value="sortBy"
        class="toolbar-select"
        @change="$emit('update:sortBy', $event.target.value)"
      >
        <option value="newest">最新优先</option>
        <option value="oldest">最早优先</option>
      </select>
      <button class="codex-btn" :class="{ active: isBatchMode }" @click="$emit('toggleBatch')">
        批量选择
      </button>
      <button class="codex-btn" @click="$emit('openEmotions')">分类管理</button>
      <button class="codex-btn primary" @click="$emit('openUpload')">上传表情</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryToolbar',
};
</script>
