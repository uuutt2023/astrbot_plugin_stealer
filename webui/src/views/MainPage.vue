<script setup>
/**
 * @description 主页面组件 - 包含登录判断后的所有内容
 */

import { useAppStore } from '@/stores/appStore.js';
import { useImageStore } from '@/stores/imageStore.js';
import { useUploadStore } from '@/stores/uploadStore.js';
import { useBatchStore } from '@/stores/batchStore.js';
import { useEmotionStore } from '@/stores/emotionStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { createApiFetch, downloadImage } from '@/utils/api.js';
import { formatOriginTarget, formatDate } from '@/utils/format.js';

// === Stores ===
const appStore = useAppStore();
const imageStore = useImageStore();
const uploadStore = useUploadStore();
const batchStore = useBatchStore();
const emotionStore = useEmotionStore();
const notificationStore = useNotificationStore();

// === 常量 ===
const PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// === 编辑表单 ===
const editForm = reactive({
  category: '',
  tags: '',
  scene: '',
  desc: '',
  scope_mode: 'public',
});

// === 初始化 ===
onMounted(() => {
  const bridge = appStore.bridge;
  if (bridge) {
    appStore.apiFetch = createApiFetch(bridge);
    window.addEventListener('keydown', handleKeydown);
    loadInitialData();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// === 登录处理 ===
const handleLoginSubmit = () => {
  appStore.handleLoginSubmit();
  if (appStore.bridge) {
    setTimeout(() => {
      appStore.initTheme();
    }, 800);
  }
};

const loadInitialData = async () => {
  imageStore.setLoading(true);
  try {
    const statsRes = await appStore.apiFetch('api/stats');
    const statsData = await statsRes.json();
    imageStore.setStats(statsData.stats || {});

    const emotionsRes = await appStore.apiFetch('api/emotions');
    const emotionsData = await emotionsRes.json();
    emotionStore.setAvailableEmotions(emotionsData.emotions || []);

    await loadImages();
  } finally {
    imageStore.setLoading(false);
  }
};

const loadImages = async (page = 1) => {
  imageStore.setLoading(true);
  try {
    const params = new URLSearchParams({
      page: String(page),
      size: String(imageStore.pageSize.value),
      q: imageStore.searchQuery.value,
      category: imageStore.selectedCategory.value,
      sort: imageStore.sortBy.value,
    });
    const res = await appStore.apiFetch('api/images?' + params.toString());
    const data = await res.json();

    imageStore.setImages(data.images || []);
    imageStore.setTotal(Number(data.total || 0));
    imageStore.setCategories(data.categories || []);
    imageStore.setCurrentPage(page);

    for (const img of data.images || []) {
      await imageStore.loadImageData(img.hash, appStore.apiFetch);
    }

    return data.images || [];
  } catch (e) {
    console.error('loadImages error:', e);
    return [];
  } finally {
    imageStore.setLoading(false);
  }
};

// === 分类选择 ===
const onCategorySelect = (cat) => {
  imageStore.setSelectedCategory(cat);
  loadImages(1);
};

// === 搜索 ===
const onSearch = () => {
  loadImages(1);
};

// === 预览操作 ===
const onPreviewImage = (img) => {
  appStore.openPreview(img);
};

const closePreview = () => {
  appStore.closePreview();
};

const startEdit = () => {
  if (!appStore.previewItem) return;
  Object.assign(editForm, {
    category: appStore.previewItem.category || '',
    tags: (appStore.previewItem.tags || []).join(', '),
    scene: (appStore.previewItem.scenes || []).join('、'),
    desc: appStore.previewItem.desc || '',
    scope_mode: appStore.previewItem.scope_mode || 'public',
  });
  appStore.startEdit();
};

const saveEdit = async () => {
  if (!appStore.previewItem) return;
  const body = { ...editForm, hash: appStore.previewItem.hash };
  const res = await appStore.apiFetch('api/images/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data?.success) {
    appStore.cancelEdit();
    const images = await loadImages(imageStore.currentPage.value);
    const item = images.find((i) => i.hash === appStore.previewItem.hash);
    appStore.updatePreviewItem(item || appStore.previewItem);
    const statsRes = await appStore.apiFetch('api/stats');
    const statsData = await statsRes.json();
    imageStore.setStats(statsData.stats || {});
  } else {
    notificationStore.showAlert(data?.error || '保存失败');
  }
};

const onDownload = (item) => {
  downloadImage(item, imageStore.imageDataUrls);
};

const onDelete = async (item, blacklist = false) => {
  const msg = blacklist ? '确定要删除并拉黑这张图片吗？' : '确定要删除这张图片吗？';
  if (!(await notificationStore.showConfirm(msg))) return;

  try {
    const res = await appStore.apiFetch('api/images/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: item.hash, blacklist }),
    });
    if (res.ok) {
      await loadImages(imageStore.currentPage.value);
      appStore.closePreview();
      notificationStore.showAlert('删除成功');
    }
  } catch (e) {
    notificationStore.showAlert('删除失败');
  }
};

const onToggleScope = async (item, newMode) => {
  try {
    const res = await appStore.apiFetch('api/images/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: item.hash, scope_mode: newMode }),
    });
    const data = await res.json();
    if (data.success) {
      item.scope_mode = newMode;
      notificationStore.showAlert(newMode === 'local' ? '已设为本群限定' : '已设为公共');
    }
  } catch (e) {
    notificationStore.showAlert('操作失败');
  }
};

// === 上传 ===
const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    uploadStore.setUploadError('请选择图片文件');
    return;
  }
  const previewUrl = URL.createObjectURL(file);
  uploadStore.setUploadFile(file, previewUrl);
};

