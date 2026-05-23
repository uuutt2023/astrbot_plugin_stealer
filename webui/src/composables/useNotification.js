import { ref, readonly, onUnmounted } from 'vue'

/**
 * @description 通知系统 Composable
 * @returns {Object} 包含 toast 和 confirm 功能的响应式状态和方法
 */
export function useNotification() {
  // 内部状态
  const _toastOpen = ref(false)
  const _toastMessage = ref('')
  const _confirmOpen = ref(false)
  const _confirmMessage = ref('')
  let _confirmResolver = null

  // 自动清理
  let _toastTimer = null
  onUnmounted(() => {
    if (_toastTimer) clearTimeout(_toastTimer)
  })

  /**
   * @description 显示提示消息
   * @param {string} msg - 消息内容
   * @param {number} [duration=3000] - 显示时长(ms)
   */
  const showAlert = (msg, duration = 3000) => {
    _toastMessage.value = msg
    _toastOpen.value = true
    if (_toastTimer) clearTimeout(_toastTimer)
    _toastTimer = setTimeout(() => {
      _toastOpen.value = false
    }, duration)
  }

  /**
   * @description 显示确认对话框
   * @param {string} msg - 确认消息内容
   * @returns {Promise<boolean>} 用户选择结果
   */
  const showConfirm = (msg) => {
    return new Promise((resolve) => {
      _confirmMessage.value = msg
      _confirmOpen.value = true
      _confirmResolver = resolve
    })
  }

  /**
   * @description 确认对话框-确定
   */
  const onConfirmYes = () => {
    _confirmOpen.value = false
    _confirmResolver?.(true)
    _confirmResolver = null
  }

  /**
   * @description 确认对话框-取消
   */
  const onConfirmNo = () => {
    _confirmOpen.value = false
    _confirmResolver?.(false)
    _confirmResolver = null
  }

  return {
    // 只读状态 - 防止外部直接修改
    toastOpen: readonly(_toastOpen),
    toastMessage: readonly(_toastMessage),
    confirmOpen: readonly(_confirmOpen),
    confirmMessage: readonly(_confirmMessage),
    // 可修改状态
    _toastOpen,
    _confirmOpen,
    _confirmMessage,
    // 方法
    showAlert,
    showConfirm,
    onConfirmYes,
    onConfirmNo
  }
}