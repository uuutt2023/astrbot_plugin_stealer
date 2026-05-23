// 图片管理组合式函数
import { ref, reactive } from 'vue';
import { parseSceneList } from '../utils/format.js';

export function useImageManager(apiFetch, bridge, imageDataUrls, loadImageData, showAlert, showConfirm) {
    // 状态
    const images = ref([]);
    const categories = ref([]);
    const stats = reactive({ total: 0, categories: 0, today: 0 });
    const loading = ref(true);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const sortBy = ref('newest');
    const currentPage = ref(1);
    const pageSize = ref(30);
    const total = ref(0);

    const searchTimeout = ref(null);

    // 获取统计数据
    const fetchStats = async () => {
        try {
            const res = await apiFetch('api/stats');
            const data = await res.json();
            Object.assign(stats, data.stats || {});
        } catch (e) {
            console.error(e);
        }
    };

    // 获取图片列表
    const fetchImages = async (page = 1) => {
        loading.value = true;
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: pageSize.value.toString(),
                q: searchQuery.value,
                category: selectedCategory.value,
                sort: sortBy.value,
            });
            const res = await apiFetch('api/images?' + params.toString());
            const data = await res.json();
            const nextImages = data.images || [];
            const nextTotal = Number(data.total || 0);
            const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize.value));

            if (page > lastPage && nextTotal > 0) {
                return await fetchImages(lastPage);
            }

            currentPage.value = page;
            images.value = nextImages;
            nextImages.forEach(img => loadImageData(img.hash));
            total.value = nextTotal;
            categories.value = data.categories || [];
            return nextImages;
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            loading.value = false;
        }
    };

    // 获取表情分类
    const fetchEmotions = async () => {
        try {
            const res = await apiFetch('api/emotions');
            const data = await res.json();
            return data.emotions || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    // 加载所有数据
    const loadAll = async () => {
        await fetchStats();
        const emotions = await fetchEmotions();
        await fetchImages(1);
        return emotions;
    };

    // 防抖搜索
    const debouncedSearch = () => {
        clearTimeout(searchTimeout.value);
        searchTimeout.value = setTimeout(() => fetchImages(1), 400);
    };

    // 分页
    const prevPage = () => currentPage.value > 1 && fetchImages(currentPage.value - 1);
    const nextPage = () => currentPage.value * pageSize.value < total.value && fetchImages(currentPage.value + 1);

    // 删除图片
    const deleteImage = async (img, blacklist = false) => {
        const msg = blacklist
            ? '确定要删除并拉黑这张图片吗？\n拉黑后将不再自动收集此图片。'
            : '确定要删除这张图片吗？此操作无法撤销。';
        if (!await showConfirm(msg)) return;
        try {
            const res = await apiFetch('api/images/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: img.hash, blacklist }),
            });
            if (res.ok) {
                if (images.value.length === 1 && currentPage.value > 1) {
                    currentPage.value--;
                }
                await fetchImages(currentPage.value);
                await fetchStats();
                return true;
            } else {
                showAlert('删除失败');
            }
        } catch (e) {
            showAlert('操作失败');
        }
        return false;
    };

    // 更新作用域
    const toggleScope = async (img, scopeMode) => {
        if (!img) return false;
        try {
            const res = await apiFetch('api/images/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: img.hash, scope_mode: scopeMode }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchImages(currentPage.value);
                return true;
            } else if (data.error === 'Origin target missing') {
                showAlert('该图片缺少来源群信息，无法设置为 local。');
            } else {
                showAlert(data.error || '作用域更新失败');
            }
        } catch (e) {
            showAlert('操作失败: ' + e.message);
        }
        return false;
    };

    return {
        // 状态
        images,
        categories,
        stats,
        loading,
        searchQuery,
        selectedCategory,
        sortBy,
        currentPage,
        pageSize,
        total,
        // 方法
        fetchStats,
        fetchImages,
        fetchEmotions,
        loadAll,
        debouncedSearch,
        prevPage,
        nextPage,
        deleteImage,
        toggleScope,
    };
}