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

    // @by oh-my-zerone R-D: 立即挂载，GetInfo 并行发起、不阻塞首屏
    app.$mount();
    const hasToken = getToken();
    if (hasToken) {
        Store.dispatch('GetInfo');
    }

    // @by oh-my-zerone R-H: 应用实例挂载完成后立即关闭原生 loading
    uni.useJsBridge({ name: 'hideLoadingView' });
}

export { createApp };