const submitUpload = async () => {
  if (!uploadStore.uploadFile) {
    uploadStore.setUploadError('请选择图片');
    return;
  }

  uploadStore.setUploading(true);
  try {
    const uploadRes = await appStore.bridge.upload('images/upload', uploadStore.uploadFile);
    if (!uploadRes.success || !uploadRes.hash) {
      uploadStore.setUploadError(uploadRes.error || '上传失败');
      return;
    }

    await appStore.bridge.apiPost('images/update', {
      hash: uploadRes.hash,
      category: uploadStore.uploadForm.emotion,
      desc: uploadStore.uploadForm.desc,
    });

    uploadStore.closeUploadModal();
    notificationStore.showAlert('上传成功');
    await loadImages(1);
  } catch (e) {
    uploadStore.setUploadError('上传出错');
  } finally {
    uploadStore.setUploading(false);
  }
};

// === 批量操作 ===
const handleBatchDelete = async () => {
  if (!batchStore.hasSelection.value) return;
  const confirmed = await notificationStore.showConfirm(
    `确定要删除选中的 ${batchStore.selectedCount.value} 张图片吗？`
  );
  if (!confirmed) return;

  try {
    const res = await appStore.apiFetch('api/images/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashes: Array.from(batchStore.selectedImages.value) }),
    });
    const data = await res.json();
    if (data.success) {
      batchStore.clearSelection();
      await loadImages(1);
    }
  } catch (e) {
    notificationStore.showAlert('删除失败');
  }
};

const confirmBatchMove = async () => {
  if (!batchStore.batchTargetCategory) return;
  try {
    const res = await appStore.apiFetch('api/images/batch-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hashes: Array.from(batchStore.selectedImages.value),
        category: batchStore.batchTargetCategory,
      }),
    });
    const data = await res.json();
    if (data.success) {
      batchStore.closeBatchMoveModal();
      batchStore.exitBatchMode();
      await loadImages(1);
    }
  } catch (e) {
    notificationStore.showAlert('移动失败');
  }
};

const confirmBatchScope = async () => {
  try {
    const res = await appStore.apiFetch('api/images/batch-scope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hashes: Array.from(batchStore.selectedImages.value),
        scope_mode: batchStore.batchScopeMode,
      }),
    });
    const data = await res.json();
    if (data.success) {
      batchStore.closeBatchScopeModal();
      batchStore.exitBatchMode();
      await loadImages(1);
    }
  } catch (e) {
    notificationStore.showAlert('设置失败');
  }
};

