/**
 * @by oh-my-zerone 2026-09-30
 * @description 原生桥接 / JSBridge（跨端兼容底层能力）入口。
 *   合并原 AppBridgeWrap.js 与 uni-plus-funtion.js 的 useJsBridge / useJsBridgeAsync，
 *   内置 localBridge 选择逻辑（VUE_APP_IS_LOCAL）。
 *   对外暴露 getRawBridge() 供 H5 直连 zjz1-h5-ui 的场景使用（替换原本直接
 *   import { AppBridge } from 'zjz1-h5-ui/core/bridge' 的写法）。
 *   底层 RAW_BRIDGE 的「获取」见 ./raw-bridge.js，「使用」见 ./use-bridge.js。
 */
// hooks
import { useGetPlat } from '@/common/platform/platform';

// const
import { RAW_BRIDGE, getRawBridge } from './raw-bridge.js';

// services
import { bridge } from './use-bridge.js';

export { getRawBridge, bridge };

/**
 * 是否可以使用 jsBridge（被原生 App 嵌入）。
 * 微信小程序直接返回 false；H5 以 getSystemInfo 是否返回有效值判定。
 * @returns {boolean}
 */
export function useCanIUseJsBridge() {
    const plat = useGetPlat();
    if (plat === 'wx') return false;
    // #ifdef H5
    return Boolean(RAW_BRIDGE({ name: 'getSystemInfo', payload: '' }));
    // #endif
    // #ifdef MP-WEIXIN
    return false;
    // #endif
}

/**
 * 调用原生方法（同步）。
 * 不支持 jsBridge 的环境直接 no-op 并返回，与原 uni-plus-funtion 行为一致。
 * @param {Object} params { name, payload, isAsync, onSuccess, onFail }
 */
export function useJsBridge(params) {
    if (!useCanIUseJsBridge()) {
        console.log('当前环境不支持JsBridge', params);
        return;
    }
    return bridge(...arguments);
}

/**
 * 调用原生方法（异步，带回调）。
 * @param {string} name 原生方法标记
 * @param {*} [payload] 传递到原生的参数
 * @returns {Promise} resolve 原生回调的数据
 */
export function useJsBridgeAsync(name, payload = '') {
    if (!useCanIUseJsBridge()) {
        console.log('当前环境不支持JsBridge', name);
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const callback = res => resolve(res && res.data ? res.data : res);
        try {
            if (payload) bridge(name, callback, payload);
            else bridge(name, callback);
        } catch (error) {
            reject(error);
        }
    });
}
