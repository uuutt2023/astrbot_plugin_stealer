import { ref } from 'vue'

export function useNotification() {
    const toastOpen = ref(false)
    const toastMessage = ref('')
    const confirmOpen = ref(false)
    const confirmMessage = ref('')
    let confirmResolve = null

    const showAlert = (msg) => {
        toastMessage.value = msg
        toastOpen.value = true
        setTimeout(() => { toastOpen.value = false }, 3000)
    }

    const showConfirm = (msg) => {
        return new Promise((resolve) => {
            confirmMessage.value = msg
            confirmOpen.value = true
            confirmResolve = resolve
        })
    }

    const onConfirmYes = () => {
        confirmOpen.value = false
        confirmResolve?.(true)
    }

    const onConfirmNo = () => {
        confirmOpen.value = false
        confirmResolve?.(false)
    }

    return {
        toastOpen, toastMessage, showAlert,
        confirmOpen, confirmMessage, showConfirm,
        onConfirmYes, onConfirmNo
    }
}