import { ref, reactive } from 'vue'

export function useEmotionManager(apiFetch, showAlert, showConfirm) {
    const emotionsOpen = ref(false)
    const availableEmotions = ref([])
    const newEmotion = reactive({ key: '', name: '', desc: '' })
    const addingEmotion = ref(false)
    const deletingEmotionKey = ref('')

    const openEmotionsModal = () => { emotionsOpen.value = true }
    const closeEmotionsModal = () => { emotionsOpen.value = false }

    const fetchEmotions = async () => {
        try {
            const res = await apiFetch('api/emotions')
            const data = await res.json()
            availableEmotions.value = data.emotions || []
            return availableEmotions.value
        } catch (e) {
            return []
        }
    }

    const addEmotion = async () => {
        const key = String(newEmotion.key || '').trim()
        if (!key) return
        addingEmotion.value = true
        try {
            const newCat = { key, name: String(newEmotion.name || '').trim(), desc: String(newEmotion.desc || '').trim() }
            const currentList = [...availableEmotions.value]
            const existingIdx = currentList.findIndex((c) => c.key === newCat.key)
            if (existingIdx >= 0) {
                if (!await showConfirm('分类 ' + newCat.key + ' 已存在，确定要更新吗？')) {
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
                body: JSON.stringify({ categories: currentList }),
            })
            const data = await res.json()
            if (data.success) {
                await fetchEmotions()
                newEmotion.key = ''
                newEmotion.name = ''
                newEmotion.desc = ''
                return true
            } else {
                showAlert(data.error || '添加失败')
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message)
        } finally {
            addingEmotion.value = false
        }
        return false
    }

    const deleteEmotion = async (cat) => {
        if (!cat?.key) return
        if (!await showConfirm('确定要删除分类 ' + cat.key + ' 吗？')) return
        deletingEmotionKey.value = cat.key
        try {
            const res = await apiFetch('api/categories/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: cat.key }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok && data.success) {
                await fetchEmotions()
                return true
            } else {
                showAlert(data.error || '删除失败')
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message)
        } finally {
            deletingEmotionKey.value = ''
        }
        return false
    }

    return {
        emotionsOpen, availableEmotions, newEmotion, addingEmotion, deletingEmotionKey,
        openEmotionsModal, closeEmotionsModal, fetchEmotions, addEmotion, deleteEmotion
    }
}