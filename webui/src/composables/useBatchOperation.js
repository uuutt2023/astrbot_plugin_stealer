import { ref, reactive, readonly, computed, onUnmounted } from 'vue'

/**
 * @description 批量操作 Composable
 * @param {Function} apiFetch - API 请求函数
 * @param {Function} showAlert - 显示提示函数
 * @param {Function} showConfirm - 显示确认函数
 * @param {Function} fetchImages - 获取图片列表函数
 * @param {Function} fetchStats - 获取统计函数
 * @returns {Object} 批量操作状态和方法
 */
export function useBatchOperation(apiFetch, showAlert, showConfirm, fetchImages, fetchStats) {
  // === 状态 ===
  const isBatchMode = ref(false)
  const selectedImages = ref(new Set())
  const batchMoveOpen = ref(false)
  const batchTargetCategory = ref('')
  const batchScopeOpen = ref(false)
  const batchScopeMode = ref('public')

  // === 计算属性 ===
  const selectedCount = computed(() => selectedImages.value.size)
  const hasSelection = computed(() => selectedImages.value.size > 0)

  // === 批量选择 ===
  /**
   * @description 切换批量选择模式
   */
  const toggleBatchMode = () => {
    isBatchMode.value = !isBatchMode.value
    if (isBatchMode.value) {
      selectedImages.value = new Set()
    }
  }

  /**
   * @description 切换单个图片选中状态
   * @param {Object} img - 图片对象
   */
  const toggleSelection = (img) => {
    if (!img?.hash) return
    const newSet = new Set(selectedImages.value)
    if (newSet.has(img.hash)) {
      newSet.delete(img.hash)
    } else {
      newSet.add(img.hash)
    }
    selectedImages.value = newSet
  }

  /**
   * @description 全选/取消全选
   * @param {Array} images - 图片列表
   */
  const selectAll = (images) => {
    if (!images?.length) return

    if (selectedImages.value.size === images.length) {
      selectedImages.value = new Set()
    } else {
      selectedImages.value = new Set(images.map(img => img.hash))
    }
  }

  /**
   * @description 清除选中
   */
  const clearSelection = () => {
    selectedImages.value = new Set()
  }

  // === 批量删除 ===
  /**
   * @description 批量删除图片
   */
  const handleBatchDelete = async () => {
    if (!hasSelection.value) return
    const count = selectedImages.value.size

    if (!await showConfirm(`确定要删除选中的 ${count} 张图片吗？`)) return

    try {
      const res = await apiFetch('api/images/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashes: Array.from(selectedImages.value) })
      })
      const data = await res.json()

      if (data.success) {
        clearSelection()
        await Promise.all([fetchImages(1), fetchStats()])
        return true
      }
      showAlert(data.error || '删除失败')
    } catch (e) {
      showAlert('操作失败: ' + e.message)
    }
    return false
  }

  // === 批量移动 ===
  /**
   * @description 打开批量移动弹窗
   */
  const openBatchMoveModal = () => {
    if (!hasSelection.value) return
    batchTargetCategory.value = ''
    batchMoveOpen.value = true
  }

  /**
   * @description 关闭批量移动弹窗
   */
  const closeBatchMoveModal = () => {
    batchMoveOpen.value = false
  }

  /**
   * @description 确认批量移动
   */
  const confirmBatchMove = async () => {
    if (!batchTargetCategory.value) return

    try {
      const res = await apiFetch('api/images/batch-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashes: Array.from(selectedImages.value),
          category: batchTargetCategory.value
        })
      })
      const data = await res.json()

      if (data.success) {
        batchMoveOpen.value = false
        clearSelection()
        isBatchMode.value = false
        await Promise.all([fetchImages(1), fetchStats()])
        return true
      }
      showAlert(data.error || '转移失败')
    } catch (e) {
      showAlert('操作失败: ' + e.message)
    }
    return false
  }

  // === 批量作用域 ===
  /**
   * @description 打开批量作用域弹窗
   */
  const openBatchScopeModal = () => {
    if (!hasSelection.value) return
    batchScopeMode.value = 'public'
    batchScopeOpen.value = true
  }

  /**
   * @description 关闭批量作用域弹窗
   */
  const closeBatchScopeModal = () => {
    batchScopeOpen.value = false
  }

  /**
   * @description 确认批量作用域设置
   */
  const confirmBatchScope = async () => {
    try {
      const res = await apiFetch('api/images/batch-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashes: Array.from(selectedImages.value),
          scope_mode: batchScopeMode.value
        })
      })
      const data = await res.json()

      if (data.success) {
        batchScopeOpen.value = false
        clearSelection()
        isBatchMode.value = false
        await fetchImages(1)
        return true
      }
      showAlert(data.error || '作用域设置失败')
    } catch (e) {
      showAlert('操作失败: ' + e.message)
    }
    return false
  }

  // === 清理 ===
  onUnmounted(() => {
    clearSelection()
  })

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
    toggleSelection,
    selectAll,
    clearSelection,
    handleBatchDelete,
    openBatchMoveModal,
    closeBatchMoveModal,
    confirmBatchMove,
    openBatchScopeModal,
    closeBatchScopeModal,
    confirmBatchScope
  }
}