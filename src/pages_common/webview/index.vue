<template>
    <web-view :src="webviewUrl" :load="load" @error="error" :fullscreen="false" />
</template>

<script>
import * as Auth from '@/common/utils/auth';
import { obj2QueryString } from './utils.js';
import { EP } from '@/common/utils/envPlaceholder';

export default {
    data() {
        return {
            webviewUrl: '',
            clickEventData: {},
        };
    },
    onLoad(options) {
        let clickEventData;
        try {
            clickEventData = JSON.parse(options.clickEventData);
        } catch (e) {
            clickEventData = {};
        }
        this.clickEventData = clickEventData;

        this.init();
    },
    methods: {
        load() {
            console.log('load', this.webviewUrl);
        },
        error() {
            console.log('error', this.webviewUrl);
        },
        init() {
            const { webviewUrl, childRoute, ...rest } = this.clickEventData;
            if (!webviewUrl) {
                console.log('错误：webviewUrl is empty');
                return;
            }
            const queryString = obj2QueryString({ ...this.necessaryQuery(), ...rest });

            this.webviewUrl = this.getFinalWebviewUrl(webviewUrl, childRoute, queryString);
            console.log('webviewUrl', this.webviewUrl);
        },
        /* 解析webviewUrl，有占位符的路径，替换成实际路径，没有的直接返回 */
        getFinalWebviewUrl(url, childRoute = '', queryString) {
            const { changePath } = this.$global.useEnvPlaceholder();
            const [host, path] = changePath(url).split('/#/');
            let newUrl;
            if (url.includes('<#micro-source-h5>') || url.includes(EP?.['<#micro-source-h5>'])) {
                newUrl = `${host}/?${queryString}${path}/#/${childRoute}`; // 独立h5到子路由
            } else {
                newUrl = `${host}/?timeStamp=${Date.now()}/#/${path}?${queryString}`;
            }

            return newUrl;
        },
        /* 必填参数 */
        necessaryQuery() {
            const { userInfo, headerInfo, statusBarHeight } = this.$store.getters;
            // 看是编译成h5还是小程序。
            const plat = process.env?.VUE_APP_NODE_TYPE?.includes('h5') ? 'h5' : 'mp-weixin';
            const query = {
                header: encodeURIComponent(JSON.stringify(headerInfo)),
                token: Auth.getToken(),
                enterpriseCode: userInfo.enterpriseCode,
                networkCode: userInfo.networkCode,
                plat: plat, // mp-weixin: 开启的webview不需要头部； h5: 开启的webview中的h5页面需要头部
                timeStamp: Date.now(),
                // #ifdef H5
                statusBarHeight: statusBarHeight,
                // #endif
            };
            return query;
        },
    },
};
</script>

<style lang="scss" scoped></style>
