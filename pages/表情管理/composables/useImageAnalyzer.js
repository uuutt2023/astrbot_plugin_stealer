// 图片分析组合式函数
import { ref } from 'vue';
import { fileToBase64 } from '../utils/api.js';

export function useImageAnalyzer(apiFetch) {
    const isAnalyzing = ref(false);
    const lastAnalysisResult = ref(null);

    const analyze = async (file) => {
        if (!file) {
            throw new Error('请先选择图片');
        }

        isAnalyzing.value = true;
        console.log('[Analyzer] 开始分析图片:', file.name);

        try {
            const base64Data = await fileToBase64(file);
            const res = await apiFetch('api/analyze', {
                method: 'POST',
                body: JSON.stringify({ base64: base64Data }),
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || '分析失败');
            }

            lastAnalysisResult.value = data;
            console.log('[Analyzer] 分析成功:', data);
            return data;
        } catch (e) {
            console.error('[Analyzer] 分析失败:', e);
            throw e;
        } finally {
            isAnalyzing.value = false;
        }
    };

    const applyToForm = (data, form, categories = []) => {
        const result = { filled: false, fields: [] };

        if (data.category) {
            const exists = categories.some(e => e.key === data.category);
            if (exists) {
                form.emotion = data.category;
                result.fields.push('category');
            } else if (categories.length > 0) {
                console.warn('[Analyzer] 分类不存在，使用默认:', data.category);
                form.emotion = categories[0].key;
                result.fields.push('category');
            }
        }

        if (data.tags && data.tags.length > 0) {
            const existingTags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(t => t) : [];
            const newTags = data.tags.filter(t => !existingTags.includes(t));
            if (newTags.length > 0) {
                form.tags = [...existingTags, ...newTags].join(', ');
                result.fields.push('tags');
            }
        }

        if (Array.isArray(data.scenes) && data.scenes.length > 0) {
            form.scene = data.scenes.join('、');
            result.fields.push('scenes');
        }

        if (data.description && !form.desc) {
            form.desc = data.description;
            result.fields.push('desc');
        }

        result.filled = result.fields.length > 0;
        console.log('[Analyzer] 表单填充结果:', result);
        return result;
    };

    return {
        isAnalyzing,
        lastAnalysisResult,
        analyze,
        applyToForm,
    };
}