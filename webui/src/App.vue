<script setup>
/**
 * @description 主应用组件
 * @module App.vue
 */
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'

// === Composables ===
import { useTheme } from './composables/useTheme.js'
import { useNotification } from './composables/useNotification.js'
import { useImageManager } from './composables/useImageManager.js'
import { useUpload } from './composables/useUpload.js'
import { useBatchOperation } from './composables/useBatchOperation.js'
import { useEmotionManager } from './composables/useEmotionManager.js'

// === Utils ===
import { createApiFetch, createImageDataLoader, downloadImage } from './utils/api.js'
import { formatOriginTarget, formatDate } from './utils/format.js'

// === Components ===
import AppHeader from './components/AppHeader.vue'
import CategorySidebar from './components/CategorySidebar.vue'
import InventoryToolbar from './components/InventoryToolbar.vue'
import ImageGrid from './components/ImageGrid.vue'
import PaginationBar from './components/PaginationBar.vue'
import ImagePreviewModal from './components/ImagePreviewModal.vue'
import UploadModal from './components/UploadModal.vue'
import EmotionModal from './components/EmotionModal.vue'
import BatchMoveModal from './components/BatchMoveModal.vue'
import BatchScopeModal from './components/BatchScopeModal.vue'
import LoginPage from './components/LoginPage.vue'
import ToastNotification from './components/ToastNotification.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

// === 常量 ===
const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// === Bridge & API ===
const bridge = window.AstrBotPluginPage
const apiFetch = createApiFetch(bridge)
const imageDataUrls = reactive({})
const loadImageData = createImageDataLoader(bridge, imageDataUrls)

// === 主题 ===
const theme = useTheme()

// === 通知 ===
const notification = useNotification()

// === 登录状态 ===
const loginState = ref('loading')
const loginError = ref('')

// === 图片管理 ===
const imageManager = useImageManager(apiFetch, bridge, imageDataUrls, loadImageData, notification.showAlert, notification.showConfirm)

// === 上传表单 ===
const uploadForm = reactive({ emotion: '', tags: '', scene: '', desc: '' })
const upload = useUpload(bridge, apiFetch, uploadForm, notification.showAlert)

// === 批量操作 ===
const batch = useBatchOperation(apiFetch, notification.showAlert, notification.showConfirm, imageManager.fetchImages, imageManager.fetchStats)

// === 分类管理 ===
const emotions = useEmotionManager(apiFetch, notification.showAlert, notification.showConfirm)

// === 预览状态 ===
const previewOpen = ref(false)
const previewItem = ref(null)
const isEditing = ref(false)
const editForm = reactive({
  category: '',
  tags: '',
  scene: '',
  desc: '',
  scope_mode: 'public'
})

// === 登录处理 ===
const handleLoginSubmit = () => {
  loginState.value = bridge ? 'success' : 'form'
  loginError.value = bridge ? '' : '未检测到 AstrBot 桥接环境'
  if (bridge) {
    setTimeout(() => {
      loginState.value = 'loggedIn'
      theme.initTheme()
      imageManager.loadAll()
    }, 800)
  }
}

// === 分类选择 ===
const onCategorySelect = (cat) => {
  imageManager.selectedCategory.value = cat
  imageManager.fetchImages(1)
}

// === 预览操作 ===
const onPreviewImage = (img) => {
  previewItem.value = img
  previewOpen.value = true
  isEditing.value = false
}

const closePreview = () => {
  previewOpen.value = false
  previewItem.value = null
  isEditing.value = false
}

const startEdit = () => {
  if (!previewItem.value) return
  Object.assign(editForm, {
    category: previewItem.value.category,
    tags: (previewItem.value.tags || []).join(', '),
    scene: (previewItem.value.scenes || []).join('、'),
    desc: previewItem.value.desc,
    scope_mode: previewItem.value.scope_mode || 'public'
  })
  isEditing.value = true
}

