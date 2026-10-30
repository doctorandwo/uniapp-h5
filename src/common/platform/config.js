/**
 * @by oh-my-zerone 2026-09-30
 * @description 跨端组件库全局配置（H5 / 微信小程序）。
 *   由原 common/utils/z1UI.js 收敛至 platform，统一组件库 defineConfig 出口。
 */

// components
// #ifdef H5
import 'zjz1-h5-ui/style.scss';
import { defineConfig } from 'zjz1-h5-ui/core';
// #endif

// platform
import Nav from '@/common/platform/navigate';

function useDefineConfig(header = {}, statusBarHeight) {
    // #ifdef MP-WEIXIN
    // 微信小程序不引入 zjz1-h5-ui，无需 defineConfig，直接 no-op 避免打包 H5 依赖
    return;
    // #endif

    // #ifdef H5
    const baseUrl = process.env.VUE_APP_BASE_API;

    defineConfig({
        // 头部导航全局配置
        nav: {
            statusBarHeight: () => {
                return statusBarHeight || uni.getStorageSync('statusBarHeight');
            },
            onClose: () => {
                Nav.close();
            },
            onBack: pages => {
                if (pages && pages.length > 1) {
                    Nav.back();
                } else {
                    Nav.close();
                }
            },
        },

        // 组件内使用的请求配置
        request: {
            baseUrl,
            header: () => {
                return {
                    'Produce-Code': header['Produce-Code'],
                    'App-Code': header['App-Code'],
                    'App-Version': header['App-Version'],
                    'Terminal-Type': header['Terminal-Type'],
                    Authorization: header['Authorization'],
                };
            },
        },
    });
    // #endif
}

export { useDefineConfig };
