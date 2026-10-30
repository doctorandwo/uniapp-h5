/**
 * @by oh-my-zerone 2026-10-09
 * @description 临时文件转 File 对象（跨端兼容底层能力）。
 *   由原 src/common/platform/file.js 收敛至统一上传目录。
 *   微信小程序与 H5 的临时路径形态不同，保留 #ifdef 两套实现。
 *   返回统一结构：{ name, size?, type, content }，content 在 MP 为路径字符串、H5 为浏览器 File 对象。
 */

// #ifdef MP-WEIXIN
/**
 * 微信小程序：临时路径直接作为 content 透传（小程序上传不依赖浏览器 File 对象）
 * @param {string} tempFilePath 本地临时路径
 * @returns {Promise<Object>} { name, size, type, content }
 */
function tempFilePathToFile(tempFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const fs = wx.getFileSystemManager();
            const stat = fs.statSync(tempFilePath);
            const fileName = tempFilePath.split('/').pop();
            const fileType = fileName.split('.').pop();
            resolve({
                name: fileName,
                size: stat?.size ?? 0,
                type: fileType,
                content: tempFilePath,
            });
        } catch (e) {
            reject(new Error('文件读取失败: ' + e.message));
        }
    });
}
// #endif

// #ifdef H5
/**
 * base64 字符串转 File 对象
 * @param {string} base64Str 含 data URI 前缀或纯 base64 字符串
 * @param {string} fileName 文件名（含扩展名）
 * @param {string} fileType MIME 类型
 * @returns {File}
 */
function base64toFile(base64Str, fileName, fileType) {
    const arr = base64Str.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || fileType;
    if (!arr[1]) {
        throw new Error('Invalid base64 string');
    }
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i += 1) {
        u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], fileName, { type: mime });
}

/**
 * blob URL 转 File 对象
 * @param {string} blobUrl blob: 协议临时地址
 * @param {string} fileName 文件名（含扩展名）
 * @param {string} fileType MIME 类型
 * @returns {Promise<File>}
 */
function blobUrlToFile(blobUrl, fileName, fileType) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', blobUrl);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status === 200) {
                const blob = xhr.response;
                resolve(new File([blob], fileName, { type: blob.type || fileType }));
            } else {
                reject(new Error('Failed to fetch blob from URL'));
            }
        };
        xhr.onerror = () => reject(new Error('Network error while fetching blob'));
        xhr.send();
    });
}

/**
 * 从临时路径推断扩展名（blob 默认 png，base64 从 data URI 解析，否则 png）
 * @param {string} tempFilePath blob URL 或 base64 字符串
 * @returns {string} 不含点的扩展名，如 "png" / "jpeg"
 */
function resolveExtension(tempFilePath) {
    if (tempFilePath.startsWith('blob:')) return 'png';
    return tempFilePath.match(/data:image\/(\w+)/)?.[1] || 'png';
}

/**
 * H5：将临时路径（blob URL 或 base64）转成统一 File 描述对象
 * @param {string} tempFilePath blob URL 或 base64 字符串
 * @returns {Promise<Object>} { name, type, content }
 */
async function tempFilePathToFile(tempFilePath) {
    const ext = resolveExtension(tempFilePath);
    const fileName = `${Date.now()}.${ext}`;
    const fileType = `image/${ext}`;
    if (tempFilePath.startsWith('blob:')) {
        const file = await blobUrlToFile(tempFilePath, fileName, fileType);
        return { name: fileName, type: fileType, content: file };
    }
    const file = base64toFile(tempFilePath, fileName, fileType);
    return { name: fileName, type: fileType, content: file };
}
// #endif

export default tempFilePathToFile;
