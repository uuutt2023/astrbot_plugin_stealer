<script setup>
defineProps({
    uploadOpen: Boolean,
    uploading: Boolean,
    uploadFile: Object,
    uploadPreviewUrl: String,
    uploadError: String,
    uploadForm: Object,
    availableEmotions: Array,
    analyzing: Boolean
})

const emit = defineEmits(['close', 'fileSelect', 'analyzeImage', 'submitUpload'])
</script>

<template>
    <div v-if="uploadOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-panel" style="max-width:600px">
            <div class="modal-header">
                <h2>添加表情包</h2>
                <button @click="$emit('close')" class="modal-close">
                    <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <form @submit.prevent="$emit('submitUpload')" style="padding:24px">
                <div class="upload-area" @click="$refs.fileInput.click()">
                    <input ref="fileInput" type="file" accept="image/*" @change="$emit('fileSelect', $event)" style="display:none">
                    <div v-if="uploadPreviewUrl" class="upload-preview-row">
                        <img :src="uploadPreviewUrl" class="upload-preview">
                    </div>
                    <div v-else>
                        <svg style="width:48px;height:48px;margin:0 auto 16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <p style="text-align:center;color:var(--text-muted)">点击上传图片</p>
                    </div>
                </div>

                <div class="form-group">
                    <label>分类</label>
                    <select v-model="uploadForm.emotion" class="codex-input" required>
                        <option value="">请选择分类...</option>
                        <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">{{ emo.name }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>描述</label>
                    <textarea v-model="uploadForm.desc" class="codex-input" rows="2" placeholder="关于此表情包的描述..."></textarea>
                </div>

                <div v-if="uploadError" class="error-message">{{ uploadError }}</div>

                <div class="modal-footer-actions">
                    <button type="button" @click="$emit('close')" class="codex-btn">取消</button>
                    <button type="submit" :disabled="uploading || !uploadFile" class="codex-btn primary">
                        {{ uploading ? '上传中...' : '确认添加' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UploadModal'
}
</script>