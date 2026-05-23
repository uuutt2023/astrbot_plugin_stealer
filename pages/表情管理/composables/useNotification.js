// 通知管理组合式函数
import { ref } from 'vue';

export function useNotification() {
    // Toast 通知
    const toastOpen = ref(false);
    const toastMessage = ref('');
    let toastTimer = null;

    const showAlert = (msg) => {
        toastMessage.value = msg;
        toastOpen.value = true;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastOpen.value = false; }, 3000);
    };

    // 自定义确认对话框
    const confirmOpen = ref(false);
    const confirmMessage = ref('');
    let confirmResolve = null;

    const showConfirm = (msg) => new Promise((resolve) => {
        confirmMessage.value = msg;
        confirmOpen.value = true;
        confirmResolve = resolve;
    });

    const onConfirmYes = () => { confirmOpen.value = false; confirmResolve?.(true); };
    const onConfirmNo = () => { confirmOpen.value = false; confirmResolve?.(false); };

    return {
        toastOpen,
        toastMessage,
        showAlert,
        confirmOpen,
        confirmMessage,
        showConfirm,
        onConfirmYes,
        onConfirmNo,
    };
}