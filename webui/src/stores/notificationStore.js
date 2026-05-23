/**
 * @description 通知状态管理
 */
export const useNotificationStore = defineStore('notification', () => {
  // === 状态 ===
  const toastOpen = ref(false);
  const toastMessage = ref('');
  const confirmOpen = ref(false);
  const confirmMessage = ref('');

  let _confirmResolver = null;
  let _toastTimer = null;

  // === Toast 通知 ===
  const showAlert = (msg, duration = 3000) => {
    toastMessage.value = msg;
    toastOpen.value = true;
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
      toastOpen.value = false;
    }, duration);
  };

  const closeToast = () => {
    toastOpen.value = false;
    if (_toastTimer) {
      clearTimeout(_toastTimer);
      _toastTimer = null;
    }
  };

  // === Confirm 对话框 ===
  const showConfirm = (msg) => {
    return new Promise((resolve) => {
      confirmMessage.value = msg;
      confirmOpen.value = true;
      _confirmResolver = resolve;
    });
  };

  const onConfirmYes = () => {
    confirmOpen.value = false;
    _confirmResolver?.(true);
    _confirmResolver = null;
  };

  const onConfirmNo = () => {
    confirmOpen.value = false;
    _confirmResolver?.(false);
    _confirmResolver = null;
  };

  return {
    // === 状态 ===
    toastOpen: readonly(toastOpen),
    _toastOpen: toastOpen,
    toastMessage: readonly(toastMessage),
    confirmOpen: readonly(confirmOpen),
    _confirmOpen: confirmOpen,
    confirmMessage: readonly(confirmMessage),

    // === 方法 ===
    showAlert,
    closeToast,
    showConfirm,
    onConfirmYes,
    onConfirmNo,
  };
});
