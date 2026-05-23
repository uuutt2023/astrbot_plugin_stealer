<script setup>
defineProps({
    emotionsOpen: Boolean,
    availableEmotions: Array,
    newEmotion: Object,
    addingEmotion: Boolean,
    deletingEmotionKey: String
})

const emit = defineEmits(['close', 'addEmotion', 'deleteEmotion'])
</script>

<template>
    <div v-if="emotionsOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-panel" style="max-width:650px">
            <div class="modal-header">
                <h2>分类管理</h2>
                <button @click="$emit('close')" class="modal-close">
                    <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div style="padding:24px">
                <div class="category-grid">
                    <div v-for="emo in availableEmotions" :key="emo.key" class="category-card">
                        <div class="category-info">
                            <span class="category-name">{{ emo.name }}</span>
                            <span class="category-count">{{ emo.count || 0 }}张</span>
                        </div>
                        <button @click="$emit('deleteEmotion', emo)" class="delete-btn">删除</button>
                    </div>
                </div>

                <div class="add-form">
                    <h3>添加新分类</h3>
                    <input v-model="newEmotion.key" type="text" class="codex-input" placeholder="标识">
                    <input v-model="newEmotion.name" type="text" class="codex-input" placeholder="名称">
                    <button @click="$emit('addEmotion')" :disabled="addingEmotion || !newEmotion.key" class="codex-btn primary">
                        {{ addingEmotion ? '添加中...' : '添加分类' }}
                    </button>
                </div>
            </div>

            <div style="padding:16px 24px;background:var(--bg-panel);border-top:1px solid var(--gold-dark)">
                <button @click="$emit('close')" class="codex-btn" style="width:100%">关闭</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'EmotionModal'
}
</script>