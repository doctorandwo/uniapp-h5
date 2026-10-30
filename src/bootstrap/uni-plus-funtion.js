/**
 * @by oh-my-zerone 2026-09-30
 * @description uni-plus 扩展的薄注册层。
 *   跨端兼容能力已收敛至 src/common/platform/*，此处按具体模块直连 re-export，
 *   保证经 loader.loadUniPlusEnter 挂载到 uni 的 useXxx 调用点零改动。
 */
// services（跨端底层能力，按具体模块引入）
export { useGetPlat, isWx, isH5 } from '@/common/platform/platform';
export { useCanIUseJsBridge, useJsBridge, useJsBridgeAsync, getRawBridge } from '@/common/platform/bridge';
export { getToken, setToken, removeToken, getAuthorization, isLogin } from '@/common/platform/storage';
export { useToLoginView, usePlusNavigateBack, onLoginStatus, onAuthorization } from '@/common/platform/navigate';
export { getLocationPlus } from '@/common/platform/location';
