import { ref, reactive, readonly, onUnmounted } from 'vue'

/**
 * @description 表情包分类管理 Composable
 * @param {Function} apiFetch - API 请求函数
 * @param {Function} showAlert - 显示提示函数
 * @param {Function} showConfirm - 显示确认函数
 * @returns {Object} 分类管理状态和方法
 */
export function useEmotionManager(apiFetch, showAlert, showConfirm) {
  // === 状态 ===
  const emotionsOpen = ref(false)
  const availableEmotions = ref([])
  const newEmotion = reactive({ key: '', name: '', desc: '' })
  const addingEmotion = ref(false)
  const deletingEmotionKey = ref('')

  // === 弹窗控制 ===
  /**
   * @description 打开分类弹窗
   */
  const openEmotionsModal = () => {
    emotionsOpen.value = true
  }

  /**
   * @description 关闭分类弹窗
   */
  const closeEmotionsModal = () => {
    emotionsOpen.value = false
    _resetNewEmotion()
  }

  /**
   * @description 重置新增表单
   */
  const _resetNewEmotion = () => {
    newEmotion.key = ''
    newEmotion.name = ''
    newEmotion.desc = ''
  }

  // === 数据操作 ===
  /**
   * @description 获取分类列表
   * @returns {Promise<Array>}
   */
  const fetchEmotions = async () => {
    try {
      const res = await apiFetch('api/emotions')
      const data = await res.json()
      availableEmotions.value = data.emotions || []
      return availableEmotions.value
    } catch (e) {
      console.error('[useEmotionManager] fetchEmotions error:', e)
      return []
    }
  }

  /**
   * @description 添加/更新分类
   * @returns {Promise<boolean>}
   */
  const addEmotion = async () => {
    const key = String(newEmotion.key || '').trim()
    if (!key) return false

    addingEmotion.value = true
    try {
      const newCat = {
        key,
        name: String(newEmotion.name || '').trim(),
        desc: String(newEmotion.desc || '').trim()
      }
      const currentList = [...availableEmotions.value]
      const existingIdx = currentList.findIndex(c => c.key === newCat.key)

      if (existingIdx >= 0) {
        const confirmed = await showConfirm(`分类 ${newCat.key} 已存在，确定要更新吗？`)
        if (!confirmed) {
          addingEmotion.value = false
          return false
        }
        currentList[existingIdx] = newCat
      } else {
        currentList.push(newCat)
      }

      const res = await apiFetch('api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: currentList })
      })
      const data = await res.json()

      if (data.success) {
        await fetchEmotions()
        _resetNewEmotion()
        return true
      }
      showAlert(data.error || '添加失败')
    } catch (e) {
      showAlert('操作失败: ' + e.message)
    } finally {
      addingEmotion.value = false
    }
    return false
  }

  /**
   * @description 删除分类
   * @param {Object} cat - 分类对象
   * @returns {Promise<boolean>}
   */
  const deleteEmotion = async (cat) => {
    if (!cat?.key) return false

    const confirmed = await showConfirm(`确定要删除分类 ${cat.key} 吗？`)
    if (!confirmed) return false

    deletingEmotionKey.value = cat.key
    try {
      const res = await apiFetch('api/categories/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cat.key })
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data.success) {
        await fetchEmotions()
        return true
      }
      showAlert(data.error || '删除失败')
    } catch (e) {
      showAlert('操作失败: ' + e.message)
    } finally {
      deletingEmotionKey.value = ''
    }
    return false
  }

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
    fetchEmotions,
    addEmotion,
    deleteEmotion
  }
}