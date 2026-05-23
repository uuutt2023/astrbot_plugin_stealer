import { ref } from 'vue'

export function useUpload(bridge, apiFetch, uploadForm, showAlert) {
    const uploadOpen = ref(false)
    const uploading = ref(false)
    const uploadFile = ref(null)
    const uploadPreviewUrl = ref(null)
    const uploadError = ref(null)
    const analysisScenes = ref([])

    const openUploadModal = () => {
        uploadOpen.value = true
        uploadFile.value = null
        uploadPreviewUrl.value = null
        uploadError.value = null
        Object.assign(uploadForm, { emotion: '', tags: '', scene: '', desc: '' })
        analysisScenes.value = []
    }

    const closeUploadModal = () => {
        uploadOpen.value = false
        analysisScenes.value = []
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file?.type.startsWith('image/')) {
            uploadFile.value = file
            uploadPreviewUrl.value = URL.createObjectURL(file)
            uploadError.value = null
        }
    }

    const submitUpload = async () => {
        if (!uploadFile.value) return
        uploading.value = true
        try {
            const uploadRes = await bridge.upload('images/upload', uploadFile.value)
            if (!uploadRes.success || !uploadRes.hash) {
                uploadError.value = uploadRes.error || '上传失败'
                return
            }
            await bridge.apiPost('images/update', {
                hash: uploadRes.hash,
                category: uploadForm.emotion,
                desc: uploadForm.desc,
            })
            closeUploadModal()
            return true
        } catch (e) {
            uploadError.value = '上传出错'
        } finally {
            uploading.value = false
        }
        return false
    }

    return {
        uploadOpen, uploading, uploadFile, uploadPreviewUrl, uploadError, analysisScenes,
        openUploadModal, closeUploadModal, handleFileSelect, submitUpload
    }
}