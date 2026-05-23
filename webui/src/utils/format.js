// 格式化工具函数

// 解析场景列表
export const parseSceneList = (rawText) => {
    if (!rawText) return [];
    const seen = new Set();
    return String(rawText)
        .split(/[，,、;；\n\t]+/)
        .map(item => item.trim())
        .filter(item => {
            if (!item || seen.has(item)) return false;
            seen.add(item);
            return true;
        });
};

// 格式化来源目标
export const formatOriginTarget = (target) => {
    const raw = String(target || '').trim();
    if (!raw) return '未记录';
    if (raw.startsWith('group:')) return '群 ' + raw.slice(6);
    if (raw.startsWith('user:')) return '用户 ' + raw.slice(5);
    return raw;
};

// 获取作用域标签
export const getScopeLabel = (scopeMode) => (
    String(scopeMode || 'public').toLowerCase() === 'local' ? '本群限定' : '公共'
);

// 格式化日期
export const formatDate = (timestamp) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};