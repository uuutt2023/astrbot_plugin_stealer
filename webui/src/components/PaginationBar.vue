<script setup>
defineProps({
  currentPage: Number,
  pageSize: Number,
  total: Number,
});

const emit = defineEmits(['prev', 'next']);
</script>

<template>
  <div class="pagination-bar">
    <button :disabled="currentPage <= 1" class="page-btn" @click="$emit('prev')">
      <IconChevronLeft style="width: 16px; height: 16px" />
    </button>
    <span class="page-info">{{ currentPage }} / {{ Math.ceil(total / pageSize) }}</span>
    <button :disabled="currentPage * pageSize >= total" class="page-btn" @click="$emit('next')">
      <IconChevronRight style="width: 16px; height: 16px" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'PaginationBar',
};
</script>
