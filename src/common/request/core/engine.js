/**
 * @by oh-my-zerone
 * @description 纯请求引擎。不依赖 store / auth / Loader / uni.showModal 等业务对象，
 * 所有配置与行为通过 getOptions() 依赖注入。负责 URL 解析、GET 参数清洗、
 * 发起 uni.request、超时、loading 控制，以及同引擎内的请求取消。
 */
// components（无）
// hooks（无）
// const
import { DEFAULT_TIMEOUT, DEFAULT_LOADING_TXT, DEFAULT_CONTENT_TYPE } from './constants';
// services（无）

// 内部依赖
import { runRequestChain, runResponseChain } from './chain';
import { shouldIgnoreUrl, cleanGetParams } from './utils';

/**
 * 创建请求引擎实例
 * @param {Function} getOptions 返回最新配置的函数（惰性读取，避免 bootstrap 未初始化时取值）。
 *   配置结构：{ baseUrl, defaultHeader, ignore, middleware:{request,response}, errCodeMsg, errorTip, hooks }
 * @returns {{ request: Function }} 包含 request 方法的引擎实例
 */
function createEngine(getOptions) {
    // 同引擎内的“上一次请求”引用，用于取消相同 URL 的未完成请求（保留原行为）
    let lastRequest = null;
    let lastRequestUrl = null;

    /**
     * 通用请求方法（对外 API 与旧 request 完全一致，保证渐进式零破坏性）
     * @param {object} options 请求配置
     * @param {string} [options.url] 请求地址
     * @param {string} [options.method] 请求方法，默认 get
     * @param {object} [options.data] 请求参数
     * @param {boolean} [options.loading] 是否展示 loading
     * @param {string} [options.loadingTxt] loading 文案
     * @param {string} [options.ContentType] 请求 Content-Type
     * @param {boolean|string|object} [options.modal] 报错提示模式。默认 toast；true 使用弹窗；字符串作为弹窗标题；对象可透传 uni.showModal 参数
     * @param {boolean} [options.silent] 为 true 时静默处理，不弹出任何错误提示
     * @returns {Promise<any>} 响应结果
     */
    async function request({ url = '', method = 'get', data, loading = false, loadingTxt = DEFAULT_LOADING_TXT, ContentType = DEFAULT_CONTENT_TYPE, modal, ...option }) {
        const options = (typeof getOptions === 'function' ? getOptions() : getOptions) || {};
        const baseUrl = options.baseUrl || '';
        const defaultHeader = options.defaultHeader || {};
        const ignore = options.ignore || [];
        const requestMiddleware = options.middleware?.request || [];
        const responseMiddleware = options.middleware?.response || [];
        const errorTip = options.errorTip || (() => {});
        const meta = { errCodeMsg: options.errCodeMsg || {}, hooks: options.hooks || {} };

        const realUrl = url.includes('http') ? url : baseUrl + url;
        let _data = { ...data };

        if (method.toLowerCase() === 'get') {
            // GET 请求删除 null / undefined 参数
            _data = cleanGetParams(_data);
        }

        let config = {
            url: realUrl,
            method,
            data: _data,
            header: {
                'Content-Type': ContentType,
                ...defaultHeader,
            },
            modal,
            ...option,
        };

        if (lastRequest && url == lastRequestUrl) {
            // 如果上一次请求还未完成，取消上一次请求（保留原行为）
            lastRequest.abort();
        }
        if (!shouldIgnoreUrl(url, ignore)) {
            const result = await runRequestChain(config, requestMiddleware, meta);
            if (!result.passed) throw new Error('请求中间件校验未通过');
            config = result.config;
        }
        lastRequestUrl = config.url;

        if (loading) uni.showLoading({ title: loadingTxt, mask: true });

        return new Promise((resolve, reject) => {
            if (config['Terminal-OS']) delete config['Terminal-OS'];
            const task = uni.request({
                timeout: DEFAULT_TIMEOUT,
                ...config,
                success: res => {
                    if (config?.silent) res.silent = true;
                    runResponseChain(res, responseMiddleware, meta)
                        .then(r => {
                            if (!r.passed) {
                                const errMsg = r.res?.msg;
                                // modal：请求配置优先，其次取响应拦截器注入的 modal；silent 优先级最高
                                const modalOpt = config?.modal ?? r.res?.modal;
                                if (!config?.silent && !r.res?.silent) errorTip(errMsg, modalOpt);
                                reject(errMsg);
                                return;
                            }
                            resolve(r.res);
                        })
                        .catch(reject);
                },
                fail: err => {
                    err.errMsg = err.errMsg == 'request:fail timeout' ? '网络超时，请稍后再试' : err.errMsg;
                    console.log(err, config, '报错打印');
                    reject(err || '网络超时，请稍后再试');
                },
                complete: () => {
                    loading && uni.hideLoading();
                },
            });
            lastRequest = task;
        });
    }

    return { request };
}

export { createEngine };
