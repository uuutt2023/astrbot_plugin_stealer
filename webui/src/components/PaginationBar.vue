<script setup>
defineProps({
    currentPage: Number,
    pageSize: Number,
    total: Number
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
    <div class="pagination-bar">
        <button @click="$emit('prev')" :disabled="currentPage <= 1" class="page-btn">
            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </button>
        <span class="page-info">{{ currentPage }} / {{ Math.ceil(total / pageSize) }}</span>
        <button @click="$emit('next')" :disabled="currentPage * pageSize >= total" class="page-btn">
            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </button>
    </div>
</template>

<script>
export default {
    name: 'PaginationBar'
}
</script>