const saveEdit = async () => {
  if (!previewItem.value) return
  const body = { ...editForm, hash: previewItem.value.hash }
  const [res, data] = await apiFetch('api/images/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json().then(d => [r, d])).catch(() => [null, null])

  if (data?.success) {
    isEditing.value = false
    const refreshedImages = await imageManager.fetchImages(imageManager.currentPage.value)
    previewItem.value = refreshedImages.find(i => i.hash === previewItem.value.hash) || previewItem.value
    imageManager.fetchStats()
  } else {
    notification.showAlert(data?.error || '保存失败')
  }
}

const onDownload = (item) => downloadImage(item, imageDataUrls)

const onDelete = async (item, blacklist = false) => {
  const deleted = await imageManager.deleteImage(item, blacklist)
  if (deleted) closePreview()
}

const onToggleScope = async (item, newMode) => {
  const success = await imageManager.toggleScope(item, newMode)
  if (success) {
    previewItem.value && (previewItem.value.scope_mode = newMode)
    notification.showAlert(newMode === 'local' ? '已设为本群限定' : '已设为公共')
  }
}

// === 上传提交 ===
const submitUploadFromModal = async () => {
  const success = await upload.submitUpload()
  if (success) {
    notification.showAlert('上传成功')
    imageManager.fetchImages(1)
    imageManager.fetchStats()
  }
}

// === 键盘快捷键 ===
const handleKeydown = (e) => {
  if (!previewOpen.value || isEditing.value) return
  const actions = {
    ArrowLeft: () => {
      if (!previewItem.value) return
      const idx = imageManager.images.value.findIndex(i => i.hash === previewItem.value.hash)
      if (idx > 0) previewItem.value = imageManager.images.value[idx - 1]
    },
    ArrowRight: () => {
      if (!previewItem.value) return
      const idx = imageManager.images.value.findIndex(i => i.hash === previewItem.value.hash)
      if (idx < imageManager.images.value.length - 1) previewItem.value = imageManager.images.value[idx + 1]
    },
    Escape: closePreview
  }
  actions[e.key]?.()
}

// === 生命周期 ===
onMounted(() => {
  loginState.value = bridge ? 'form' : 'error'
  loginError.value = bridge ? '' : '未检测到 AstrBot 桥接环境'
  bridge && window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <LoginPage
    v-if="loginState !== 'loggedIn'"
    :loginState="loginState"
    :loginError="loginError"
    @submit="handleLoginSubmit"
  />

  <div v-else id="app">
    <AppHeader
      :stats="imageManager.stats.value"
      :isDarkTheme="theme.isDarkTheme.value"
      @toggleTheme="theme.toggleTheme"
    />

    <div class="main-container">
      <CategorySidebar
        :categories="imageManager.categories.value"
        :selectedCategory="imageManager.selectedCategory.value"
        :stats="imageManager.stats.value"
        @select="onCategorySelect"
      />

      <div class="inventory-panel">
        <InventoryToolbar
          v-model:searchQuery="imageManager.searchQuery.value"
          v-model:sortBy="imageManager.sortBy.value"
          :isBatchMode="batch.isBatchMode.value"
          @search="imageManager.debouncedSearch"
          @toggleBatch="batch.toggleBatchMode"
          @openEmotions="emotions.openEmotionsModal"
          @openUpload="upload.openUploadModal"
        />

        <!-- 批量操作栏 -->
        <div v-if="batch.isBatchMode.value && batch.selectedImages.value.size > 0" class="batch-bar">
          <span>已选择 {{ batch.selectedImages.value.size }} 张</span>
          <button @click="batch.selectAll(imageManager.images.value)" class="codex-btn">全选</button>
          <button @click="batch.openBatchMoveModal" class="codex-btn">移动</button>
          <button @click="batch.openBatchScopeModal" class="codex-btn">作用域</button>
          <button @click="batch.handleBatchDelete" class="codex-btn danger">删除</button>
          <button @click="batch.toggleBatchMode" class="codex-btn">取消</button>
        </div>

        <!-- 加载状态 -->
        <template v-if="imageManager.loading.value">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
        </template>

        <!-- 空状态 -->
        <template v-else-if="imageManager.images.value.length === 0">
          <div class="empty-state">
            <p>{{ imageManager.searchQuery.value ? '未找到匹配的表情包' : '暂无表情包' }}</p>
          </div>
        </template>

        <!-- 图片列表 -->
        <template v-else>
          <ImageGrid
            :images="imageManager.images.value"
            :imageDataUrls="imageDataUrls"
            :isBatchMode="batch.isBatchMode.value"
            :selectedImages="batch.selectedImages.value"
            :PLACEHOLDER="PLACEHOLDER"
            @select="batch.toggleSelection"
            @preview="onPreviewImage"
          />
          <PaginationBar
            v-if="imageManager.total.value > imageManager.pageSize.value"
            :currentPage="imageManager.currentPage.value"
            :pageSize="imageManager.pageSize.value"
            :total="imageManager.total.value"
            @prev="imageManager.prevPage"
            @next="imageManager.nextPage"
          />
        </template>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <ImagePreviewModal
      :previewOpen="previewOpen"
      :previewItem="previewItem"
      :isEditing="isEditing"
      :editForm="editForm"
      :availableEmotions="emotions.availableEmotions.value"
      :imageDataUrls="imageDataUrls"
      :PLACEHOLDER="PLACEHOLDER"
      :formatOriginTarget="formatOriginTarget"
      :formatDate="formatDate"
      @close="closePreview"
      @startEdit="startEdit"
      @cancelEdit="isEditing = false"
      @saveEdit="saveEdit"
      @download="onDownload"
      @delete="onDelete"
      @toggleScope="onToggleScope"
    />

    <!-- 上传弹窗 -->
    <UploadModal
      :uploadOpen="upload.uploadOpen.value"
      :uploading="upload.uploading.value"
      :uploadFile="upload.uploadFile.value"
      :uploadPreviewUrl="upload.uploadPreviewUrl.value"
      :uploadError="upload.uploadError.value"
      :uploadForm="uploadForm"
      :availableEmotions="emotions.availableEmotions.value"
      :analyzing="false"
      @close="upload.closeUploadModal"
      @fileSelect="upload.handleFileSelect"
      @submitUpload="submitUploadFromModal"
    />

    <!-- 分类管理弹窗 -->
    <EmotionModal
      :emotionsOpen="emotions.emotionsOpen.value"
      :availableEmotions="emotions.availableEmotions.value"
      :newEmotion="emotions.newEmotion"
      :addingEmotion="emotions.addingEmotion.value"
      :deletingEmotionKey="emotions.deletingEmotionKey.value"
      @close="emotions.closeEmotionsModal"
      @addEmotion="emotions.addEmotion"
      @deleteEmotion="emotions.deleteEmotion"
    />

    <!-- 批量移动弹窗 -->
    <BatchMoveModal
      :batchMoveOpen="batch.batchMoveOpen.value"
      :batchTargetCategory="batch.batchTargetCategory.value"
      :availableEmotions="emotions.availableEmotions.value"
      :selectedCount="batch.selectedImages.value.size"
      @close="batch.closeBatchMoveModal"
      @update:batchTargetCategory="val => batch.batchTargetCategory.value = val"
      @confirm="batch.confirmBatchMove"
    />

    <!-- 批量作用域弹窗 -->
    <BatchScopeModal
      :batchScopeOpen="batch.batchScopeOpen.value"
      :batchScopeMode="batch.batchScopeMode.value"
      :selectedCount="batch.selectedImages.value.size"
      @close="batch.closeBatchScopeModal"
      @update:batchScopeMode="val => batch.batchScopeMode.value = val"
      @confirm="batch.confirmBatchScope"
    />

    <!-- Toast通知 -->
    <ToastNotification
      :toastOpen="notification.toastOpen.value"
      :toastMessage="notification.toastMessage.value"
      @close="notification.toastOpen.value = false"
    />

    <!-- 确认对话框 -->
    <ConfirmDialog
      :confirmOpen="notification.confirmOpen.value"
      :confirmMessage="notification.confirmMessage.value"
      @yes="notification.onConfirmYes"
      @no="notification.onConfirmNo"
    />
  </div>
</template>