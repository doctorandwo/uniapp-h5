/**
 * @by oh-my-zerone
 * @description 请求中间件：注入 Authorization 头（依赖平台存储，非业务耦合）
 */
// services
import { getAuthorization } from '@/common/platform/storage';

/**
 * 在请求头中追加鉴权信息
 * @param {object} config 请求配置
 * @returns {object} config
 */
function reqWithToken(config) {
    const authorization = getAuthorization();
    if (authorization) {
        config.header['Authorization'] = authorization;
    }
    return config;
}

export { reqWithToken };
