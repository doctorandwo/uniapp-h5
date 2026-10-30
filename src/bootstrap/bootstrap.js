import Loader from './loader.js';
import Vue from 'vue';

let configInstance = null;

/**
 * 定义应用配置并返回初始化方法
 * @param {Object} options - 配置选项
 * @param {Function} options.request - 请求拦截器或配置
 * @param {Object} options.global - 全局配置对象
 * @param {Object} options.components - 需要注册的全局组件
 * @param {Object} options.uniPlus - uni-app 扩展配置
 * @param {Object} options.wxAuthorization - 微信授权相关配置
 * @returns {{ init: Function, config: Object }} 包含初始化方法和当前配置的对象
 */
// @by oh-my-zerone 2026-10-08
function defineConfig({ request, global, components, uniPlus, wxAuthorization, ui }) {
    // 保存配置但不立即实例化 Loader
    configInstance = { ctx: Vue, request, global, components, uniPlus, wxAuthorization, ui };

    // 返回一个初始化方法，供后续手动调用
    const init = () => {
        if (configInstance && !Loader.initialized) {
            new Loader(configInstance);
            Loader.initialized = true;
        }
        return Loader;
    };

    return {
        init,
        config: configInstance,
    };
}

export { defineConfig };
