<script setup>
defineProps({
  batchScopeOpen: Boolean,
  batchScopeMode: String,
  selectedCount: Number,
});

const emit = defineEmits(['close', 'update:batchScopeMode', 'confirm']);
</script>

<template>
  <div v-if="batchScopeOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-panel" style="max-width: 450px">
      <div class="modal-header">
        <h2>批量设置作用域</h2>
        <button class="modal-close" @click="$emit('close')">
          <IconClose style="width: 20px; height: 20px" />
        </button>
      </div>

      <div style="padding: 24px">
        <p>
          已选择 <strong>{{ selectedCount }}</strong> 张图片，设置作用域为：
        </p>
        <select
          :value="batchScopeMode"
          class="codex-input"
          @input="$emit('update:batchScopeMode', $event.target.value)"
        >
          <option value="public">public / 公共</option>
          <option value="local">local / 本群限定</option>
        </select>
        <div style="display: flex; gap: 12px; margin-top: 24px">
          <button class="codex-btn" style="flex: 1" @click="$emit('close')">取消</button>
          <button class="codex-btn primary" style="flex: 1" @click="$emit('confirm')">
            确认设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BatchScopeModal',
};
</script>
