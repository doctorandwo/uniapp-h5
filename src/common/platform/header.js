/**
 * @by oh-my-zerone 2026-09-30
 * @description 请求头 / Authorization（跨端兼容底层能力）
 *   收敛原 upload.js、wallet.js、pages_auth/utils/index.js 中重复的 header 取值逻辑，
 *   统一通过 getUploadHeaders() 返回「平台默认头 + Authorization」。
 */
import Loader from '@/bootstrap/loader.js';
import { isWx } from '@/common/platform/platform';
import { useCanIUseJsBridge, useJsBridge } from '@/common/platform/bridge';
import { getAuthorization } from '@/common/platform/storage';

/**
 * 获取平台默认请求头。
 *   - 微信小程序：Loader.defaultHeader
 *   - H5 / App：优先 useJsBridge('getHeaderSync')，桥接不可用时回退 Loader.defaultHeader
 * @returns {Object} header 对象
 */
function getHeader() {
    if (isWx()) return Loader.defaultHeader;
    if (useCanIUseJsBridge()) {
        const header = useJsBridge('getHeaderSync');
        if (header) return header;
    }
    return Loader.defaultHeader;
}

/**
 * 上传类接口统一请求头（默认头 + Authorization）。
 * 替代各业务中手写 `uni.useGetPlat()==='wx' ? Loader.defaultHeader : uni.useJsBridge('getHeaderSync')`
 * 及 `uni.getStorageSync('loginToken')` 的散落分支。
 * @returns {Object} 含 Authorization 的请求头
 */
export function getUploadHeaders() {
    return {
        ...getHeader(),
        Authorization: getAuthorization(),
    };
}
