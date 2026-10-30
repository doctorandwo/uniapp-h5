import Vue from 'vue';
import Store from '@/store';
import Loader from '../loader';
import { useDefineConfig } from '@/common/platform/config';
import { getToken } from '@/common/utils/auth.js';

async function createApp(app) {
    // 原生桥接-获取头部信息
    Store.commit('SET_HEADER', {
        ...Loader.defaultHeader,
    });

    // z1-h5组件库头部信息配置
    useDefineConfig(Store.state.header.headerInfo, Store.state.header.statusBarHeight);

    if (getToken()) {
        Store.dispatch('GetInfo').finally(() => {
            app.$mount();
        });
    } else app.$mount();

    // 关闭原生Loading
    Vue.nextTick(() => {
        setTimeout(() => {
            uni.useJsBridge({ name: 'hideLoadingView' });
        }, 100);
    });
}

export { createApp };
