<script setup>
defineProps({
    batchMoveOpen: Boolean,
    batchTargetCategory: String,
    availableEmotions: Array,
    selectedCount: Number
})

const emit = defineEmits(['close', 'update:batchTargetCategory', 'confirm'])
</script>

<template>
    <div v-if="batchMoveOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-panel" style="max-width:450px">
            <div class="modal-header">
                <h2>批量移动</h2>
                <button @click="$emit('close')" class="modal-close">
                    <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div style="padding:24px">
                <p>已选择 <strong>{{ selectedCount }}</strong> 张图片，移动到：</p>
                <select :value="batchTargetCategory" @input="$emit('update:batchTargetCategory', $event.target.value)" class="codex-input">
                    <option value="">请选择目标分类...</option>
                    <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">{{ emo.name }}</option>
                </select>
                <div style="display:flex;gap:12px;margin-top:24px">
                    <button @click="$emit('close')" class="codex-btn" style="flex:1">取消</button>
                    <button @click="$emit('confirm')" :disabled="!batchTargetCategory" class="codex-btn primary" style="flex:1">确认移动</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BatchMoveModal'
}
</script>