/**
 * @by oh-my-zerone 2026-09-30
 * @description Token / 存储（跨端兼容底层能力）
 *   统一 H5 与微信小程序的登录态存取，收敛原 auth.js、upload.js、wallet.js、
 *   middleWare.js 中三套不一致的 token / header 取值逻辑。
 *
 *   取值优先级（getAuthorization）：
 *     - 微信小程序：uni.getStorageSync('loginToken')
 *     - H5 / App：优先 useJsBridge('getTokenSync')，桥接不可用时回退 uni 存储
 *   写入（setToken / removeToken）：微信小程序仅写 uni 存储；
 *     H5 / App 同时写原生桥接与 uni 存储（与原行为一致）。
 */
// const
import { isWx } from '@/common/platform/platform';

// services（跨端桥接）
import { useCanIUseJsBridge, useJsBridge } from '@/common/platform/bridge';

/** 登录态 token 的存储 key（与历史实现保持一致） */
const TokenKey = 'loginToken';

/**
 * 读取登录态 token
 * @returns {string} token
 */
export function getToken() {
    // @by oh-my-zerone R-A: 以 getAuthorization 为单一真相源（桥优先、localStorage 回退），
    // 消除原生仅桥注入 token 时启动门禁误判未登录、跳过 GetInfo 的割裂态
    return getAuthorization();
}

/**
 * 写入登录态 token
 * @param {Object} params
 * @param {string} params.token 登录凭证
 */
export function setToken({ token }) {
    uni.setStorageSync(TokenKey, token);
    if (useCanIUseJsBridge()) {
        useJsBridge({ name: 'dataStore.putStringValue', payload: { key: TokenKey, value: token }, isAsync: true });
    }
}

/**
 * 清除登录态 token
 */
export function removeToken() {
    uni.removeStorageSync(TokenKey);
    if (useCanIUseJsBridge()) {
        useJsBridge({ name: 'dataStore.putStringValue', payload: { key: TokenKey, value: '' }, isAsync: true });
    }
}

/**
 * 获取请求鉴权头 Authorization 的统一来源（消除多份不一致实现）。
 * @returns {string} Authorization 值
 */
export function getAuthorization() {
    if (isWx()) return uni.getStorageSync(TokenKey);
    // H5 / App：优先原生桥接，失败回退 uni 存储
    if (useCanIUseJsBridge()) {
        const token = useJsBridge('getTokenSync');
        if (token) return token;
    }
    return uni.getStorageSync(TokenKey);
}

/**
 * 是否已登录
 * @returns {boolean}
 */
export function isLogin() {
    return !!getToken();
}


