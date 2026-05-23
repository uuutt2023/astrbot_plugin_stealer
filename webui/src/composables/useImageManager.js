import { ref } from 'vue'
import { parseSceneList } from '../utils/format.js'

export function useImageManager(apiFetch, bridge, imageDataUrls, loadImageData, showAlert, showConfirm) {
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
    const searchTimeout = ref(null)

    const fetchStats = async () => {
        try {
            const res = await apiFetch('api/stats')
            const data = await res.json()
            stats.value = data.stats || {}
        } catch (e) {
            console.error(e)
        }
    }

    const fetchImages = async (page = 1) => {
        loading.value = true
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: pageSize.value.toString(),
                q: searchQuery.value,
                category: selectedCategory.value,
                sort: sortBy.value,
            })
            const res = await apiFetch('api/images?' + params.toString())
            const data = await res.json()
            const nextImages = data.images || []
            const nextTotal = Number(data.total || 0)
            const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize.value))

            if (page > lastPage && nextTotal > 0) {
                return await fetchImages(lastPage)
            }

            currentPage.value = page
            images.value = nextImages
            nextImages.forEach(img => loadImageData(img.hash))
            total.value = nextTotal
            categories.value = data.categories || []
            return nextImages
        } catch (e) {
            console.error(e)
            return []
        } finally {
            loading.value = false
        }
    }

    const fetchEmotions = async () => {
        try {
            const res = await apiFetch('api/emotions')
            const data = await res.json()
            return data.emotions || []
        } catch (e) {
            return []
        }
    }

    const loadAll = async () => {
        await fetchStats()
        return await fetchEmotions()
    }

    const debouncedSearch = () => {
        clearTimeout(searchTimeout.value)
        searchTimeout.value = setTimeout(() => fetchImages(1), 400)
    }

    const prevPage = () => currentPage.value > 1 && fetchImages(currentPage.value - 1)
    const nextPage = () => currentPage.value * pageSize.value < total.value && fetchImages(currentPage.value + 1)

    const deleteImage = async (img, blacklist = false) => {
        const msg = blacklist ? '确定要删除并拉黑这张图片吗？' : '确定要删除这张图片吗？'
        if (!await showConfirm(msg)) return
        try {
            const res = await apiFetch('api/images/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: img.hash, blacklist }),
            })
            if (res.ok) {
                if (images.value.length === 1 && currentPage.value > 1) currentPage.value--
                await fetchImages(currentPage.value)
                await fetchStats()
                return true
            } else {
                showAlert('删除失败')
            }
        } catch (e) {
            showAlert('操作失败')
        }
        return false
    }

    const toggleScope = async (img, scopeMode) => {
        if (!img) return false
        try {
            const res = await apiFetch('api/images/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: img.hash, scope_mode: scopeMode }),
            })
            const data = await res.json()
            if (data.success) {
                await fetchImages(currentPage.value)
                return true
            } else if (data.error === 'Origin target missing') {
                showAlert('该图片缺少来源群信息')
            } else {
                showAlert(data.error || '作用域更新失败')
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message)
        }
        return false
    }

    return {
        images, categories, stats, loading, searchQuery, selectedCategory, sortBy,
        currentPage, pageSize, total,
        fetchStats, fetchImages, fetchEmotions, loadAll, debouncedSearch,
        prevPage, nextPage, deleteImage, toggleScope
    }
}