/**
 * @by oh-my-zerone
 * @description 请求中间件：校验登录态。无 token 时调用注入的 meta.hooks.onUnauthorized
 * 跳转登录页，并终止当前请求。跳转行为由组合根注入，与请求层解耦。
 */
// services
import * as Auth from '@/common/utils/auth.js';

/**
 * 检查是否携带 token，无 token 视为未登录并交由注入的回调处理
 * @param {object} config 请求配置
 * @param {object} meta 共享上下文，含 hooks.onUnauthorized
 * @returns {object|false} 已登录返回 config；未登录返回 false 终止链路
 */
function reqAuthCheck(config, meta) {
    const token = Auth.getToken();
    if (!token) {
        meta?.hooks?.onUnauthorized?.(config);
        return false;
    }
    return config;
}

export { reqAuthCheck };
