<script setup>
defineProps({
  uploadOpen: Boolean,
  uploading: Boolean,
  uploadFile: Object,
  uploadPreviewUrl: String,
  uploadError: String,
  uploadForm: Object,
  availableEmotions: Array,
  analyzing: Boolean,
});

const emit = defineEmits(['close', 'fileSelect', 'analyzeImage', 'submitUpload']);
</script>

<template>
  <div v-if="uploadOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-panel" style="max-width: 600px">
      <div class="modal-header">
        <h2>添加表情包</h2>
        <button class="modal-close" @click="$emit('close')">
          <IconClose style="width: 20px; height: 20px" />
        </button>
      </div>

      <form style="padding: 24px" @submit.prevent="$emit('submitUpload')">
        <div class="upload-area" @click="$refs.fileInput.click()">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="$emit('fileSelect', $event)"
          />
          <div v-if="uploadPreviewUrl" class="upload-preview-row">
            <img :src="uploadPreviewUrl" class="upload-preview" />
          </div>
          <div v-else>
            <IconImage style="width: 48px; height: 48px; margin: 0 auto 16px" />
            <p style="text-align: center; color: var(--text-muted)">点击上传图片</p>
          </div>
        </div>

        <div class="form-group">
          <label>分类</label>
          <select v-model="uploadForm.emotion" class="codex-input" required>
            <option value="">请选择分类...</option>
            <option v-for="emo in availableEmotions" :key="emo.key" :value="emo.key">
              {{ emo.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea
            v-model="uploadForm.desc"
            class="codex-input"
            rows="2"
            placeholder="关于此表情包的描述..."
          ></textarea>
        </div>

        <div v-if="uploadError" class="error-message">{{ uploadError }}</div>

        <div class="modal-footer-actions">
          <button type="button" class="codex-btn" @click="$emit('close')">取消</button>
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
  name: 'UploadModal',
};
</script>
