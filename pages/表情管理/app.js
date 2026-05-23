// 表情包管理面板 - 主应用文件
// 模块化重构版本

import { createApp, ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// 导入工具函数
import { createApiFetch, createImageDataLoader, downloadImage as downloadImageFn } from './utils/api.js';
import { parseSceneList, formatOriginTarget, getScopeLabel, formatDate } from './utils/format.js';

// 导入组合式函数
import { useTheme } from './composables/useTheme.js';
import { useNotification } from './composables/useNotification.js';
import { useImageAnalyzer } from './composables/useImageAnalyzer.js';
import { useImageManager } from './composables/useImageManager.js';
import { useUpload, useBatchUpload } from './composables/useUpload.js';
import { useBatchOperation } from './composables/useBatchOperation.js';
import { useEmotionManager } from './composables/useEmotionManager.js';

// 导入组件
import { AppHeader } from './components/AppHeader.js';
import { CategorySidebar } from './components/CategorySidebar.js';
import { InventoryToolbar } from './components/InventoryToolbar.js';
import { ImageGrid } from './components/ImageGrid.js';
import { PaginationBar } from './components/PaginationBar.js';
import { ImagePreviewModal } from './components/ImagePreviewModal.js';
import { UploadModal } from './components/UploadModal.js';
import { BatchUploadModal } from './components/BatchUploadModal.js';
import { BatchMoveModal, BatchScopeModal } from './components/BatchModals.js';
import { EmotionModal } from './components/EmotionModal.js';
import { LoginPage } from './components/LoginPage.js';
import { ToastNotification, ConfirmDialog } from './components/NotificationComponents.js';

// 占位图
const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 主模板
const TEMPLATE = `
    <LoginPage
        v-if="loginState !== 'loggedIn'"
        :loginState="loginState"
        :loginError="loginError"
        :apiKey="apiKey"
        @submit="handleLoginSubmit"
    />

    <div v-else id="app">
        <AppHeader
            :stats="stats"
            :isDarkTheme="isDarkTheme"
            @toggleTheme="toggleTheme"
        />

        <div class="main-container">
            <CategorySidebar
                :categories="categories"
                :selectedCategory="selectedCategory"
                :stats="stats"
                @select="onCategorySelect"
            />

            <div class="inventory-panel">
                <InventoryToolbar
                    v-model:searchQuery="searchQuery"
                    v-model:sortBy="sortBy"
                    :isBatchMode="isBatchMode"
                    @search="debouncedSearch"
                    @toggleBatch="toggleBatchMode"
                    @openEmotions="openEmotionsModal"
                    @openUpload="openUploadModal"
                    @openBatchUpload="openBatchUploadModal"
                />

                <div v-if="isBatchMode && selectedImages.size > 0" class="batch-bar">
                    <span style="font-family:'Cinzel',serif;color:var(--gold-bright)">已选择 {{ selectedImages.size }} 张</span>
                    <button @click="selectAll(images)" class="codex-btn">全选</button>
                    <button @click="openBatchMoveModal" class="codex-btn">移动</button>
                    <button @click="openBatchScopeModal" class="codex-btn">作用域</button>
                    <button @click="handleBatchDelete" class="codex-btn danger">删除</button>
                    <button @click="toggleBatchMode" class="codex-btn">取消</button>
                </div>

                <template v-if="loading">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p style="color:var(--gold-primary);font-family:'Cinzel',serif">加载中...</p>
                    </div>
                </template>

                <template v-else-if="images.length === 0">
                    <div class="empty-state">
                        <svg style="width:64px;height:64px;opacity:0.3;margin-bottom:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        <p style="font-family:'Cinzel',serif">{{ searchQuery ? '未找到匹配的表情包' : '暂无表情包' }}</p>
                    </div>
                </template>

                <template v-else>
                    <ImageGrid
                        :images="images"
                        :imageDataUrls="imageDataUrls"
                        :isBatchMode="isBatchMode"
                        :selectedImages="selectedImages"
                        :PLACEHOLDER="PLACEHOLDER"
                        @select="toggleSelection"
                        @preview="onPreviewImage"
                    />

                    <PaginationBar
                        v-if="total > pageSize"
                        :currentPage="currentPage"
                        :pageSize="pageSize"
                        :total="total"
                        @prev="prevPage"
                        @next="nextPage"
                    />
                </template>
            </div>
        </div>

        <ImagePreviewModal
            :previewOpen="previewOpen"
            :previewItem="previewItem"
            :isEditing="isEditing"
            :editForm="editForm"
            :availableEmotions="availableEmotions"
            :imageDataUrls="imageDataUrls"
            :PLACEHOLDER="PLACEHOLDER"
            @close="closePreview"
            @prevImage="prevImage"
            @nextImage="nextImage"
            @startEdit="startEdit"
            @cancelEdit="cancelEdit"
            @saveEdit="saveEdit"
            @download="onDownload"
            @delete="onDelete"
            @toggleScope="onToggleScope"
        />

        <UploadModal
            :uploadOpen="uploadOpen"
            :uploading="uploading"
            :uploadFile="uploadFile"
            :uploadPreviewUrl="uploadPreviewUrl"
            :uploadError="uploadError"
            :uploadForm="uploadForm"
            :availableEmotions="availableEmotions"
            :analysisScenes="analysisScenes"
            :analyzing="isAnalyzing"
            @close="closeUploadModal"
            @fileSelect="handleFileSelect"
            @analyzeImage="analyzeImage"
            @toggleScene="toggleScene"
            @isSceneSelected="isSceneSelected"
            @submitUpload="submitUpload"
        />

        <BatchUploadModal
            :batchUploadOpen="batchUploadOpen"
            :batchUploading="batchUploading"
            :batchFiles="batchFiles"
            :batchPreviews="batchPreviews"
            :batchUploadError="batchUploadError"
            :batchUploadForm="batchUploadForm"
            :batchTaskId="batchTaskId"
            :batchTaskStatus="batchTaskStatus"
            :batchTaskTotal="batchTaskTotal"
            :batchTaskProcessed="batchTaskProcessed"
            :batchTaskSuccess="batchTaskSuccess"
            :batchTaskFailed="batchTaskFailed"
            :availableEmotions="availableEmotions"
            @close="closeBatchUploadModal"
            @fileSelect="handleBatchFileSelect"
            @clearFiles="clearBatchFiles"
            @submitUpload="submitBatchUpload"
            @reset="resetBatchUpload"
        />

        <BatchMoveModal
            :batchMoveOpen="batchMoveOpen"
            :batchTargetCategory="batchTargetCategory"
            :availableEmotions="availableEmotions"
            :selectedCount="selectedImages.size"
            @close="closeBatchMoveModal"
            @update:batchTargetCategory="val => batchTargetCategory = val"
            @confirm="confirmBatchMove"
        />

        <BatchScopeModal
            :batchScopeOpen="batchScopeOpen"
            :batchScopeMode="batchScopeMode"
            :selectedCount="selectedImages.size"
            @close="closeBatchScopeModal"
            @update:batchScopeMode="val => batchScopeMode = val"
            @confirm="confirmBatchScope"
        />

        <EmotionModal
            :emotionsOpen="emotionsOpen"
            :availableEmotions="availableEmotions"
            :newEmotion="newEmotion"
            :addingEmotion="addingEmotion"
            :deletingEmotionKey="deletingEmotionKey"
            @close="closeEmotionsModal"
            @addEmotion="addEmotion"
            @deleteEmotionByKey="deleteEmotion"
        />

        <ToastNotification
            :toastOpen="toastOpen"
            :toastMessage="toastMessage"
            @close="toastOpen = false"
        />

        <ConfirmDialog
            :confirmOpen="confirmOpen"
            :confirmMessage="confirmMessage"
            @yes="onConfirmYes"
            @no="onConfirmNo"
        />
    </div>
`;

// 主应用组件
const App = {
    components: {
        AppHeader,
        CategorySidebar,
        InventoryToolbar,
        ImageGrid,
        PaginationBar,
        ImagePreviewModal,
        UploadModal,
        BatchUploadModal,
        BatchMoveModal,
        BatchScopeModal,
        EmotionModal,
        LoginPage,
        ToastNotification,
        ConfirmDialog,
    },

    setup() {
        // 检查运行环境
        const bridge = window.AstrBotPluginPage;

        // 初始化主题
        const { isDarkTheme, initTheme, toggleTheme } = useTheme();

        // 初始化通知
        const {
            toastOpen,
            toastMessage,
            showAlert,
            confirmOpen,
            confirmMessage,
            showConfirm,
            onConfirmYes,
            onConfirmNo,
        } = useNotification();

        // 登录状态
        const loginState = ref('loading');
        const loginError = ref('');
        const apiKey = ref('');

        // 图片数据存储
        const imageDataUrls = reactive({});

        // 创建 API 封装
        const apiFetch = createApiFetch(bridge);

        // 创建图片加载器
        const loadImageData = createImageDataLoader(bridge, imageDataUrls);

        // 初始化图片管理器
        const {
            images,
            categories,
            stats,
            loading,
            searchQuery,
            selectedCategory,
            sortBy,
            currentPage,
            pageSize,
            total,
            fetchImages,
            fetchStats,
            fetchEmotions,
            loadAll,
            debouncedSearch,
            prevPage,
            nextPage,
            deleteImage,
            toggleScope,
        } = useImageManager(apiFetch, bridge, imageDataUrls, loadImageData, showAlert, showConfirm);

        // 初始化图片分析器
        const { isAnalyzing, analyze, applyToForm } = useImageAnalyzer(apiFetch);

        // 上传表单
        const uploadForm = reactive({ emotion: '', tags: '', scene: '', desc: '' });

        // 上传相关
        const {
            uploadOpen,
            uploading,
            uploadFile,
            uploadPreviewUrl,
            uploadError,
            analysisScenes,
            openUploadModal,
            closeUploadModal,
            handleFileSelect,
            submitUpload: submitUploadFn,
        } = useUpload(bridge, apiFetch, ref([]), uploadForm, showAlert);

        // 批量上传相关
        const {
            batchUploadOpen,
            batchUploading,
            batchFiles,
            batchPreviews,
            batchUploadError,
            batchUploadForm,
            batchTaskId,
            batchTaskStatus,
            batchTaskTotal,
            batchTaskProcessed,
            batchTaskSuccess,
            batchTaskFailed,
            openBatchUploadModal,
            closeBatchUploadModal,
            clearBatchFiles,
            handleBatchFileSelect,
            submitBatchUpload,
            resetBatchUpload,
        } = useBatchUpload(apiFetch, ref([]), showAlert, fetchImages, fetchStats);

        // 批量操作
        const {
            isBatchMode,
            selectedImages,
            batchMoveOpen,
            batchTargetCategory,
            batchScopeOpen,
            batchScopeMode,
            toggleBatchMode,
            toggleSelection,
            selectAll,
            handleBatchDelete,
            openBatchMoveModal,
            closeBatchMoveModal,
            confirmBatchMove,
            openBatchScopeModal,
            closeBatchScopeModal,
            confirmBatchScope,
        } = useBatchOperation(apiFetch, showAlert, showConfirm, fetchImages, fetchStats);

        // 分类管理
        const {
            emotionsOpen,
            availableEmotions,
            newEmotion,
            addingEmotion,
            deletingEmotionKey,
            openEmotionsModal,
            closeEmotionsModal,
            addEmotion,
            deleteEmotion,
        } = useEmotionManager(apiFetch, showAlert, showConfirm);

        // 预览相关
        const previewOpen = ref(false);
        const previewItem = ref(null);
        const isEditing = ref(false);
        const editForm = reactive({ category: '', tags: '', scene: '', desc: '', scope_mode: 'public' });

        // 场景相关
        const selectedScenes = ref(new Set());

        // 登录处理
        const handleLoginSubmit = async () => {
            loginState.value = 'loading';
            loginError.value = '';

            try {
                const sessionToken = await bridge.createSession(apiKey.value);
                if (sessionToken) {
                    loginState.value = 'success';
                    setTimeout(async () => {
                        loginState.value = 'loggedIn';
                        initTheme();
                        loadAll();
                    }, 800);
                } else {
                    loginState.value = 'form';
                    loginError.value = 'API Key 无效或验证失败';
                }
            } catch (e) {
                loginState.value = 'form';
                loginError.value = e.message || '验证失败';
            }
        };

        // 分类选择
        const onCategorySelect = async (cat) => {
            selectedCategory.value = cat;
            await fetchImages(1);
        };

        // 预览操作
        const onPreviewImage = (img) => {
            previewItem.value = img;
            previewOpen.value = true;
            isEditing.value = false;
        };

        const closePreview = () => {
            previewOpen.value = false;
            previewItem.value = null;
            isEditing.value = false;
        };

        const prevImage = () => {
            if (!previewItem.value) return;
            const idx = images.value.findIndex((i) => i.hash === previewItem.value.hash);
            if (idx > 0) previewItem.value = images.value[idx - 1];
        };

        const nextImage = () => {
            if (!previewItem.value) return;
            const idx = images.value.findIndex((i) => i.hash === previewItem.value.hash);
            if (idx < images.value.length - 1) previewItem.value = images.value[idx + 1];
        };

        // 编辑操作
        const startEdit = () => {
            if (!previewItem.value) return;
            Object.assign(editForm, {
                category: previewItem.value.category,
                tags: (previewItem.value.tags || []).join(', '),
                scene: (previewItem.value.scenes || []).join('、'),
                desc: previewItem.value.desc,
                scope_mode: previewItem.value.scope_mode || 'public',
            });
            isEditing.value = true;
        };

        const cancelEdit = () => {
            isEditing.value = false;
        };

        const saveEdit = async () => {
            if (!previewItem.value) return;
            try {
                const res = await apiFetch('api/images/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editForm, hash: previewItem.value.hash }),
                });
                const data = await res.json();
                if (data.success) {
                    isEditing.value = false;
                    const refreshedImages = await fetchImages(currentPage.value);
                    const refreshedItem = refreshedImages.find((item) => item.hash === previewItem.value.hash);
                    if (refreshedItem) {
                        previewItem.value = refreshedItem;
                    } else {
                        previewItem.value.category = editForm.category;
                        previewItem.value.tags = editForm.tags.split(',').map((t) => t.trim()).filter((t) => t);
                        previewItem.value.scenes = parseSceneList(editForm.scene);
                        previewItem.value.desc = editForm.desc;
                        previewItem.value.scope_mode = editForm.scope_mode || 'public';
                    }
                    await fetchStats();
                } else {
                    showAlert(data.error || '保存失败');
                }
            } catch (e) {
                showAlert('保存出错: ' + e.message);
            }
        };

        // 下载
        const onDownload = (item) => downloadImageFn(item, imageDataUrls);

        // 删除
        const onDelete = async (item, blacklist = false) => {
            const deleted = await deleteImage(item, blacklist);
            if (deleted) {
                closePreview();
                showAlert(blacklist ? '已删除并拉黑' : '已删除');
            }
        };

        // 切换作用域
        const onToggleScope = async (item, newMode) => {
            const success = await toggleScope(item, newMode);
            if (success) {
                if (previewItem.value && previewItem.value.hash === item.hash) {
                    previewItem.value.scope_mode = newMode;
                }
                showAlert(newMode === 'local' ? '已设为本群限定' : '已设为公共');
            }
        };

        // 分析图片
        const analyzeImage = async () => {
            uploadError.value = null;
            try {
                const data = await analyze(uploadFile.value);
                analysisScenes.value = Array.isArray(data.scenes) ? data.scenes : [];
                const result = applyToForm(data, uploadForm, availableEmotions.value);
                if (!result.filled) {
                    uploadError.value = '未能识别有效信息';
                }
            } catch (e) {
                uploadError.value = e.message || '分析失败';
            }
        };

        // 场景切换
        const toggleScene = (scene) => {
            const sceneList = parseSceneList(uploadForm.scene);
            if (sceneList.includes(scene)) {
                uploadForm.scene = sceneList.filter((item) => item !== scene).join('、');
            } else {
                uploadForm.scene = [...sceneList, scene].join('、');
            }
        };

        const isSceneSelected = (scene) => parseSceneList(uploadForm.scene).includes(scene);

        // 提交上传
        const submitUpload = async () => {
            const success = await submitUploadFn();
            if (success) {
                showAlert('上传成功');
                await fetchImages(1);
                await fetchStats();
            }
        };

        // 键盘事件
        const handleKeydown = (e) => {
            if (!previewOpen.value) return;
            if (isEditing.value) return;
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'Escape') closePreview();
        };

        onMounted(() => {
            // 检查登录状态
            if (bridge) {
                loginState.value = 'form';
                window.addEventListener('keydown', handleKeydown);
            } else {
                loginState.value = 'error';
                loginError.value = '未检测到 AstrBot 桥接环境';
            }
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeydown);
        });

        return {
            // 登录
            loginState,
            loginError,
            apiKey,
            handleLoginSubmit,

            // 主题
            isDarkTheme,
            toggleTheme,

            // 统计
            stats,

            // 图片
            images,
            imageDataUrls,
            PLACEHOLDER,

            // 分类
            categories,
            selectedCategory,
            onCategorySelect,

            // 搜索和排序
            searchQuery,
            sortBy,
            debouncedSearch,

            // 加载状态
            loading,

            // 分页
            currentPage,
            pageSize,
            total,
            prevPage,
            nextPage,

            // 预览
            previewOpen,
            previewItem,
            isEditing,
            editForm,
            closePreview,
            prevImage,
            nextImage,
            startEdit,
            cancelEdit,
            saveEdit,

            // 下载和删除
            onDownload,
            onDelete,
            onToggleScope,

            // 通知
            toastOpen,
            toastMessage,
            confirmOpen,
            confirmMessage,
            onConfirmYes,
            onConfirmNo,

            // 上传
            uploadOpen,
            uploading,
            uploadFile,
            uploadPreviewUrl,
            uploadError,
            uploadForm,
            availableEmotions,
            analysisScenes,
            isAnalyzing,
            openUploadModal,
            closeUploadModal,
            handleFileSelect,
            analyzeImage,
            toggleScene,
            isSceneSelected,
            submitUpload,

            // 批量上传
            batchUploadOpen,
            batchUploading,
            batchFiles,
            batchPreviews,
            batchUploadError,
            batchUploadForm,
            batchTaskId,
            batchTaskStatus,
            batchTaskTotal,
            batchTaskProcessed,
            batchTaskSuccess,
            batchTaskFailed,
            openBatchUploadModal,
            closeBatchUploadModal,
            clearBatchFiles,
            handleBatchFileSelect,
            submitBatchUpload,
            resetBatchUpload,

            // 批量操作
            isBatchMode,
            selectedImages,
            toggleBatchMode,
            toggleSelection,
            selectAll,
            handleBatchDelete,
            batchMoveOpen,
            batchTargetCategory,
            openBatchMoveModal,
            closeBatchMoveModal,
            confirmBatchMove,
            batchScopeOpen,
            batchScopeMode,
            openBatchScopeModal,
            closeBatchScopeModal,
            confirmBatchScope,

            // 分类管理
            emotionsOpen,
            newEmotion,
            addingEmotion,
            deletingEmotionKey,
            openEmotionsModal,
            closeEmotionsModal,
            addEmotion,
            deleteEmotion,
        };
    },

    template: TEMPLATE,
};

// 挂载应用
createApp(App).mount('#app');