// 批量操作组合式函数
import { ref } from 'vue';

export function useBatchOperation(apiFetch, showAlert, showConfirm, fetchImages, fetchStats) {
    // 批量模式状态
    const isBatchMode = ref(false);
    const selectedImages = ref(new Set());
    const batchMoveOpen = ref(false);
    const batchTargetCategory = ref('');
    const batchScopeOpen = ref(false);
    const batchScopeMode = ref('public');

    // 切换批量模式
    const toggleBatchMode = () => {
        isBatchMode.value = !isBatchMode.value;
        selectedImages.value.clear();
    };

    // 切换选择
    const toggleSelection = (img) => {
        if (selectedImages.value.has(img.hash)) {
            selectedImages.value.delete(img.hash);
        } else {
            selectedImages.value.add(img.hash);
        }
    };

    // 全选/取消全选
    const selectAll = (images) => {
        if (selectedImages.value.size === images.length) {
            selectedImages.value.clear();
        } else {
            images.forEach((img) => selectedImages.value.add(img.hash));
        }
    };

    // 批量删除
    const handleBatchDelete = async () => {
        if (selectedImages.value.size === 0) return;
        if (!await showConfirm('确定要删除选中的 ' + selectedImages.value.size + ' 张图片吗？')) return;

        try {
            const res = await apiFetch('api/images/batch-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hashes: Array.from(selectedImages.value) }),
            });
            const data = await res.json();
            if (data.success) {
                selectedImages.value.clear();
                await fetchImages(1);
                await fetchStats();
            } else {
                showAlert(data.error || '删除失败');
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message);
        }
    };

    // 打开批量移动弹窗
    const openBatchMoveModal = () => {
        if (selectedImages.value.size === 0) return;
        batchTargetCategory.value = '';
        batchMoveOpen.value = true;
    };

    // 关闭批量移动弹窗
    const closeBatchMoveModal = () => {
        batchMoveOpen.value = false;
    };

    // 确认批量移动
    const confirmBatchMove = async () => {
        if (!batchTargetCategory.value) return;
        try {
            const res = await apiFetch('api/images/batch-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hashes: Array.from(selectedImages.value),
                    category: batchTargetCategory.value,
                }),
            });
            const data = await res.json();
            if (data.success) {
                batchMoveOpen.value = false;
                selectedImages.value.clear();
                isBatchMode.value = false;
                await fetchImages(1);
                await fetchStats();
            } else {
                showAlert(data.error || '转移失败');
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message);
        }
    };

    // 打开批量作用域弹窗
    const openBatchScopeModal = () => {
        if (selectedImages.value.size === 0) return;
        batchScopeMode.value = 'public';
        batchScopeOpen.value = true;
    };

    // 关闭批量作用域弹窗
    const closeBatchScopeModal = () => {
        batchScopeOpen.value = false;
    };

    // 确认批量作用域
    const confirmBatchScope = async () => {
        if (!batchScopeMode.value) return;
        try {
            const res = await apiFetch('api/images/batch-scope', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hashes: Array.from(selectedImages.value),
                    scope_mode: batchScopeMode.value,
                }),
            });
            const data = await res.json();
            if (data.success) {
                batchScopeOpen.value = false;
                selectedImages.value.clear();
                isBatchMode.value = false;
                await fetchImages(1);
                if (Number(data.skipped || 0) > 0) {
                    showAlert('已更新 ' + (data.count || 0) + ' 张，另有 ' + data.skipped + ' 张缺少来源群信息，无法设为 local。');
                }
            } else {
                showAlert(data.error || '作用域设置失败');
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message);
        }
    };

    return {
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
    };
}