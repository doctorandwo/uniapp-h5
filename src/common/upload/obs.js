/**
 * @by oh-my-zerone 2026-10-09
 * @description 华为 OBS 图片上传工具。
 *   由原 src/common/utils/upload.js 收敛至统一上传目录。
 *   依赖默认上传核心 useUpload（基于 @zerone/toolbox Uploader）与跨端临时文件转 File 能力。
 */

// hooks
import useUpload from './useUpload';

// const
import tempFilePathToFile from './file';

/** 默认上传地址（服务端代理 OBS 上传接口） */
export const HW_UPLOAD_URL = `${process.env.VUE_APP_BASE_HOST}/assets/upload/uploadToHW`;

/** 单张图片默认大小上限：5MB */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/**
 * 提取文件扩展名（小写、含点，如 ".jpg"），并剔除查询参数
 * @param {string} filePath 文件路径或 URL
 * @returns {string} 扩展名，无则返回空串
 */
function getFileExtension(filePath) {
    if (!filePath) return '';
    let ext = '';
    const lastDot = filePath.lastIndexOf('.');
    if (lastDot > -1) {
        ext = filePath.substring(lastDot).toLowerCase();
    }
    const queryIndex = ext.indexOf('?');
    if (queryIndex > -1) {
        ext = ext.substring(0, queryIndex);
    }
    return ext;
}

/**
 * 按允许后缀过滤路径列表（不匹配的会被静默过滤并提示）
 * @param {string[]} filePaths 待过滤路径
 * @param {string} fileType 允许后缀，逗号分隔，如 ".jpg,.png"
 * @returns {string[]} 过滤后路径
 */
function filterByFileType(filePaths, fileType) {
    if (!fileType) return filePaths;
    const allowedTypes = fileType
        .toLowerCase()
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    if (allowedTypes.length === 0) return filePaths;

    const validPaths = filePaths.filter(path => {
        const ext = getFileExtension(path);
        return allowedTypes.includes(ext) || allowedTypes.some(t => ext.endsWith(t) || t.endsWith(ext));
    });

    if (validPaths.length < filePaths.length) {
        uni.showToast({ title: '部分文件格式不支持，已过滤', icon: 'none' });
    }
    return validPaths;
}

/**
 * 按单张大小上限过滤临时文件（超限的会被过滤并提示）
 * @param {Array<{size:number}>} tempFiles 临时文件列表
 * @param {number} maxSize 大小上限（字节）
 * @returns {Array} 过滤后列表
 */
function filterByMaxSize(tempFiles, maxSize) {
    const validFiles = tempFiles.filter(item => !maxSize || item.size <= maxSize);
    if (validFiles.length < tempFiles.length) {
        const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
        uni.showToast({ title: `图片不应大于${maxMb}M`, icon: 'none' });
    }
    return validFiles;
}

/**
 * 上传单张图片到华为 OBS（合并原 uploadFileToHw / uploadFileToHwByToolbox）
 * @param {string} filePath 本地临时路径（blob URL / base64 / 小程序临时路径）
 * @param {string} [url] 自定义上传地址，默认 HW_UPLOAD_URL；可作为 Uploader 的 url 覆盖项透传
 * @returns {Promise<string>} 服务端返回的图片 path
 */
export async function uploadImageToHw(filePath, url = HW_UPLOAD_URL) {
    const { run } = useUpload();
    const file = await tempFilePathToFile(filePath);
    return run(file, { url });
}

/**
 * 选择图片并串行上传到华为 OBS
 * @param {Object} [options]
 * @param {number} [options.count=1] 最多选择张数
 * @param {string} [options.fileType] 允许后缀，逗号分隔，如 ".jpg,.jpeg,.png"
 * @param {number} [options.maxSize] 单张大小上限（字节），默认 5M
 * @param {string[]} [options.sourceType] 选图来源，默认 ['album','camera']
 * @param {string} [options.url] 自定义上传地址，默认 HW_UPLOAD_URL
 * @returns {Promise<string[]>} 上传成功的 path 列表（部分失败不影响其余结果）
 */
export async function chooseAndUploadImagesToHw(options = {}) {
    const {
        count = 1,
        fileType = '',
        maxSize = DEFAULT_MAX_SIZE,
        sourceType = ['album', 'camera'],
        url = HW_UPLOAD_URL,
    } = options;

    const res = await new Promise((resolve, reject) => {
        uni.chooseImage({
            count,
            sizeType: ['original', 'compressed'],
            sourceType,
            success: resolve,
            fail: reject,
        });
    });

    const rawTempFiles = (res.tempFiles && res.tempFiles.length > 0)
        ? res.tempFiles
        : (res.tempFilePaths || []).map(path => ({ path, size: 0 }));

    const tempFiles = filterByMaxSize(rawTempFiles, maxSize);
    if (tempFiles.length === 0) return [];

    const filePaths = tempFiles
        .map(item => item.path || item.tempFilePath)
        .filter(Boolean);
    const validPaths = filterByFileType(filePaths, fileType);
    if (validPaths.length === 0) return [];

    uni.showLoading({ mask: true, title: '上传中...' });
    const uploadedPaths = [];
    let failedCount = 0;

    for (const filePath of validPaths) {
        try {
            const path = await uploadImageToHw(filePath, url);
            uploadedPaths.push(path);
        } catch (e) {
            failedCount += 1;
            console.error('[upload] uploadImageToHw fail', e);
        }
    }

    uni.hideLoading();

    if (failedCount > 0) {
        uni.showToast({
            title: failedCount === validPaths.length ? '上传失败' : '部分图片上传失败',
            icon: 'none',
        });
    }

    return uploadedPaths;
}

/** @deprecated 兼容旧名，请改用 uploadImageToHw */
export const uploadFileToHw = uploadImageToHw;

/** @deprecated 兼容旧名，请改用 uploadImageToHw */
export const uploadFileToHwByToolbox = uploadImageToHw;
