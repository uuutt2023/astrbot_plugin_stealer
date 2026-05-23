import { ref, reactive, readonly, computed, onUnmounted } from 'vue'

/**
 * @description 上传管理 Composable
 * @param {Object} bridge - AstrBot 桥接对象
 * @param {Function} apiFetch - API 请求函数
 * @param {Object} uploadForm - 上传表单(响应式对象)
 * @param {Function} showAlert - 显示提示函数
 * @returns {Object} 上传状态和方法
 */
export function useUpload(bridge, apiFetch, uploadForm, showAlert) {
  // === 状态 ===
  const uploadOpen = ref(false)
  const uploading = ref(false)
  const uploadFile = ref(null)
  const uploadPreviewUrl = ref(null)
  const uploadError = ref(null)
  const analysisScenes = ref([])

  // 内部状态
  let _previewObjectUrl = null

  // === 计算属性 ===
  const hasFile = computed(() => uploadFile.value !== null)
  const isValidFile = computed(() => {
    const file = uploadFile.value
    return file?.type?.startsWith('image/')
  })

  // === 弹窗控制 ===
  /**
   * @description 打开上传弹窗
   */
  const openUploadModal = () => {
    uploadOpen.value = true
    _resetForm()
  }

  /**
   * @description 关闭上传弹窗
   */
  const closeUploadModal = () => {
    uploadOpen.value = false
    _clearPreview()
    analysisScenes.value = []
  }

  /**
   * @description 重置表单
   */
  const _resetForm = () => {
    uploadFile.value = null
    uploadPreviewUrl.value = null
    uploadError.value = null
    uploadForm.emotion = ''
    uploadForm.tags = ''
    uploadForm.scene = ''
    uploadForm.desc = ''
    analysisScenes.value = []
  }

  /**
   * @description 清除预览
   */
  const _clearPreview = () => {
    if (_previewObjectUrl) {
      URL.revokeObjectURL(_previewObjectUrl)
      _previewObjectUrl = null
    }
    uploadPreviewUrl.value = null
  }

  // === 文件处理 ===
  /**
   * @description 处理文件选择
   * @param {Event} e - 事件对象
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      uploadError.value = '请选择图片文件'
      return
    }

    // 清理旧预览
    _clearPreview()

    uploadFile.value = file
    _previewObjectUrl = URL.createObjectURL(file)
    uploadPreviewUrl.value = _previewObjectUrl
    uploadError.value = null
  }

  // === 上传 ===
  /**
   * @description 提交上传
   * @returns {Promise<boolean>}
   */
  const submitUpload = async () => {
    if (!uploadFile.value) {
      uploadError.value = '请选择图片'
      return false
    }

    uploading.value = true
    uploadError.value = null

    try {
      // 1. 上传图片
      const uploadRes = await bridge.upload('images/upload', uploadFile.value)
      if (!uploadRes.success || !uploadRes.hash) {
        uploadError.value = uploadRes.error || '上传失败'
        return false
      }

      // 2. 更新元数据
      await bridge.apiPost('images/update', {
        hash: uploadRes.hash,
        category: uploadForm.emotion,
        desc: uploadForm.desc
      })

      closeUploadModal()
      return true
    } catch (e) {
      uploadError.value = '上传出错: ' + e.message
      return false
    } finally {
      uploading.value = false
    }
  }

  // === 清理 ===
  onUnmounted(() => {
    _clearPreview()
  })

  return {
    // === 状态 ===
    uploadOpen: readonly(uploadOpen),
    _uploadOpen: uploadOpen,
    uploading: readonly(uploading),
    uploadFile: readonly(uploadFile),
    _uploadFile: uploadFile,
    uploadPreviewUrl: readonly(uploadPreviewUrl),
    uploadError: readonly(uploadError),
    analysisScenes: readonly(analysisScenes),

    // === 计算属性 ===
    hasFile,
    isValidFile,

    // === 方法 ===
    openUploadModal,
    closeUploadModal,
    handleFileSelect,
    submitUpload
  }
}