import { ref, reactive, readonly, computed, onUnmounted } from 'vue'

/**
 * @description 图片管理器 Composable
 * @param {Function} apiFetch - API 请求函数
 * @param {Object} bridge - AstrBot 桥接对象
 * @param {Object} imageDataUrls - 图片数据缓存(响应式)
 * @param {Function} loadImageData - 加载图片数据的函数
 * @param {Function} showAlert - 显示提示函数
 * @param {Function} showConfirm - 显示确认函数
 * @returns {Object} 图片管理状态和方法
 */
export function useImageManager(apiFetch, bridge, imageDataUrls, loadImageData, showAlert, showConfirm) {
  // === 状态定义 ===
  const images = ref([])
  const categories = ref([])
  const stats = ref({ total: 0, categories: 0, today: 0 })
  const loading = ref(true)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const sortBy = ref('newest')
  const currentPage = ref(1)
  const pageSize = ref(30)
  const total = ref(0)

  // 内部状态(防外部直接修改)
  const _searchTimeout = ref(null)
  const _selectedImages = ref(new Set())

  // === 计算属性 ===
  const hasImages = computed(() => images.value.length > 0)
  const hasMorePages = computed(() => currentPage.value * pageSize.value < total.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // === 私有方法 ===
  const _clearSearchTimeout = () => {
    if (_searchTimeout.value) {
      clearTimeout(_searchTimeout.value)
      _searchTimeout.value = null
    }
  }

  // === 数据获取 ===
  /**
   * @description 获取统计数据
   */
  const fetchStats = async () => {
    try {
      const res = await apiFetch('api/stats')
      const data = await res.json()
      stats.value = data.stats || {}
    } catch (e) {
      console.error('[useImageManager] fetchStats error:', e)
    }
  }

  /**
   * @description 获取图片列表
   * @param {number} [page=1] - 页码
   */
  const fetchImages = async (page = 1) => {
    loading.value = true
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize.value),
        q: searchQuery.value,
        category: selectedCategory.value,
        sort: sortBy.value
      })
      const res = await apiFetch('api/images?' + params.toString())
      const data = await res.json()
      const nextImages = data.images || []
      const nextTotal = Number(data.total || 0)
      const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize.value))

      // 自动调整到有效页码
      const targetPage = page > lastPage && nextTotal > 0 ? lastPage : page
      if (page > lastPage && nextTotal > 0) {
        return fetchImages(lastPage)
      }

      currentPage.value = targetPage
      images.value = nextImages
      nextImages.forEach(img => loadImageData(img.hash))
      total.value = nextTotal
      categories.value = data.categories || []
      return nextImages
    } catch (e) {
      console.error('[useImageManager] fetchImages error:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * @description 获取表情包列表
   * @returns {Promise<Array>}
   */
  const fetchEmotions = async () => {
    try {
      const res = await apiFetch('api/emotions')
      const data = await res.json()
      return data.emotions || []
    } catch (e) {
      console.error('[useImageManager] fetchEmotions error:', e)
      return []
    }
  }

  /**
   * @description 加载全部初始数据
   */
  const loadAll = async () => {
    await fetchStats()
    return await fetchEmotions()
  }

  // === 搜索相关 ===
  /**
   * @description 防抖搜索
   */
  const debouncedSearch = () => {
    _clearSearchTimeout()
    _searchTimeout.value = setTimeout(() => fetchImages(1), 400)
  }

  // === 分页操作 ===
  const prevPage = () => hasPrevPage.value && fetchImages(currentPage.value - 1)
  const nextPage = () => hasMorePages.value && fetchImages(currentPage.value + 1)

  // === 单个图片操作 ===
  /**
   * @description 删除图片
   * @param {Object} img - 图片对象
   * @param {boolean} [blacklist=false] - 是否拉黑
   */
  const deleteImage = async (img, blacklist = false) => {
    const msg = blacklist ? '确定要删除并拉黑这张图片吗？' : '确定要删除这张图片吗？'
    if (!await showConfirm(msg)) return false

    try {
      const res = await apiFetch('api/images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: img.hash, blacklist })
      })
      if (res.ok) {
        // 调整页码
        if (images.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        await Promise.all([fetchImages(currentPage.value), fetchStats()])
        return true
      }
      showAlert('删除失败')
    } catch (e) {
      showAlert('操作失败')
    }
    return false
  }

  /**
   * @description 切换作用域
   * @param {Object} img - 图片对象
   * @param {string} scopeMode - 作用域模式
   */
  const toggleScope = async (img, scopeMode) => {
    if (!img) return false

    try {
      const res = await apiFetch('api/images/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: img.hash, scope_mode: scopeMode })
      })
      const data = await res.json()

      if (data.success) {
        await fetchImages(currentPage.value)
        return true
      }
      if (data.error === 'Origin target missing') {
        showAlert('该图片缺少来源群信息')
      } else {
        showAlert(data.error || '作用域更新失败')
      }
    } catch (e) {
      showAlert('操作失败: ' + e.message)
    }
    return false
  }

  /**
   * @description 更新图片信息
   * @param {string} hash - 图片哈希
   * @param {Object} data - 更新数据
   */
  const updateImage = async (hash, data) => {
    try {
      const res = await apiFetch('api/images/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, ...data })
      })
      const result = await res.json()
      if (result.success) {
        await fetchImages(currentPage.value)
        return result
      }
      showAlert(result.error || '更新失败')
      return null
    } catch (e) {
      showAlert('操作失败: ' + e.message)
      return null
    }
  }

  // === 清理 ===
  onUnmounted(() => {
    _clearSearchTimeout()
  })

  return {
    // === 状态(只读+内部) ===
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

    // === 计算属性 ===
    hasImages,
    hasMorePages,
    hasPrevPage,

    // === 方法 ===
    fetchStats,
    fetchImages,
    fetchEmotions,
    loadAll,
    debouncedSearch,
    prevPage,
    nextPage,
    deleteImage,
    toggleScope,
    updateImage
  }
}