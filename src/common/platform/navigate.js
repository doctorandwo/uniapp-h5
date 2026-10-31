/**
 * @by oh-my-zerone 2026-09-30
 * @description 路由 / 导航（跨端兼容底层能力）
 *   收敛原 Nav.js 全部方法，以及 uni-plus-funtion.js 的
 *   useToLoginView / usePlusNavigateBack / onAuthorization / onLoginStatus。
 */
// services（跨端桥接 / 存储）
import { useCanIUseJsBridge, useJsBridge } from '@/common/platform/bridge';
import { getToken } from '@/common/platform/storage';

/** 登录页路径（与原 Loader.wxAuthorization 保持一致） */
const LOGIN_PAGE = '/pages_login/login/index';

/**
 * 路由跳转封装
 */
const Nav = {
    /**
     * 首页 tab 切换
     */
    switchTab: url => {
        uni.switchTab({ url });
    },

    /**
     * 页面跳转
     */
    jumpRouter: url => {
        uni.navigateTo({ url });
    },

    /**
     * 关闭当前页面，跳转到应用内的某个页面
     */
    redirectTo: url => {
        uni.redirectTo({ url });
    },

    /**
     * 返回上一页
     */
    back: (
        { delta, success } = {
            delta: 1,
            success: () => {},
        },
    ) => {
        uni.navigateBack({ delta, success });
    },

    /**
     * 关闭当前页（H5 / App 调用原生 finish，否则 navigateBack）
     */
    close: () => {
        if (useCanIUseJsBridge()) {
            useJsBridge({ name: 'finish' });
            return;
        }
        uni.navigateBack();
    },
};

export default Nav;
export { Nav };

/**
 * 统一返回登录页处理
 */
export function useToLoginView() {
    if (useCanIUseJsBridge()) {
        console.log('返回原生登录页')
        useJsBridge({ name: 'navigate.toLogin' });
    }
    else uni.navigateTo({ url: LOGIN_PAGE });
}

/**
 * 需要判断环境做返回时调用：原生环境走桥接，否则 uni.navigateBack
 * @param {Object} [object] navigateBack 参数，默认 { delta: 1 }
 */
export function usePlusNavigateBack(object = { delta: 1 }) {
    if (useCanIUseJsBridge()) useJsBridge({ name: 'navigate.back' });
    else uni.navigateBack(object);
}

/**
 * 判断登录态，未登录时弹窗引导至登录页
 * @returns {boolean|void} 已登录返回 true，未登录返回 undefined
 */
export function onLoginStatus() {
    if (!getToken()) {
        uni.showModal({
            title: '提示',
            content: '您尚未登录或登录过期，点击确定前往登录',
            success: res => {
                if (!res.confirm) return;
                useToLoginView();
            },
        });
        return;
    }
    return true;
}

/**
 * 带登录校验的跳转：未登录先引导登录，已登录携带参数跳转。
 * @param {string} url 目标地址
 * @param {string} [payload] 查询参数（统一转字符串）
 */
export function onAuthorization(url, payload) {
    if (!onLoginStatus()) return;
    const finalUrl = payload ? `${url}?${payload}` : url;
    uni.navigateTo({
        url: finalUrl,
        event: {
            success: res => {
                console.log('获取数据', res);
            },
        },
    });
}
