/**
 * @by oh-my-zerone 2026-10-14
 * @description 请求头构造模块。
 *   开放通过原生桥接 bridge 的 getHeaderSync 获取原生请求头（原生优先），
 *   并以 HEADER_LOCAL 做兜底，最终追加 Authorization。
 *   循环依赖说明：本文件 import 的 bridge 经 use-bridge.js 回溯到 raw-bridge.js，
 *   而 raw-bridge.js 又 import 本文件的 HEADER_LOCAL；两端对彼此符号的引用
 *   均延迟到函数调用期（非模块求值期），不会触发 TDZ，循环依赖安全。
 */
// services
import { bridge } from '@/common/platform/bridge/use-bridge.js';
import { getToken } from '@/common/utils/auth';

/* 本地header--货主端（原生不可用时兜底） */
export const HEADER_LOCAL = {
    'Produce-Code': '2c3c8c43b487432b9d67934a6c4dcbbe',
    'App-Code': 'f3209f6c7353414e8dbb94dd23cf8b91',
    'App-Version-Code': '31f40931251d42179c365283da4402c2',
    'App-Type': '1',
    'App-Version': '2.0',
    'Terminal-Type': 'app',
};

/**
 * 构造请求头：原生头优先，本地头兜底，并强制追加 Authorization。
 * @returns {Object} 合并后的请求头对象
 */
const getHeader = () => {
    // 通过原生桥接获取请求头；微信端 bridge 为 no-op 返回 undefined，用空对象兜底
    const nativeHeader = bridge({ name: 'getHeaderSync', payload: '' }) || {};
    return {
        ...HEADER_LOCAL,
        ...nativeHeader,
        Authorization: getToken(),
    };
};

export default getHeader;
