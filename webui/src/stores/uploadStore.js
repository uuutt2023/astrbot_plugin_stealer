/**
 * @description 上传状态管理
 */
export const useUploadStore = defineStore('upload', () => {
  // === 状态 ===
  const uploadOpen = ref(false);
  const uploading = ref(false);
  const uploadFile = ref(null);
  const uploadPreviewUrl = ref(null);
  const uploadError = ref(null);
  const analysisScenes = ref([]);

  // === 表单 ===
  const uploadForm = ref({
    emotion: '',
    tags: '',
    scene: '',
    desc: '',
  });

  // === 计算属性 ===
  const hasFile = computed(() => uploadFile.value !== null);
  const isValidFile = computed(() => {
    const file = uploadFile.value;
    return file?.type?.startsWith('image/');
  });

  // === 弹窗控制 ===
  const openUploadModal = () => {
    uploadOpen.value = true;
    resetForm();
  };

  const closeUploadModal = () => {
    uploadOpen.value = false;
    uploadPreviewUrl.value = null;
    analysisScenes.value = [];
  };

  const resetForm = () => {
    uploadFile.value = null;
    uploadPreviewUrl.value = null;
    uploadError.value = null;
    uploadForm.value = {
      emotion: '',
      tags: '',
      scene: '',
      desc: '',
    };
    analysisScenes.value = [];
  };

  // === 文件处理 ===
  const setUploadFile = (file, previewUrl) => {
    uploadFile.value = file;
    uploadPreviewUrl.value = previewUrl;
    uploadError.value = null;
  };

  const setUploadError = (error) => {
    uploadError.value = error;
  };

  const setUploading = (state) => {
    uploading.value = state;
  };

  const setAnalysisScenes = (scenes) => {
    analysisScenes.value = scenes;
  };

  // === 表单更新 ===
  const updateForm = (key, value) => {
    uploadForm.value[key] = value;
  };

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
    uploadForm,

    // === 计算属性 ===
    hasFile,
    isValidFile,

    // === 方法 ===
    openUploadModal,
    closeUploadModal,
    resetForm,
    setUploadFile,
    setUploadError,
    setUploading,
    setAnalysisScenes,
    updateForm,
  };
});
