// 上传管理组合式函数
import { ref, reactive } from 'vue';

export function useUpload(bridge, apiFetch, availableEmotions, uploadForm, showAlert) {
    // 上传状态
    const uploadOpen = ref(false);
    const uploading = ref(false);
    const uploadFile = ref(null);
    const uploadPreviewUrl = ref(null);
    const uploadError = ref(null);
    const analysisScenes = ref([]);

    // 打开上传弹窗
    const openUploadModal = () => {
        uploadOpen.value = true;
        uploadFile.value = null;
        uploadPreviewUrl.value = null;
        uploadError.value = null;
        Object.assign(uploadForm, {
            emotion: '',
            tags: '',
            scene: '',
            desc: '',
        });
        analysisScenes.value = [];
    };

    // 关闭上传弹窗
    const closeUploadModal = () => {
        uploadOpen.value = false;
        analysisScenes.value = [];
    };

    // 处理文件选择
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadFile.value = file;
            uploadPreviewUrl.value = URL.createObjectURL(file);
            uploadError.value = null;
            uploadForm.scene = '';
            analysisScenes.value = [];
        }
    };

    // 提交上传
    const submitUpload = async () => {
        if (!uploadFile.value) return;
        uploading.value = true;
        try {
            const uploadRes = await bridge.upload('images/upload', uploadFile.value);
            if (!uploadRes.success || !uploadRes.hash) {
                uploadError.value = uploadRes.error || '上传失败';
                return;
            }
            await bridge.apiPost('images/update', {
                hash: uploadRes.hash,
                category: uploadForm.emotion,
                tags: uploadForm.tags,
                scene: uploadForm.scene,
                desc: uploadForm.desc,
            });
            closeUploadModal();
            return true;
        } catch (e) {
            uploadError.value = '上传出错';
        } finally {
            uploading.value = false;
        }
        return false;
    };

    return {
        uploadOpen,
        uploading,
        uploadFile,
        uploadPreviewUrl,
        uploadError,
        analysisScenes,
        openUploadModal,
        closeUploadModal,
        handleFileSelect,
        submitUpload,
    };
}

// 批量上传组合式函数
export function useBatchUpload(apiFetch, availableEmotions, showAlert, fetchImages, fetchStats) {
    // 批量上传状态
    const batchUploadOpen = ref(false);
    const batchUploading = ref(false);
    const batchFiles = ref([]);
    const batchPreviews = ref([]);
    const batchUploadError = ref(null);
    const batchUploadForm = reactive({ emotion: '', autoAnalyze: false });
    const batchTaskId = ref(null);
    const batchTaskStatus = ref(null);
    const batchTaskTotal = ref(0);
    const batchTaskProcessed = ref(0);
    const batchTaskSuccess = ref(0);
    const batchTaskFailed = ref(0);
    let batchPollInterval = null;

    // 打开批量上传弹窗
    const openBatchUploadModal = () => {
        batchUploadOpen.value = true;
        batchFiles.value = [];
        batchPreviews.value = [];
        batchUploadError.value = null;
        batchTaskId.value = null;
        batchTaskStatus.value = null;
        Object.assign(batchUploadForm, {
            emotion: '',
            autoAnalyze: false,
        });
    };

    // 关闭批量上传弹窗
    const closeBatchUploadModal = () => {
        batchUploadOpen.value = false;
        if (batchPollInterval) {
            clearInterval(batchPollInterval);
            batchPollInterval = null;
        }
    };

    // 清除批量文件
    const clearBatchFiles = () => {
        batchFiles.value = [];
        batchPreviews.value = [];
    };

    // 处理批量文件选择
    const handleBatchFileSelect = (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;
        batchFiles.value = files;
        batchPreviews.value = files.map(f => URL.createObjectURL(f));
    };

    // 格式化批量大小
    const formatBatchSize = () => {
        const totalSize = batchFiles.value.reduce((sum, f) => sum + f.size, 0);
        if (totalSize < 1024) return totalSize + ' B';
        if (totalSize < 1024 * 1024) return (totalSize / 1024).toFixed(1) + ' KB';
        return (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // 提交批量上传
    const submitBatchUpload = async () => {
        if (batchFiles.value.length === 0) return;
        if (!batchUploadForm.emotion && !batchUploadForm.autoAnalyze) {
            batchUploadError.value = '请选择分类或启用自动识别';
            return;
        }
        batchUploading.value = true;
        batchUploadError.value = null;
        try {
            const formData = new FormData();
            for (const file of batchFiles.value) {
                formData.append('files', file);
            }
            if (batchUploadForm.emotion) {
                formData.append('category', batchUploadForm.emotion);
            }
            formData.append('auto_analyze', String(batchUploadForm.autoAnalyze));

            const res = await apiFetch('api/images/batch-upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                batchTaskId.value = data.task_id;
                batchTaskTotal.value = data.total;
                batchTaskProcessed.value = 0;
                batchTaskSuccess.value = 0;
                batchTaskFailed.value = 0;
                startBatchStatusPoll();
            } else {
                batchUploadError.value = data.error || '上传失败';
            }
        } catch (e) {
            batchUploadError.value = '上传出错';
        } finally {
            batchUploading.value = false;
        }
    };

    // 开始批量状态轮询
    const startBatchStatusPoll = () => {
        if (batchPollInterval) clearInterval(batchPollInterval);
        batchPollInterval = setInterval(async () => {
            if (!batchTaskId.value) return;
            try {
                const res = await apiFetch('api/images/batch-upload-status?task_id=' + batchTaskId.value);
                const data = await res.json();
                if (data.success) {
                    batchTaskStatus.value = data.status;
                    batchTaskProcessed.value = data.processed;
                    batchTaskSuccess.value = Number(data.success_count || 0);
                    batchTaskFailed.value = Number(data.failed_count || 0);
                    if (data.status === 'completed' || data.status === 'failed') {
                        clearInterval(batchPollInterval);
                        batchPollInterval = null;
                        if (data.status === 'completed') {
                            await fetchImages(1);
                            await fetchStats();
                        } else {
                            batchUploadError.value = data.error || '批量导入失败';
                        }
                    }
                }
            } catch (e) {
                console.error('Batch status poll error:', e);
            }
        }, 1000);
    };

    // 重置批量上传
    const resetBatchUpload = () => {
        batchTaskId.value = null;
        batchTaskStatus.value = null;
        batchFiles.value = [];
        batchPreviews.value = [];
        batchUploadError.value = null;
    };

    return {
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
        formatBatchSize,
        submitBatchUpload,
        resetBatchUpload,
    };
}