/**
 * @by oh-my-zerone 2026-10-08
 * @description 获取底层原生桥接对象 RAW_BRIDGE（跨端兼容）。
 *   H5/App 环境：本地 mock 或真实 AppBridge；微信小程序：no-op 降级。
 *   该文件只负责「获取」RAW_BRIDGE，不承载任何调用逻辑（调用见 ./use-bridge.js）。
 */
// #ifdef H5
import { AppBridge } from 'zjz1-h5-ui/core/bridge';
import { HEADER_LOCAL } from '@/HEADER';

/**
 * 本地桥接实现（VUE_APP_IS_LOCAL==='1' 时启用，模拟原生能力）。
 * 与原 localBridge.js 一致：已知 name 走本地 mock，未知 name 回退到真实 AppBridge。
 * 注意：getTokenSync 直接读 uni 存储，避免与 auth/storage 形成初始化期循环依赖。
 */
const localBridgeImpl = params => {
    const { name, payload, isAsync, onSuccess, onFail } = params;
    const localMap = {
        getSystemInfo: () => ({ name: 'local', versionName: '本地' }),
        getHeaderSync: () => HEADER_LOCAL,
        getTokenSync: () => uni.getStorageSync('loginToken'),
        'navigate.back': () => uni.navigateBack(),
        'navigate.toWeb': p => uni.navigateTo({ url: p.url }),
        'navigate.toLogin': () => uni.navigateTo({ url: '/pages_login/login/index' }),
        getLocation: ({ onSuccess }) => onSuccess({ latitude: 26.049999, longitude: 119.169999 }),
        getStatusBarHeight: () => 40,
        chooseImage: options =>
            uni.chooseImage({
                count: 9,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: res => onSuccess && onSuccess(res),
            }),
        getGTClientId: () => 'c20f0bef03ddc21449a1248cb61ae1bc',
        chooseFile: options =>
            uni.chooseImage({
                count: 9,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: res => onSuccess && onSuccess({ urls: ['https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/17769282575362db66e.png'] }),
            }),
    };
    const bridge = localMap[name] ? localMap[name] : AppBridge;
    return bridge(params);
};

/** H5 / App 包裹环境：本地 mock 或真实 AppBridge */
var RAW_BRIDGE = process.env.VUE_APP_IS_LOCAL == '1' ? localBridgeImpl : AppBridge;
// #endif

// #ifdef MP-WEIXIN
/** 微信小程序无原生桥接能力：降级为 no-op（与原 AppBridgeWrap 默认导出行为一致） */
var RAW_BRIDGE = (...args) => {
    console.log('原生方法,微信环境不支持', ...args);
};
// #endif

/**
 * 获取底层原生桥接对象（跨端兼容）。
 * 微信小程序返回 no-op 函数（调用安全、无副作用）。
 * @returns {Function}
 */
export function getRawBridge() {
    return RAW_BRIDGE;
}

export { RAW_BRIDGE };
