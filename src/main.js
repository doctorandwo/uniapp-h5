// #ifdef H5
import '@babel/polyfill';
import Es6Promise from 'es6-promise';

require('es6-promise').polyfill();
Es6Promise.polyfill();
// #endif

import Vue from 'vue';
import App from './App.vue';
import './uni.adaptor';
import store from './store';

Vue.config.productionTip = false;
App.mpType = 'app';

const app = new Vue({
    ...App,
    store,
});

import { initBootstrap } from '@/bootstrap.config.js';
initBootstrap();

//#ifdef MP-WEIXIN
import Loader from '@/bootstrap/loader.js';
import { getToken } from '@/common/utils/auth.js';
import { useDefineConfig } from '@/common/platform/config';

// vuex中注册头部信息
store.commit('SET_HEADER', { ...Loader.defaultHeader });

// z1-h5组件库头部信息配置
useDefineConfig(store.state.header.headerInfo, store.state.header.statusBarHeight);

if (getToken()) {
    store.dispatch('GetInfo');
    app.$mount();
} else app.$mount();
//#endif

// #ifdef H5
import { createApp } from '@/bootstrap/Bridge/createApp';
createApp(app);
// #endif
