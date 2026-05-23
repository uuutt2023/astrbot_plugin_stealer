/**
 * @description 表情分类状态管理
 */
export const useEmotionStore = defineStore('emotion', () => {
  // === 状态 ===
  const emotionsOpen = ref(false);
  const availableEmotions = ref([]);
  const newEmotion = ref({ key: '', name: '', desc: '' });
  const addingEmotion = ref(false);
  const deletingEmotionKey = ref('');

  // === 弹窗控制 ===
  const openEmotionsModal = () => {
    emotionsOpen.value = true;
  };

  const closeEmotionsModal = () => {
    emotionsOpen.value = false;
    resetNewEmotion();
  };

  const resetNewEmotion = () => {
    newEmotion.value = { key: '', name: '', desc: '' };
  };

  // === 分类操作 ===
  const setAvailableEmotions = (emotions) => {
    availableEmotions.value = emotions;
  };

  const setAddingEmotion = (state) => {
    addingEmotion.value = state;
  };

  const setDeletingEmotionKey = (key) => {
    deletingEmotionKey.value = key;
  };

  const updateNewEmotion = (key, value) => {
    newEmotion.value[key] = value;
  };

  return {
    // === 状态 ===
    emotionsOpen: readonly(emotionsOpen),
    _emotionsOpen: emotionsOpen,
    availableEmotions: readonly(availableEmotions),
    _availableEmotions: availableEmotions,
    newEmotion,
    addingEmotion: readonly(addingEmotion),
    deletingEmotionKey: readonly(deletingEmotionKey),

    // === 方法 ===
    openEmotionsModal,
    closeEmotionsModal,
    resetNewEmotion,
    setAvailableEmotions,
    setAddingEmotion,
    setDeletingEmotionKey,
    updateNewEmotion,
  };
});
