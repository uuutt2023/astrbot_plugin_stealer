<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useTheme } from './composables/useTheme.js'
import { useNotification } from './composables/useNotification.js'
import { useImageManager } from './composables/useImageManager.js'
import { useUpload } from './composables/useUpload.js'
import { useBatchOperation } from './composables/useBatchOperation.js'
import { useEmotionManager } from './composables/useEmotionManager.js'
import { createApiFetch, createImageDataLoader, downloadImage } from './utils/api.js'
import { parseSceneList, formatOriginTarget, formatDate } from './utils/format.js'

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

const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// Bridge & API
const bridge = window.AstrBotPluginPage
const apiFetch = createApiFetch(bridge)
const imageDataUrls = reactive({})
const loadImageData = createImageDataLoader(bridge, imageDataUrls)

// Theme
const { isDarkTheme, initTheme, toggleTheme } = useTheme()

// Notification
const { toastOpen, toastMessage, showAlert, confirmOpen, confirmMessage, showConfirm, onConfirmYes, onConfirmNo } = useNotification()

// Login
const loginState = ref('loading')
const loginError = ref('')

// Image Manager
const { images, categories, stats, loading, searchQuery, selectedCategory, sortBy, currentPage, pageSize, total,
        fetchImages, fetchStats, fetchEmotions, loadAll, debouncedSearch, prevPage, nextPage, deleteImage, toggleScope } =
    useImageManager(apiFetch, bridge, imageDataUrls, loadImageData, showAlert, showConfirm)

// Upload Form
const uploadForm = reactive({ emotion: '', tags: '', scene: '', desc: '' })
const { uploadOpen, uploading, uploadFile, uploadPreviewUrl, uploadError, analysisScenes,
        openUploadModal, closeUploadModal, handleFileSelect, submitUpload: submitUploadFn } = useUpload(bridge, apiFetch, uploadForm, showAlert)

// Batch Operation
const { isBatchMode, selectedImages, batchMoveOpen, batchTargetCategory, batchScopeOpen, batchScopeMode,
        toggleBatchMode, toggleSelection, selectAll, handleBatchDelete,
        openBatchMoveModal, closeBatchMoveModal, confirmBatchMove,
        openBatchScopeModal, closeBatchScopeModal, confirmBatchScope } = useBatchOperation(apiFetch, showAlert, showConfirm, fetchImages, fetchStats)

// Emotion Manager
const { emotionsOpen, availableEmotions, newEmotion, addingEmotion, deletingEmotionKey,
        openEmotionsModal, closeEmotionsModal, addEmotion, deleteEmotion } = useEmotionManager(apiFetch, showAlert, showConfirm)

// Preview
const previewOpen = ref(false)
const previewItem = ref(null)
const isEditing = ref(false)
const editForm = reactive({ category: '', tags: '', scene: '', desc: '', scope_mode: 'public' })

// Login Handler
const handleLoginSubmit = () => {
    loginState.value = bridge ? 'success' : 'form'
    loginError.value = bridge ? '' : '未检测到 AstrBot 桥接环境'
    if (bridge) {
        setTimeout(() => {
            loginState.value = 'loggedIn'
            initTheme()
            loadAll()
        }, 800)
    }
}

// Category Select
const onCategorySelect = (cat) => {
    selectedCategory.value = cat
    fetchImages(1)
}

// Preview Actions
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
        scope_mode: previewItem.value.scope_mode || 'public',
    })
    isEditing.value = true
}

