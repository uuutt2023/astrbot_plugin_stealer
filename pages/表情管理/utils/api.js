// API 工具函数

/**
 * 文件转 Base64
 * @param {File} file - 文件对象
 * @returns {Promise<string>} Base64 字符串
 */
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

/**
 * 创建 API 请求封装
 * @param {Object} bridge - AstrBot 插件桥接对象
 * @returns {Function} apiFetch 函数
 */
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
                if (body instanceof FormData) {
                    const file = body.get('file');
                    if (file instanceof File) {
                        data = await bridge.upload(endpoint, file);
                    } else {
                        const json = {};
                        const fileEntries = [];
                        for (const [k, v] of body.entries()) {
                            if (v instanceof File) {
                                fileEntries.push({ key: k, file: v });
                            } else {
                                json[k] = v;
                            }
                        }
                        if (fileEntries.length > 0) {
                            json._files = await Promise.all(
                                fileEntries.map(async (entry) => ({
                                    key: entry.key,
                                    name: entry.file.name,
                                    base64: await fileToBase64(entry.file),
                                }))
                            );
                        }
                        data = await bridge.apiPost(endpoint, json);
                    }
                } else {
                    if (typeof body === 'string') {
                        try { body = JSON.parse(body); } catch(e) {}
                    }
                    data = await bridge.apiPost(endpoint, body || {});
                }
            } else {
                data = await bridge.apiGet(endpoint, Object.keys(params).length ? params : undefined);
            }

            return {
                ok: true,
                status: 200,
                json: async () => data,
                text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
            };
        } catch (e) {
            return {
                ok: false,
                status: 500,
                json: async () => { throw e; },
                text: async () => e.message,
            };
        }
    };
};

/**
 * 加载图片数据
 * @param {Object} bridge - AstrBot 插件桥接对象
 * @param {Object} imageDataUrls - 图片数据 URL 存储对象
 * @returns {Function} loadImageData 函数
 */
export const createImageDataLoader = (bridge, imageDataUrls) => {
    return async (hash) => {
        if (!hash || imageDataUrls[hash]) return;
        try {
            const data = await bridge.apiGet('image-data', { hash });
            if (data && data.url) {
                imageDataUrls[hash] = data.url;
            }
        } catch (e) {
            console.error('Failed to load image:', hash, e);
        }
    };
};

/**
 * 下载图片
 * @param {Object} item - 图片对象
 * @param {Object} imageDataUrls - 图片数据 URL 存储对象
 */
export const downloadImage = (item, imageDataUrls) => {
    if (!item?.hash) return;
    const dataUrl = imageDataUrls[item.hash];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = (item.desc || item.hash) + '.png';
    a.click();
};