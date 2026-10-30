/**
 * @by oh-my-zerone
 * @description 请求器组合根（DI 装配层）。将 Loader 配置、auth、错误提示等
 * 作为依赖注入到纯引擎，使引擎与业务完全解耦。本文件零 store 依赖，
 * store 相关登出逻辑由 bootstrap.config.js 通过 configureRequest 注入。
 * 对外提供默认 request 实例与 createRequest 工厂。
 */
// components（无）
// hooks（无）
// const（无）
// services
import Loader from '@/bootstrap/loader.js';
import { createEngine } from './core/engine';
import { showErrorTip } from './errorTip';

/**
 * 未注入 hooks 时的默认兜底：弹窗 + 跳转登录页，但不触发 store 登出（store-free，standalone 安全）。
 * 真实登出逻辑由 bootstrap.config.js 通过 configureRequest 注入 store.dispatch('LogOut')。
 * @param {Function} onLogout 登出回调（注入 store.dispatch('LogOut') 或空操作）
 * @returns {Function} 未授权处理函数
 */
function createUnauthorizedHandler(onLogout) {
    // 未登录弹窗去重标记（与原 reqAuthCheck 行为一致）
    let noTokenFlag = true;
    return () => {
        if (!noTokenFlag) return;
        noTokenFlag = false;
        uni.showModal({
            title: '提示',
            content: '您尚未登录或登录过期，点击确定前往登录',
            success: function (res) {
                if (res.confirm) {
                    onLogout();
                    uni.useToLoginView();
                } else if (res.cancel) console.log('用户点击取消');
            },
            complete: () => {
                noTokenFlag = true;
            },
        });
    };
}

/* 默认未授权的动作是，提示后退出到登陆页 */
const defaultOnUnauthorized = createUnauthorizedHandler(() => {});
/** 默认 401 过期处理：直接跳转登录页（无弹窗、无登出，登出由注入的 onTokenExpired 决定） */
const defaultOnTokenExpired = () => uni.useToLoginView();

/**
 * 运行期可注入的 hooks（store 相关登出逻辑在此注入，避免 http.js 静态依赖 store 形成循环依赖）。
 * bootstrap.config.js 在 initBootstrap 中调用 configureRequest 设置。
 */
let injectedHooks = null;

/**
 * 注入默认实例的 hooks（onUnauthorized / onTokenExpired），供组合根装配 store 等依赖。
 * @param {object} [hooks] { onUnauthorized?, onTokenExpired? }
 */
function configureRequest(hooks = {}) {
    injectedHooks = { ...injectedHooks, ...hooks };
}

/**
 * 创建请求器实例（依赖注入入口）
 * @param {object} [userOptions] 覆盖配置
 * @param {string} [userOptions.baseUrl] 基础地址
 * @param {object} [userOptions.defaultHeader] 默认请求头
 * @param {Array} [userOptions.ignore] 忽略拦截器的地址规则
 * @param {object} [userOptions.middleware] 中间件 { request:[], response:[] }
 * @param {object} [userOptions.errCodeMsg] 错误码映射表
 * @param {Function} [userOptions.errorTip] 错误提示 handler
 * @param {object} [userOptions.hooks] 注入回调 { onUnauthorized, onTokenExpired }
 * @returns {{ request: Function }} 引擎实例
 */
function createRequest(userOptions = {}) {
    const getOptions = () => ({
        baseUrl: userOptions.baseUrl ?? Loader.requestBaseUrl,
        defaultHeader: userOptions.defaultHeader ?? Loader.defaultHeader,
        ignore: userOptions.ignore ?? Loader.requestIgnore,
        middleware: userOptions.middleware ?? Loader.middleware,
        errCodeMsg: userOptions.errCodeMsg ?? Loader.errCodeMsg,
        errorTip: userOptions.errorTip ?? showErrorTip,
        hooks: userOptions.hooks ?? injectedHooks ?? { onUnauthorized: defaultOnUnauthorized, onTokenExpired: defaultOnTokenExpired },
    });
    return createEngine(getOptions);
}

// 默认实例：对齐原 index.js 行为，供全局 @/common/request 使用
// 注意：createRequest() 返回引擎对象 { request }，对外必须暴露其中的 request 函数，
// 否则消费方 (0, request)(...) 会报 “request is not a function”。
const engine = createRequest();
const request = engine.request;

export { createRequest, configureRequest, createUnauthorizedHandler, request };
export default request;