// === 分类管理 ===
const addEmotion = async () => {
  const key = emotionStore.newEmotion.key?.trim();
  if (!key) return;

  emotionStore.setAddingEmotion(true);
  try {
    const newCat = {
      key,
      name: (emotionStore.newEmotion.name || '').trim(),
      desc: (emotionStore.newEmotion.desc || '').trim(),
    };
    const currentList = [...emotionStore.availableEmotions.value];
    const existingIdx = currentList.findIndex((c) => c.key === newCat.key);

    if (existingIdx >= 0) {
      const confirmed = await notificationStore.showConfirm(`分类 ${key} 已存在，确定要更新吗？`);
      if (!confirmed) {
        emotionStore.setAddingEmotion(false);
        return;
      }
      currentList[existingIdx] = newCat;
    } else {
      currentList.push(newCat);
    }

    const res = await appStore.apiFetch('api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: currentList }),
    });
    const data = await res.json();
    if (data.success) {
      emotionStore.setAvailableEmotions(currentList);
      emotionStore.resetNewEmotion();
    }
  } finally {
    emotionStore.setAddingEmotion(false);
  }
};

const deleteEmotion = async (cat) => {
  if (!cat?.key) return;
  const confirmed = await notificationStore.showConfirm(`确定要删除分类 ${cat.key} 吗？`);
  if (!confirmed) return;

  emotionStore.setDeletingEmotionKey(cat.key);
  try {
    const res = await appStore.apiFetch('api/categories/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cat.key }),
    });
    const data = await res.json();
    if (data.success) {
      const updated = emotionStore.availableEmotions.value.filter((e) => e.key !== cat.key);
      emotionStore.setAvailableEmotions(updated);
    }
  } finally {
    emotionStore.setDeletingEmotionKey('');
  }
};

// === 分页 ===
const prevPage = () => {
  if (imageStore.hasPrevPage.value) {
    loadImages(imageStore.currentPage.value - 1);
  }
};

const nextPage = () => {
  if (imageStore.hasMorePages.value) {
    loadImages(imageStore.currentPage.value + 1);
  }
};

// === 键盘快捷键 ===
const handleKeydown = (e) => {
  if (!appStore.previewOpen.value || appStore.isEditing.value) return;
  const actions = {
    ArrowLeft: () => {
      const idx = imageStore.images.value.findIndex((i) => i.hash === appStore.previewItem?.hash);
      if (idx > 0) appStore.openPreview(imageStore.images.value[idx - 1]);
    },
    ArrowRight: () => {
      const idx = imageStore.images.value.findIndex((i) => i.hash === appStore.previewItem?.hash);
      if (idx < imageStore.images.value.length - 1)
        appStore.openPreview(imageStore.images.value[idx + 1]);
    },
    Escape: closePreview,
  };
  actions[e.key]?.();
};
</script>

