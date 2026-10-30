/**
 * @by oh-my-zerone 2026-10-22
 * @description 高德地图 JS API（Web 端「渲染」SDK）动态加载器。
 *   与 common/platform/amap.js（Web 服务封装：逆地理 / POI / 驾车）职责区分：
 *   本模块只负责把高德 JS API 注入页面，返回 window.AMap 实例，供地图渲染使用。
 *   已加载时直接 resolve；并发多次调用共享同一个 promise，避免重复注入 <script>。
 *
 * 安全密钥：2021-12-02 后申请的「Web 端(JS API)」key 必须在加载前设置
 *   window._AMapSecurityConfig = { securityJsCode }，否则 new AMap.Map 会抛错。
 *   通过环境变量 VUE_APP_JS_MAP_SECURITY_CODE 注入；老 key 不设置即可。
 */

/** 高德 JS API 版本（与 waybillDetails 既有用法保持一致） */
const AMAP_JS_API_VERSION = '1.4.15';

/** 加载器内部状态：缓存 promise，保证全应用只注入一次 */
const loaderState = {
    promise: null,
};

/**
 * 动态加载高德 JS API，返回已挂载到 window.AMap 的实例。
 * @param {string} key 高德 JS API key（Web 端渲染类型）
 * @param {number} [timeout=10000] 加载超时（ms），超时后 reject
 * @returns {Promise<Object>} resolve(window.AMap)
 */
export function loadAMapJsApi(key, timeout = 10000) {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('非浏览器环境，无法加载高德 JS API'));
    }
    // 已存在全局实例，直接返回
    if (window.AMap) {
        return Promise.resolve(window.AMap);
    }
    // 并发复用：避免重复注入
    if (loaderState.promise) {
        return loaderState.promise;
    }
    loaderState.promise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src*="webapi.amap.com/maps"]');
        if (existing) {
            // 已有 script 但未就绪：若已加载完成却仍无 AMap（上次加载失败），移除后重新注入；
            // 否则轮询等待（例如其它页面已注入、正在加载中）。
            if (existing.readyState === 'complete' && !window.AMap) {
                if (existing.parentNode) existing.parentNode.removeChild(existing);
                // 继续往下走「注入新 script」分支
            } else {
                const check = setInterval(() => {
                    if (window.AMap) {
                        clearInterval(check);
                        resolve(window.AMap);
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(check);
                    reject(new Error('AMap SDK 加载超时'));
                }, timeout);
                return;
            }
        }
        // 安全密钥（2021-12 后申请的 key 必需）
        const securityCode = process.env.VUE_APP_JS_MAP_SECURITY_CODE;
        if (securityCode) {
            window._AMapSecurityConfig = { securityJsCode };
        }
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=${AMAP_JS_API_VERSION}&key=${key}`;
        script.onload = () => {
            if (window.AMap) {
                resolve(window.AMap);
            } else {
                loaderState.promise = null;
                reject(new Error('AMap SDK 加载异常（脚本已加载但 window.AMap 未定义）'));
            }
        };
        script.onerror = () => {
            loaderState.promise = null;
            reject(new Error('AMap SDK 加载失败（网络不可达或被拦截）'));
        };
        document.head.appendChild(script);
        // 兜底超时：防止 onload/onerror 均不触发时 promise 永久挂起
        setTimeout(() => {
            if (!window.AMap) {
                loaderState.promise = null;
                reject(new Error('AMap SDK 加载超时'));
            }
        }, timeout);
    });
    return loaderState.promise;
}
