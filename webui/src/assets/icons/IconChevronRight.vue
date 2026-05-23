<script setup>
defineProps({
  class: String,
  style: [String, Object],
});
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="class"
    :style="style"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
</template>