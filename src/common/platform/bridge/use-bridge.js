/**
 * @by oh-my-zerone 2026-10-08
 * @description 使用底层原生桥接 RAW_BRIDGE（「使用」层）。
 *   提供 callRawBridge（v1/v2 入参归一化）与 bridge（透出底层桥接），
 *   底层 RAW_BRIDGE 由 ./raw-bridge.js 负责「获取」。
 */
// const
import { RAW_BRIDGE } from './raw-bridge.js';

/**
 * 归一化桥接入参：兼容 v1（对象 {name,payload,isAsync,onSuccess,onFail}）与
 * v2（平铺 name, ...rest）两种调用形式，统一交给底层 RAW_BRIDGE。
 * @param {Object|string} params 对象形式或平铺的 name
 * @param {...*} rest 平铺形式的后续参数（onSuccess / payload 等）
 * @returns {*}
 */
function callRawBridge(params, ...rest) {
    const isV1 = params instanceof Object && params.name;
    if (isV1) {
        const { name, payload, isAsync, onSuccess, onFail } = params;
        return RAW_BRIDGE({ name, payload, isAsync, onSuccess, onFail });
    }

    const name = params;
    const args = rest || [];
    if (args.length > 2) throw new Error('参数错误');

    let option;
    if (args.length === 0) {
        option = { name, payload: '', isAsync: false };
    } else if (args.length === 2) {
        const [onSuccess, payload] = args;
        option = { name, payload, isAsync: true, onSuccess };
    } else if (args.length === 1) {
        const type = typeof args[0];
        if (type === 'function') {
            option = { name, isAsync: true, onSuccess: args[0] };
        } else {
            option = { name, payload: args[0] };
        }
    }
    return RAW_BRIDGE(option);
}

/**
 * 透出底层桥接（兼容原 AppBridgeWrap 默认导出 / this.$global.bridge 的调用约定）。
 * 不做环境守卫，直接归一化后交给 RAW_BRIDGE；微信端由 RAW_BRIDGE 的 no-op 兜底。
 * @param {Object|string} params 对象形式 {name,payload,isAsync,onSuccess,onFail} 或平铺 name
 * @param {...*} rest 平铺形式的后续参数（onSuccess / payload 等）
 * @returns {*}
 */
export function bridge(params, ...rest) {
    return callRawBridge(params, ...rest);
}

export { callRawBridge };
