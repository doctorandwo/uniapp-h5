/**
 * @by oh-my-zerone 2026-09-30
 * @description Token 存储兼容层。
 *   实现已收敛至 @/common/platform/storage，本文件仅保留 @/common/utils/auth 旧导入路径，
 *   供 loader / middleWare / 业务代码继续 import 使用，无需改动调用点。
 */
export {
    getToken,
    setToken,
    removeToken,
    getAuthorization,
    isLogin,
    onLoginStatus,
} from '@/common/platform/storage';
