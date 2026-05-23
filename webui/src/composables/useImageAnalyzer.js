import { ref } from 'vue'

export function useImageAnalyzer(apiFetch) {
    const isAnalyzing = ref(false)

    const analyze = async (file) => {
        if (!file) throw new Error('请先选择图片')
        isAnalyzing.value = true
        try {
            const base64Data = await fileToBase64(file)
            const res = await apiFetch('api/analyze', {
                method: 'POST',
                body: JSON.stringify({ base64: base64Data }),
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error || '分析失败')
            return data
        } catch (e) {
            throw e
        } finally {
            isAnalyzing.value = false
        }
    }

    const applyToForm = (data, form, categories = []) => {
        const result = { filled: false, fields: [] }
        if (data.category) {
            const exists = categories.some(e => e.key === data.category)
            if (exists) {
                form.emotion = data.category
                result.fields.push('category')
            }
        }
        if (data.description && !form.desc) {
            form.desc = data.description
            result.fields.push('desc')
        }
        result.filled = result.fields.length > 0
        return result
    }

    return { isAnalyzing, analyze, applyToForm }
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
})