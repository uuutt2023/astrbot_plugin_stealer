/**
 * @description 批量操作状态管理
 */
export const useBatchStore = defineStore('batch', () => {
  // === 状态 ===
  const isBatchMode = ref(false);
  const selectedImages = ref(new Set());
  const batchMoveOpen = ref(false);
  const batchTargetCategory = ref('');
  const batchScopeOpen = ref(false);
  const batchScopeMode = ref('public');

  // === 计算属性 ===
  const selectedCount = computed(() => selectedImages.value.size);
  const hasSelection = computed(() => selectedImages.value.size > 0);

  // === 模式切换 ===
  const toggleBatchMode = () => {
    isBatchMode.value = !isBatchMode.value;
    if (isBatchMode.value) {
      selectedImages.value = new Set();
    }
  };

  const exitBatchMode = () => {
    isBatchMode.value = false;
    clearSelection();
  };

  // === 选择操作 ===
  const toggleSelection = (hash) => {
    if (!hash) return;
    const newSet = new Set(selectedImages.value);
    if (newSet.has(hash)) {
      newSet.delete(hash);
    } else {
      newSet.add(hash);
    }
    selectedImages.value = newSet;
  };

  const selectAll = (images) => {
    if (!images?.length) return;
    if (selectedImages.value.size === images.length) {
      selectedImages.value = new Set();
    } else {
      selectedImages.value = new Set(images.map((img) => img.hash));
    }
  };

  const clearSelection = () => {
    selectedImages.value = new Set();
  };

  // === 批量移动弹窗 ===
  const openBatchMoveModal = () => {
    if (!hasSelection.value) return;
    batchTargetCategory.value = '';
    batchMoveOpen.value = true;
  };

  const closeBatchMoveModal = () => {
    batchMoveOpen.value = false;
  };

  const setBatchTargetCategory = (category) => {
    batchTargetCategory.value = category;
  };

  // === 批量作用域弹窗 ===
  const openBatchScopeModal = () => {
    if (!hasSelection.value) return;
    batchScopeMode.value = 'public';
    batchScopeOpen.value = true;
  };

  const closeBatchScopeModal = () => {
    batchScopeOpen.value = false;
  };

  const setBatchScopeMode = (mode) => {
    batchScopeMode.value = mode;
  };

  return {
    // === 状态 ===
    isBatchMode: readonly(isBatchMode),
    _isBatchMode: isBatchMode,
    selectedImages: readonly(selectedImages),
    _selectedImages: selectedImages,
    batchMoveOpen: readonly(batchMoveOpen),
    _batchMoveOpen: batchMoveOpen,
    batchTargetCategory,
    batchScopeOpen: readonly(batchScopeOpen),
    _batchScopeOpen: batchScopeOpen,
    batchScopeMode,

    // === 计算属性 ===
    selectedCount,
    hasSelection,

    // === 方法 ===
    toggleBatchMode,
    exitBatchMode,
    toggleSelection,
    selectAll,
    clearSelection,
    openBatchMoveModal,
    closeBatchMoveModal,
    setBatchTargetCategory,
    openBatchScopeModal,
    closeBatchScopeModal,
    setBatchScopeMode,
  };
});
