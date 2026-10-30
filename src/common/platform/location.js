/**
 * @by oh-my-zerone 2026-09-30
 * @description 定位（跨端兼容底层能力）
 *   收敛原 uni-plus-funtion.js 的 getLocationPlus。
 *   微信小程序用 uni.getLocation；H5 / App 走原生桥接 getLocation（强端差异，保留 #ifdef）。
 */
// services（跨端桥接）
import { useJsBridgeAsync } from '@/common/platform/bridge';

/**
 * 获取当前位置，兼容 H5 与微信小程序
 * @returns {Promise<{latitude:number,longitude:number}>}
 */
export function getLocationPlus() {
    // #ifdef MP-WEIXIN
    return uni.getLocation({ type: 'gcj02' });
    // #endif
    // #ifdef H5
    try {
        return useJsBridgeAsync('getLocation');
    } catch (error) {
        console.log('error==异常定位', error);
        return Promise.resolve({ latitude: 0, longitude: 0 });
    }
    // #endif
}
