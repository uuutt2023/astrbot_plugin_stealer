/**
 * @description 应用级状态管理
 */
export const useAppStore = defineStore('app', () => {
  // === 状态 ===
  const loginState = ref('loading');
  const loginError = ref('');
  const isDarkTheme = ref(true);
  const previewOpen = ref(false);
  const previewItem = ref(null);
  const isEditing = ref(false);

  // === 桥接 ===
  const bridge = ref(null);
  const apiFetch = ref(null);

  // === 初始化 ===
  const initBridge = (bridgeInstance) => {
    bridge.value = bridgeInstance;
  };

  // === 登录 ===
  const setLoginState = (state, error = '') => {
    loginState.value = state;
    loginError.value = error;
  };

  const handleLoginSubmit = () => {
    const hasBridge = !!bridge.value;
    loginState.value = hasBridge ? 'success' : 'form';
    loginError.value = hasBridge ? '' : '未检测到 AstrBot 桥接环境';
    if (hasBridge) {
      setTimeout(() => {
        loginState.value = 'loggedIn';
      }, 800);
    }
  };

  // === 主题 ===
  const initTheme = () => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved !== null) {
        isDarkTheme.value = saved === 'dark';
      }
    } catch (e) {
      // localStorage not available in sandboxed environment
    }
    applyTheme();
  };

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
    try {
      localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
    } catch (e) {
      // localStorage not available in sandboxed environment
    }
    applyTheme();
  };

  // === 预览 ===
  const openPreview = (item) => {
    previewItem.value = item;
    previewOpen.value = true;
    isEditing.value = false;
  };

  const closePreview = () => {
    previewOpen.value = false;
    previewItem.value = null;
    isEditing.value = false;
  };

  const startEdit = () => {
    isEditing.value = true;
  };

  const cancelEdit = () => {
    isEditing.value = false;
  };

  const updatePreviewItem = (newItem) => {
    previewItem.value = newItem;
  };

  return {
    // === 状态（只读+可写） ===
    loginState: readonly(loginState),
    _loginState: loginState,
    loginError: readonly(loginError),
    isDarkTheme: readonly(isDarkTheme),
    _isDarkTheme: isDarkTheme,
    previewOpen: readonly(previewOpen),
    _previewOpen: previewOpen,
    previewItem: readonly(previewItem),
    _previewItem: previewItem,
    isEditing: readonly(isEditing),
    _isEditing: isEditing,

    // === 桥接 ===
    bridge,
    apiFetch,

    // === 方法 ===
    initBridge,
    setLoginState,
    handleLoginSubmit,
    initTheme,
    toggleTheme,
    openPreview,
    closePreview,
    startEdit,
    cancelEdit,
    updatePreviewItem,
  };
});
