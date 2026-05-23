<script setup>
defineProps({
  batchMoveOpen: Boolean,
  batchTargetCategory: String,
  availableEmotions: Array,
  selectedCount: Number,
});

const emit = defineEmits(['close', 'update:batchTargetCategory', 'confirm']);
</script>

<template>
  <div v-if="batchMoveOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-panel" style="max-width: 450px">
      <div class="modal-header">
        <h2>批量移动</h2>
        <button class="modal-close" @click="$emit('close')">
          <IconClose style="width: 20px; height: 20px" />
        </button>
      </div>

      <div style="padding: 24px">
        <p>
          已选择 <strong>{{ selectedCount }}</strong> 张图片，移动到：
        </p>
        <select
          :value="batchTargetCategory"
          class="codex-input"
          @input="$emit('update:batchTargetCategory', $event.target.value)"
        >
          <option value="">请选择目标分类...</option>
          <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">
            {{ emo.name }}
          </option>
        </select>
        <div style="display: flex; gap: 12px; margin-top: 24px">
          <button class="codex-btn" style="flex: 1" @click="$emit('close')">取消</button>
          <button
            :disabled="!batchTargetCategory"
            class="codex-btn primary"
            style="flex: 1"
            @click="$emit('confirm')"
          >
            确认移动
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BatchMoveModal',
};
</script>
