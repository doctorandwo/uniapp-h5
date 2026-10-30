/**
 * @by oh-my-zerone 2026-09-30
 * @description 平台识别与环境判断（跨端兼容底层能力）
 *   统一管理 H5（被原生 App 包裹的网页，可使用 jsBridge）/ 微信小程序 的环境判定，
 *   收口散落的 process.env.VUE_APP_NODE_TYPE / VUE_APP_IS_LOCAL 直判。
 */

/** 已计算的环境缓存，避免重复读取 env */
let PLATFORM = '';

/**
 * 获取当前运行环境
 * @returns {'wx'|'h5'} wx=微信小程序；h5=网页（被 APP 包裹、可使用 jsBridge）
 */
export function useGetPlat() {
    if (PLATFORM) return PLATFORM;
    PLATFORM = process.env.VUE_APP_NODE_TYPE.includes('wx') ? 'wx' : 'h5';
    console.log('当前环境==', PLATFORM);
    return PLATFORM;
}

/** 是否为微信小程序 */
export function isWx() {
    return useGetPlat() === 'wx';
}

/** 是否为 H5（含被原生 App 包裹的网页） */
export function isH5() {
    return useGetPlat() === 'h5';
}
