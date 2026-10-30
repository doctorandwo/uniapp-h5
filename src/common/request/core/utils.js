/**
 * @by oh-my-zerone
 * @description 请求器通用纯函数工具（无业务依赖，可独立单测）
 */

/**
 * 判断 url 是否需要忽略拦截器（支持正则表达式与字符串）
 * @param {string} url 请求地址
 * @param {Array<RegExp|string>} ignoreList 忽略规则集合
 * @returns {boolean} 命中忽略规则返回 true
 */
function shouldIgnoreUrl(url, ignoreList = []) {
    return ignoreList.some(ignoreItem => {
        if (ignoreItem instanceof RegExp) {
            return ignoreItem.test(url);
        } else if (typeof ignoreItem === 'string') {
            return url.includes(ignoreItem);
        }
        return false;
    });
}

/**
 * 清洗 GET 请求参数：移除值为 null / undefined 的字段
 * @param {object} data 原始请求参数
 * @returns {object} 清洗后的参数
 */
function cleanGetParams(data = {}) {
    const result = { ...data };
    Object.keys(result).forEach(key => {
        if (result[key] === null || result[key] === undefined) {
            delete result[key];
        }
    });
    return result;
}

/**
 * 检查 token 是否过期。
 * 注：保持与原实现一致（仅做布尔判定，未传入有效期，
 * 即登录时间早于当前时间即视为过期），改造期间不改变既有行为。
 * @param {number|string} tokenTime 登录时间戳
 * @returns {boolean} 已过期返回 true
 */
function checkTokenIsExpire(tokenTime) {
    const tTime = new Date(tokenTime).getTime();
    const now = new Date().getTime();
    return now - tTime > 0;
}

export { shouldIgnoreUrl, cleanGetParams, checkTokenIsExpire };
