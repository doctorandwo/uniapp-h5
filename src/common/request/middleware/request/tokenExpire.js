/**
 * @by oh-my-zerone
 * @description 请求中间件：检查 token 是否过期（原 reqTokenIsExpirCheck，默认未挂入链路，保留兼容）。
 * 过期时交由注入的 meta.hooks.onUnauthorized 处理跳转登录。
 */
// const
import { checkTokenIsExpire } from '../../core/utils';

/**
 * 检查登录是否过期
 * @param {object} config 请求配置
 * @param {object} meta 共享上下文，含 hooks.onUnauthorized
 * @returns {object|false} 未过期返回 config；过期返回 false 终止链路
 */
function reqTokenIsExpirCheck(config, meta) {
    const time = uni.getStorageSync('loginTime');
    if (checkTokenIsExpire(time)) {
        uni.showToast({ title: '登录过期，请重新登录', icon: 'none' });
        setTimeout(() => {
            meta?.hooks?.onUnauthorized?.(config);
        }, 1000);
        return false;
    }
    return config;
}

export { reqTokenIsExpirCheck };
