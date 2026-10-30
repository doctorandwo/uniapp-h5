/**
 * @by oh-my-zerone 2026-10-09
 * @description 上传资源 code / URL 展示解析。
 *   由原 src/common/hooks/useUploadImage.js 收敛至统一上传目录，逻辑保持不变。
 *   依赖 @/api/upload 业务接口（getUrlByCode）。
 */

// services
import { getUrlByCode } from '@/api/upload';

/** 是否为可直接展示的图片 URL */
export function isUploadImageHttpUrl(value) {
    const str = String(value || '').trim();
    return str.startsWith('http://') || str.startsWith('https://');
}

/**
 * 将 code 或 URL 解析为可展示的图片地址
 * @param {string} value code 或 URL
 * @returns {Promise<string>} 可展示的图片地址，解析失败或为空时返回空串
 */
export async function resolveUploadImageDisplayUrl(value) {
    const str = String(value || '').trim();
    if (!str) return '';
    if (isUploadImageHttpUrl(str)) return str;

    try {
        const res = await getUrlByCode(str);
        if (res?.code === 200 && res.data?.length > 0) {
            return res.data[0]?.attachUrl || '';
        }
    } catch (e) {
        console.error('[resolveUploadImageDisplayUrl]', e);
    }
    return '';
}

/**
 * 批量解析上传图片展示地址（并发）
 * @param {string[]} values code 或 URL 列表
 * @returns {Promise<string[]>} 与入参等长的可展示地址列表
 */
export async function resolveUploadImageDisplayUrls(values = []) {
    return Promise.all((values || []).map(item => resolveUploadImageDisplayUrl(item)));
}