const saveEdit = async () => {
    if (!previewItem.value) return
    const body = { ...editForm, hash: previewItem.value.hash }
    const [res, data] = await apiFetch('api/images/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then(r => r.json().then(d => [r, d])).catch(() => [null, null])

    if (data?.success) {
        isEditing.value = false
        const refreshedImages = await fetchImages(currentPage.value)
        previewItem.value = refreshedImages.find((i) => i.hash === previewItem.value.hash) || previewItem.value
        fetchStats()
    } else {
        showAlert(data?.error || '保存失败')
    }
}

const onDownload = (item) => downloadImage(item, imageDataUrls)

const onDelete = async (item, blacklist = false) => {
    const deleted = await deleteImage(item, blacklist)
    if (deleted) closePreview()
}

const onToggleScope = async (item, newMode) => {
    const success = await toggleScope(item, newMode)
    if (success) {
        previewItem.value && (previewItem.value.scope_mode = newMode)
        showAlert(newMode === 'local' ? '已设为本群限定' : '已设为公共')
    }
}

const submitUpload = async () => {
    const success = await submitUploadFn()
    if (success) {
        showAlert('上传成功')
        fetchImages(1)
        fetchStats()
    }
}

// Keyboard
const handleKeydown = (e) => {
    if (!previewOpen.value || isEditing.value) return
    const actions = { ArrowLeft: () => {
        if (!previewItem.value) return
        const idx = images.value.findIndex((i) => i.hash === previewItem.value.hash)
        if (idx > 0) previewItem.value = images.value[idx - 1]
    }, ArrowRight: () => {
        if (!previewItem.value) return
        const idx = images.value.findIndex((i) => i.hash === previewItem.value.hash)
        if (idx < images.value.length - 1) previewItem.value = images.value[idx + 1]
    }, Escape: closePreview }
    actions[e.key]?.()
}

onMounted(() => {
    loginState.value = bridge ? 'form' : 'error'
    loginError.value = bridge ? '' : '未检测到 AstrBot 桥接环境'
    bridge && window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
    <LoginPage v-if="loginState !== 'loggedIn'" :loginState="loginState" :loginError="loginError" @submit="handleLoginSubmit" />

    <div v-else id="app">
        <AppHeader :stats="stats" :isDarkTheme="isDarkTheme" @toggleTheme="toggleTheme" />

        <div class="main-container">
            <CategorySidebar :categories="categories" :selectedCategory="selectedCategory" :stats="stats" @select="onCategorySelect" />

            <div class="inventory-panel">
                <InventoryToolbar v-model:searchQuery="searchQuery" v-model:sortBy="sortBy" :isBatchMode="isBatchMode" @search="debouncedSearch" @toggleBatch="toggleBatchMode" @openEmotions="openEmotionsModal" @openUpload="openUploadModal" />

                <div v-if="isBatchMode && selectedImages.size > 0" class="batch-bar">
                    <span>已选择 {{ selectedImages.size }} 张</span>
                    <button @click="selectAll(images)" class="codex-btn">全选</button>
                    <button @click="openBatchMoveModal" class="codex-btn">移动</button>
                    <button @click="openBatchScopeModal" class="codex-btn">作用域</button>
                    <button @click="handleBatchDelete" class="codex-btn danger">删除</button>
                    <button @click="toggleBatchMode" class="codex-btn">取消</button>
                </div>

                <template v-if="loading">
                    <div class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
                </template>
                <template v-else-if="images.length === 0">
                    <div class="empty-state"><p>{{ searchQuery ? '未找到匹配的表情包' : '暂无表情包' }}</p></div>
                </template>
                <template v-else>
                    <ImageGrid :images="images" :imageDataUrls="imageDataUrls" :isBatchMode="isBatchMode" :selectedImages="selectedImages" :PLACEHOLDER="PLACEHOLDER" @select="toggleSelection" @preview="onPreviewImage" />
                    <PaginationBar v-if="total > pageSize" :currentPage="currentPage" :pageSize="pageSize" :total="total" @prev="prevPage" @next="nextPage" />
                </template>
            </div>
        </div>

        <ImagePreviewModal :previewOpen="previewOpen" :previewItem="previewItem" :isEditing="isEditing" :editForm="editForm" :availableEmotions="availableEmotions" :imageDataUrls="imageDataUrls" :PLACEHOLDER="PLACEHOLDER" :formatOriginTarget="formatOriginTarget" :formatDate="formatDate" @close="closePreview" @startEdit="startEdit" @cancelEdit="isEditing = false" @saveEdit="saveEdit" @download="onDownload" @delete="onDelete" @toggleScope="onToggleScope" />

        <UploadModal :uploadOpen="uploadOpen" :uploading="uploading" :uploadFile="uploadFile" :uploadPreviewUrl="uploadPreviewUrl" :uploadError="uploadError" :uploadForm="uploadForm" :availableEmotions="availableEmotions" :analyzing="false" @close="closeUploadModal" @fileSelect="handleFileSelect" @submitUpload="submitUpload" />

        <EmotionModal :emotionsOpen="emotionsOpen" :availableEmotions="availableEmotions" :newEmotion="newEmotion" :addingEmotion="addingEmotion" :deletingEmotionKey="deletingEmotionKey" @close="closeEmotionsModal" @addEmotion="addEmotion" @deleteEmotion="deleteEmotion" />

        <BatchMoveModal :batchMoveOpen="batchMoveOpen" :batchTargetCategory="batchTargetCategory" :availableEmotions="availableEmotions" :selectedCount="selectedImages.size" @close="closeBatchMoveModal" @update:batchTargetCategory="val => batchTargetCategory = val" @confirm="confirmBatchMove" />

        <BatchScopeModal :batchScopeOpen="batchScopeOpen" :batchScopeMode="batchScopeMode" :selectedCount="selectedImages.size" @close="closeBatchScopeModal" @update:batchScopeMode="val => batchScopeMode = val" @confirm="confirmBatchScope" />

        <ToastNotification :toastOpen="toastOpen" :toastMessage="toastMessage" @close="toastOpen = false" />

        <ConfirmDialog :confirmOpen="confirmOpen" :confirmMessage="confirmMessage" @yes="onConfirmYes" @no="onConfirmNo" />
    </div>
</template>