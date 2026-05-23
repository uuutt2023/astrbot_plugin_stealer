/**
 * @description 图片管理状态管理
 */
export const useImageStore = defineStore('image', () => {
  // === 状态 ===
  const images = ref([]);
  const categories = ref([]);
  const stats = ref({ total: 0, categories: 0, today: 0 });
  const loading = ref(true);
  const searchQuery = ref('');
  const selectedCategory = ref('');
  const sortBy = ref('newest');
  const currentPage = ref(1);
  const pageSize = ref(30);
  const total = ref(0);
  const imageDataUrls = ref({});

  // === 计算属性 ===
  const hasImages = computed(() => images.value.length > 0);
  const hasMorePages = computed(() => currentPage.value * pageSize.value < total.value);
  const hasPrevPage = computed(() => currentPage.value > 1);

  // === 图片数据加载 ===
  const loadImageData = async (hash, apiFetchFn) => {
    if (!hash || imageDataUrls.value[hash]) return;
    try {
      const response = await apiFetchFn('image-data', { hash });
      const data = await response.json();
      if (data?.url) {
        imageDataUrls.value[hash] = data.url;
      }
    } catch (e) {
      console.error('Load image failed:', hash, e);
    }
  };

  const loadAllImageData = async (apiFetchFn) => {
    for (const img of images.value) {
      await loadImageData(img.hash, apiFetchFn);
    }
  };

  // === 数据设置 ===
  const setImages = (newImages) => {
    images.value = newImages;
  };

  const setCategories = (newCategories) => {
    categories.value = newCategories;
  };

  const setStats = (newStats) => {
    stats.value = newStats;
  };

  const setLoading = (state) => {
    loading.value = state;
  };

  const setTotal = (newTotal) => {
    total.value = newTotal;
  };

  const setCurrentPage = (page) => {
    currentPage.value = page;
  };

  // === 搜索/筛选 ===
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  const setSelectedCategory = (category) => {
    selectedCategory.value = category;
  };

  const setSortBy = (sort) => {
    sortBy.value = sort;
  };

  // === 清理 ===
  const clearImages = () => {
    images.value = [];
    currentPage.value = 1;
  };

  const resetFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = '';
    sortBy.value = 'newest';
    currentPage.value = 1;
  };

  return {
    // === 状态 ===
    images: readonly(images),
    _images: images,
    categories: readonly(categories),
    _categories: categories,
    stats: readonly(stats),
    loading: readonly(loading),
    _loading: loading,
    searchQuery,
    selectedCategory,
    sortBy,
    currentPage: readonly(currentPage),
    _currentPage: currentPage,
    pageSize: readonly(pageSize),
    total: readonly(total),
    _total: total,
    imageDataUrls: readonly(imageDataUrls),
    _imageDataUrls: imageDataUrls,

    // === 计算属性 ===
    hasImages,
    hasMorePages,
    hasPrevPage,

    // === 方法 ===
    loadImageData,
    loadAllImageData,
    setImages,
    setCategories,
    setStats,
    setLoading,
    setTotal,
    setCurrentPage,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    clearImages,
    resetFilters,
  };
});
