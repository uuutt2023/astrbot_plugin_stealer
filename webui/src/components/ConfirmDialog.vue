<script setup>
defineProps({
  confirmOpen: Boolean,
  confirmMessage: String,
});

const emit = defineEmits(['yes', 'no']);
</script>

<template>
  <div v-if="confirmOpen" class="modal-overlay">
    <div class="modal-panel" style="max-width: 400px">
      <div style="padding: 24px; text-align: center">
        <p style="margin: 0; font-size: 1rem">{{ confirmMessage }}</p>
      </div>
      <div style="display: flex; gap: 12px; padding: 0 24px 24px">
        <button class="codex-btn" style="flex: 1" @click="$emit('no')">取消</button>
        <button class="codex-btn primary" style="flex: 1" @click="$emit('yes')">确认</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
};
</script>
