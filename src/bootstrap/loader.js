/**
 * @title zjsj框架加载器
 * @description: 用于加载框架的核心文件
 * @version 1.0.0
 * @author 赖蔡锦 on 2021-11-27
 */
import { getRawBridge } from '@/common/platform/bridge';

class Loader {
    constructor({ ctx, request, global, components, uniPlus, wxAuthorization, ui }) {
        this.ctx = ctx || window;
        this.requestConfig = request;
        this.globalConfig = global;
        this.components = components;
        this.uniPlus = uniPlus;
        this.wxAuthorization = wxAuthorization;
        this.uiConfig = ui;
        this.loadProperties(ctx, global);
        this.loadRequest(request);
        this.loadUniPlusEnter(uniPlus);
        this.loadStatic({ wxAuthorization });
        this.loadUi(ctx, ui);
        this.loadComponents(ctx, components);
    }
    // 初始化标记
    static initialized = false;
    // 请求地址
    static requestBaseUrl = process.env.VUE_APP_BASE_HOST;
    // 不需要拦截的请求地址
    static requestIgnore = [];
    // 默认请求头
    static get defaultHeader() {
        return Loader.getHeader();
    }
    // 错误码对应的错误信息
    static errCodeMsg = {};
    // 授权页
    static wxAuthorization = '/pages_login/login/index';
    // @by oh-my-zerone 2026-10-08 全局 UI 配置（供非组件 JS 直接访问）
    static ui = {};

    static getHeader = new Function();
    /**
     * 中间件
     */
    static middleware = {
        request: [], // req middlewares
        response: [], // res middlewares
    };

    /**
     * 加载全局常量配置
     * @param {*} ctx
     * @param {*} global
     */
    loadProperties(ctx, global = {}) {
        ctx.prototype.$global = global;
        ctx.prototype.storeBridge = getRawBridge;
    }

    /**
     * 挂载静态数据
     * @param {*} param0
     */
    loadStatic({ wxAuthorization }) {
        Loader.wxAuthorization = wxAuthorization;
    }

    /**
     * @by oh-my-zerone 2026-10-08
     * 加载全项目通用 UI 配置，挂载到 Vue 原型与 Loader 静态属性
     * @param {Object} ctx Vue 构造器
     * @param {Object} ui bootstrap.config.js 中的 ui 配置
     */
    loadUi(ctx, ui = {}) {
        ctx.prototype.$ui = ui;
        Loader.ui = ui;
    }

    /**
     * 加载请求器配置
     * @param {*} request
     */
    loadRequest(request) {
        const reqMiddleWare = request.requestMiddleWare.filter(fn => typeof fn === 'function');
        const resMiddleWare = request.responseMiddleWare.filter(fn => typeof fn === 'function');

        Loader.middleware.request = reqMiddleWare;
        Loader.middleware.response = resMiddleWare;
        Loader.requestBaseUrl = request.baseUrl || '';
        Loader.getHeader = request.getHeader || (() => ({}));
        Loader.requestIgnore = request.ignore || [];
        Loader.errCodeMsg = request.errCodeMsg || {};
    }

    loadComponents(ctx, components) {
        components.forEach(component => ctx.component(component.name, component));
    }

    /**
     * 加载uniPlus扩展配置
     * @param {*} plusList
     */
    loadUniPlusEnter(plusList) {
        for (let plus of plusList) {
            {
                if (!plus.name || !plus.get) {
                    console.warn('uniPlus配置错误，存在name或get为空的配置项');
                    continue;
                }
                if (typeof plus.get === 'function') {
                    uni[plus.name] = plus.get.bind(uni);
                } else {
                    uni[plus.name] = plus.get;
                }
            }
        }
    }
}

export default Loader;
