<script setup>
import { computed } from 'vue'

const props = defineProps({
    previewOpen: Boolean,
    previewItem: Object,
    isEditing: Boolean,
    editForm: Object,
    availableEmotions: Array,
    imageDataUrls: Object,
    PLACEHOLDER: String,
    formatOriginTarget: Function,
    formatDate: Function
})

const emit = defineEmits(['close', 'prevImage', 'nextImage', 'startEdit', 'cancelEdit', 'saveEdit', 'download', 'delete', 'toggleScope'])

const currentImageUrl = computed(() => props.imageDataUrls?.[props.previewItem?.hash] || props.PLACEHOLDER)
</script>

<template>
    <div v-if="previewOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-panel">
            <div class="modal-panel-corner-bl"></div>
            <div class="modal-panel-corner-br"></div>

            <div class="modal-header">
                <h2>{{ isEditing ? '编辑' : '详情' }}</h2>
                <button @click="$emit('close')" class="modal-close">
                    <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div class="modal-content">
                <!-- View Mode -->
                <div v-if="!isEditing" class="item-detail">
                    <div class="item-preview">
                        <img :src="currentImageUrl" :alt="previewItem?.desc">
                    </div>
                    <div class="item-stats">
                        <div class="stat-row">
                            <span class="stat-name">分类</span>
                            <span class="stat-value">{{ previewItem?.category }}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-name">作用域</span>
                            <span class="stat-value">
                                <span class="scope-pill" :class="previewItem?.scope_mode === 'local' ? 'local' : 'public'">
                                    {{ previewItem?.scope_mode === 'local' ? '本群限定' : '公共' }}
                                </span>
                            </span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-name">来源</span>
                            <span class="stat-value">{{ formatOriginTarget(previewItem?.origin_target) }}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-name">描述</span>
                        </div>
                        <div class="desc-box">{{ previewItem?.desc || '暂无描述' }}</div>
                        <div class="stat-row">
                            <span class="stat-name">ID</span>
                            <span class="stat-value hash">{{ previewItem?.hash?.slice(0, 16) }}...</span>
                        </div>
                    </div>
                </div>

                <!-- Edit Mode -->
                <div v-else class="edit-form">
                    <div class="form-group">
                        <label>分类</label>
                        <select v-model="editForm.category" class="codex-input">
                            <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">{{ emo.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>描述</label>
                        <textarea v-model="editForm.desc" class="codex-input" rows="3"></textarea>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <template v-if="!isEditing">
                    <button @click="$emit('download', previewItem)" class="codex-btn">下载</button>
                    <button @click="$emit('startEdit')" class="codex-btn">编辑</button>
                    <button @click="$emit('toggleScope', previewItem, previewItem?.scope_mode === 'local' ? 'public' : 'local')" class="codex-btn">
                        {{ previewItem?.scope_mode === 'local' ? '解除限定' : '限定本群' }}
                    </button>
                    <button @click="$emit('delete', previewItem)" class="codex-btn danger">删除</button>
                </template>
                <template v-else>
                    <button @click="$emit('cancelEdit')" class="codex-btn">取消</button>
                    <button @click="$emit('saveEdit')" class="codex-btn primary">保存</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImagePreviewModal'
}
</script>