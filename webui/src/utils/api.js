// API 封装工具
export const createApiFetch = (bridge) => {
    return async (url, options = {}) => {
        const urlStr = String(url).replace(/^\/?api\//, '');
        const [path, queryString] = urlStr.split('?');
        const endpoint = path.replace(/\/$/, '');

        const params = {};
        if (queryString) {
            const sp = new URLSearchParams(queryString);
            for (const [k, v] of sp) { params[k] = v; }
        }

        const method = (options.method || 'GET').toUpperCase();
        let body = options.body;

        try {
            let data;
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                let json;
                if (body instanceof FormData) {
                    json = undefined;
                } else if (typeof body === 'string') {
                    json = JSON.parse(body);
                } else {
                    json = body;
                }
                data = await (method === 'POST' ? bridge.apiPost(endpoint, json) : method === 'DELETE' ? bridge.apiDelete(endpoint, json) : bridge.apiPut(endpoint, json));
            } else {
                data = await bridge.apiGet(endpoint, Object.keys(params).length ? params : undefined);
            }
            return { ok: true, json: () => Promise.resolve(data) };
        } catch (e) {
            console.error('API Error:', e);
            return { ok: false, json: () => Promise.resolve({ success: false, error: e.message }) };
        }
    };
};

// 图片数据加载器
export const createImageDataLoader = (bridge, imageDataUrls) => {
    return async (hash) => {
        if (!hash || imageDataUrls[hash]) return;
        try {
            const data = await bridge.apiGet('image-data', { hash });
            if (data?.url) imageDataUrls[hash] = data.url;
        } catch (e) {
            console.error('Load image failed:', hash, e);
        }
    };
};

// 下载图片
export const downloadImage = (item, imageDataUrls) => {
    if (!item?.hash) return;
    const dataUrl = imageDataUrls[item.hash];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = (item.desc || item.hash) + '.png';
    a.click();
};

// 文件转 Base64
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});