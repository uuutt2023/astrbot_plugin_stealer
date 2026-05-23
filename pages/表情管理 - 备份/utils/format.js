// 格式化工具函数

/**
 * 解析场景列表
 * @param {string} rawText - 原始文本
 * @returns {string[]} 场景数组
 */
export const parseSceneList = (rawText) => {
    if (!rawText) return [];
    const seen = new Set();
    return String(rawText)
        .split(/[，,、;；\n\t]+/)
        .map((item) => item.trim())
        .filter((item) => {
            if (!item || seen.has(item)) return false;
            seen.add(item);
            return true;
        });
};

/**
 * 格式化来源目标
 * @param {string} target - 来源目标字符串
 * @returns {string} 格式化后的字符串
 */
export const formatOriginTarget = (target) => {
    const raw = String(target || '').trim();
    if (!raw) return '未记录';
    if (raw.startsWith('group:')) return '群 ' + raw.slice(6);
    if (raw.startsWith('user:')) return '用户 ' + raw.slice(5);
    return raw;
};

/**
 * 获取作用域标签
 * @param {string} scopeMode - 作用域模式
 * @returns {string} 作用域标签
 */
export const getScopeLabel = (scopeMode) => (
    String(scopeMode || 'public').toLowerCase() === 'local' ? '本群限定' : '公共'
);

/**
 * 格式化日期
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (timestamp) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * 格式化批量大小
 * @param {File[]} batchFiles - 文件数组
 * @returns {string} 格式化后的大小字符串
 */
export const formatBatchSize = (batchFiles) => {
    const totalSize = batchFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize < 1024) return totalSize + ' B';
    if (totalSize < 1024 * 1024) return (totalSize / 1024).toFixed(1) + ' KB';
    return (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
};