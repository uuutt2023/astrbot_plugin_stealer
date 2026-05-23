<script setup>
defineProps({
    batchScopeOpen: Boolean,
    batchScopeMode: String,
    selectedCount: Number
})

const emit = defineEmits(['close', 'update:batchScopeMode', 'confirm'])
</script>

<template>
    <div v-if="batchScopeOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-panel" style="max-width:450px">
            <div class="modal-header">
                <h2>批量设置作用域</h2>
                <button @click="$emit('close')" class="modal-close">
                    <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div style="padding:24px">
                <p>已选择 <strong>{{ selectedCount }}</strong> 张图片，设置作用域为：</p>
                <select :value="batchScopeMode" @input="$emit('update:batchScopeMode', $event.target.value)" class="codex-input">
                    <option value="public">public / 公共</option>
                    <option value="local">local / 本群限定</option>
                </select>
                <div style="display:flex;gap:12px;margin-top:24px">
                    <button @click="$emit('close')" class="codex-btn" style="flex:1">取消</button>
                    <button @click="$emit('confirm')" class="codex-btn primary" style="flex:1">确认设置</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BatchScopeModal'
}
</script>