<template>
  <div id="app">
    <AppHeader
      :stats="imageStore.stats.value"
      :isDarkTheme="appStore.isDarkTheme.value"
      @toggleTheme="appStore.toggleTheme"
    />

    <div class="main-container">
      <CategorySidebar
        :categories="imageStore.categories.value"
        :selectedCategory="imageStore.selectedCategory.value"
        :stats="imageStore.stats.value"
        @select="onCategorySelect"
      />

      <div class="inventory-panel">
        <InventoryToolbar
          v-model:searchQuery="imageStore.searchQuery.value"
          v-model:sortBy="imageStore.sortBy.value"
          :isBatchMode="batchStore.isBatchMode.value"
          @search="onSearch"
          @toggleBatch="batchStore.toggleBatchMode"
          @openEmotions="emotionStore.openEmotionsModal"
          @openUpload="uploadStore.openUploadModal"
        />

        <div v-if="batchStore.isBatchMode.value && batchStore.hasSelection.value" class="batch-bar">
          <span>已选择 {{ batchStore.selectedCount.value }} 张</span>
          <button class="codex-btn" @click="batchStore.selectAll(imageStore.images.value)">
            全选
          </button>
          <button class="codex-btn" @click="batchStore.openBatchMoveModal">移动</button>
          <button class="codex-btn" @click="batchStore.openBatchScopeModal">作用域</button>
          <button class="codex-btn danger" @click="handleBatchDelete">删除</button>
          <button class="codex-btn" @click="batchStore.exitBatchMode">取消</button>
        </div>

        <template v-if="imageStore.loading.value">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
        </template>

        <template v-else-if="imageStore.images.value.length === 0">
          <div class="empty-state">
            <p>{{ imageStore.searchQuery.value ? '未找到匹配的表情包' : '暂无表情包' }}</p>
          </div>
        </template>

        <template v-else>
          <ImageGrid
            :images="imageStore.images.value"
            :imageDataUrls="imageStore.imageDataUrls"
            :isBatchMode="batchStore.isBatchMode.value"
            :selectedImages="batchStore.selectedImages.value"
            :PLACEHOLDER="PLACEHOLDER"
            @select="batchStore.toggleSelection"
            @preview="onPreviewImage"
          />
          <PaginationBar
            v-if="imageStore.hasMorePages.value"
            :currentPage="imageStore.currentPage.value"
            :pageSize="imageStore.pageSize.value"
            :total="imageStore.total.value"
            @prev="prevPage"
            @next="nextPage"
          />
        </template>
      </div>
    </div>

    <ImagePreviewModal
      :previewOpen="appStore.previewOpen.value"
      :previewItem="appStore.previewItem.value"
      :isEditing="appStore.isEditing.value"
      :editForm="editForm"
      :availableEmotions="emotionStore.availableEmotions.value"
      :imageDataUrls="imageStore.imageDataUrls"
      :PLACEHOLDER="PLACEHOLDER"
      :formatOriginTarget="formatOriginTarget"
      :formatDate="formatDate"
      @close="closePreview"
      @startEdit="startEdit"
      @cancelEdit="appStore.cancelEdit"
      @saveEdit="saveEdit"
      @download="onDownload"
      @delete="onDelete"
      @toggleScope="onToggleScope"
    />

    <UploadModal
      :uploadOpen="uploadStore.uploadOpen.value"
      :uploading="uploadStore.uploading.value"
      :uploadFile="uploadStore.uploadFile.value"
      :uploadPreviewUrl="uploadStore.uploadPreviewUrl.value"
      :uploadError="uploadStore.uploadError.value"
      :uploadForm="uploadStore.uploadForm"
      :availableEmotions="emotionStore.availableEmotions.value"
      @close="uploadStore.closeUploadModal"
      @fileSelect="handleFileSelect"
      @submitUpload="submitUpload"
    />

    <EmotionModal
      :emotionsOpen="emotionStore.emotionsOpen.value"
      :availableEmotions="emotionStore.availableEmotions.value"
      :newEmotion="emotionStore.newEmotion"
      :addingEmotion="emotionStore.addingEmotion.value"
      :deletingEmotionKey="emotionStore.deletingEmotionKey.value"
      @close="emotionStore.closeEmotionsModal"
      @addEmotion="addEmotion"
      @deleteEmotion="deleteEmotion"
    />

    <BatchMoveModal
      :batchMoveOpen="batchStore.batchMoveOpen.value"
      :batchTargetCategory="batchStore.batchTargetCategory"
      :availableEmotions="emotionStore.availableEmotions.value"
      :selectedCount="batchStore.selectedCount.value"
      @close="batchStore.closeBatchMoveModal"
      @update:batchTargetCategory="batchStore.setBatchTargetCategory"
      @confirm="confirmBatchMove"
    />

    <BatchScopeModal
      :batchScopeOpen="batchStore.batchScopeOpen.value"
      :batchScopeMode="batchStore.batchScopeMode"
      :selectedCount="batchStore.selectedCount.value"
      @close="batchStore.closeBatchScopeModal"
      @update:batchScopeMode="batchStore.setBatchScopeMode"
      @confirm="confirmBatchScope"
    />

    <ToastNotification
      :toastOpen="notificationStore.toastOpen.value"
      :toastMessage="notificationStore.toastMessage.value"
      @close="notificationStore.closeToast"
    />

    <ConfirmDialog
      :confirmOpen="notificationStore.confirmOpen.value"
      :confirmMessage="notificationStore.confirmMessage.value"
      @yes="notificationStore.onConfirmYes"
      @no="notificationStore.onConfirmNo"
    />
  </div>
</template>
