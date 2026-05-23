import { ref, readonly, onUnmounted } from 'vue'

/**
 * @description 图片分析 Composable
 * @param {Function} apiFetch - API 请求函数
 * @returns {Object} 图片分析状态和方法
 */
export function useImageAnalyzer(apiFetch) {
  // === 状态 ===
  const isAnalyzing = ref(false)
  const analysisResult = ref(null)
  const analysisError = ref(null)

  // === 工具函数 ===
  /**
   * @description 文件转 Base64
   * @param {File} file - 文件对象
   * @returns {Promise<string>}
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }

  // === 分析操作 ===
  /**
   * @description 分析图片
   * @param {File} file - 图片文件
   * @returns {Promise<Object>} 分析结果
   * @throws {Error} 当文件无效或分析失败时
   */
  const analyze = async (file) => {
    if (!file) {
      throw new Error('请先选择图片')
    }

    isAnalyzing.value = true
    analysisError.value = null
    analysisResult.value = null

    try {
      const base64Data = await fileToBase64(file)
      const res = await apiFetch('api/analyze', {
        method: 'POST',
        body: JSON.stringify({ base64: base64Data })
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || '分析失败')
      }

      analysisResult.value = data
      return data
    } catch (e) {
      analysisError.value = e.message
      throw e
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * @description 应用分析结果到表单
   * @param {Object} data - 分析结果数据
   * @param {Object} form - 表单对象
   * @param {Array} [categories=[]] - 可用分类列表
   * @returns {Object} 填充结果
   */
  const applyToForm = (data, form, categories = []) => {
    const result = {
      filled: false,
      fields: []
    }

    // 分类匹配
    if (data.category) {
      const exists = categories.some(e => e.key === data.category)
      if (exists) {
        form.emotion = data.category
        result.fields.push('category')
      }
    }

    // 描述填充
    if (data.description && !form.desc) {
      form.desc = data.description
      result.fields.push('desc')
    }

    result.filled = result.fields.length > 0
    return result
  }

  /**
   * @description 清除分析结果
   */
  const clearResult = () => {
    analysisResult.value = null
    analysisError.value = null
  }

  // === 清理 ===
  onUnmounted(() => {
    clearResult()
  })

  return {
    // === 状态 ===
    isAnalyzing: readonly(isAnalyzing),
    analysisResult: readonly(analysisResult),
    analysisError: readonly(analysisError),

    // === 方法 ===
    analyze,
    applyToForm,
    clearResult
  }
}