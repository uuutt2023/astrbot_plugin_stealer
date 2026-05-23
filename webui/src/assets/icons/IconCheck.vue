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
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="class"
    :style="style"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
</template>