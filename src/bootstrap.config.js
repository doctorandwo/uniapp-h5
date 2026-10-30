import { defineConfig } from './bootstrap/bootstrap.js';
import uniPlus from './bootstrap/uni-plus.js';
import HEADER from '@/HEADER.js';

import components from './common/config/components.js'; // 全局组件挂载
import global from './common/config/global.js'; // 全局变量
import { reqAuthCheck, reqWithHeader, reqWithToken, reqFormatParams, res500, res400, res401, resErre, resSuccess, resRealData } from './common/request/middleWare';

import store from '@/store';
import { configureRequest, createUnauthorizedHandler } from '@/common/request/http';

// #ifdef H5
import VConsole from '@/libs/vconsole.min';
new VConsole();
// #endif

/**
 * @title bootstrap.config.js 本框架项目配置文件
 * @description 前端框架配置入口
 */
const config = defineConfig({
    uniPlus, // uni 扩展，可以在这里添加 uni 的扩展方法，添加后可通过 uni.xxxx 使用
    wxAuthorization: '/pages_login/login/index', // 授权页 微信配置此

    // @by oh-my-zerone 2026-10-08
    // 全项目通用品牌 UI 配置，集中管理品牌名、运营主体、联系方式等字段
    ui: {
        brand: {
            name: '至简集运(新版)', // 品牌/产品名称
            company: '福建至简至一信息科技有限公司', // 运营主体
            companyAddress: '福建省福州市福清市龙田镇龙飞路95-3-37', // 公司注册地址
            servicePhone: '4008270535', // 客服电话/服务热线
            website: 'http://www.zjz1.net/skywalk', // 官网地址
            logo: 'pages_login/icon_logo.png', // 登录页 Logo 路径（使用时经 global.getImageUrl 转换）
            slogan: '', // 品牌标语（预留）
        },
    },

    // 框架请求配置
    request: {
        // 请求的基础地址
        baseUrl: process.env.VUE_APP_NODE_TYPE.indexOf('wx') !== -1 ? process.env.VUE_APP_BASE_HOST : process.env.VUE_APP_BASE_API, // 正式
        // 需要忽略拦截器的请求地址，配置后的路径不会经过请求中间件
        ignore: [
            '/auth/getPublicKey',
            '/auth/pwd_login_new',
            '/auth/send_sms',
            '/auth/check_captcha',
            '/auth/sms_login',
            '/auth/registerUser',
            /^\/jzcms\/content\/.+/,
            '/system/dict/data/type/information_type',
            '/chf/serviceCategory/service/list',
            '/chf/demandOrder/serviceSide/demandOrderList',
            '/chf/demandOrder/serviceSide/demandOrderDetail',
            '/chf/esBusinessDeclaration/statistics',
            '/auth/wxOneClickLogin/',
        ],
        // 请求中间件
        requestMiddleWare: [reqAuthCheck, reqWithHeader, reqWithToken, reqFormatParams],

        // 响应中间件
        responseMiddleWare: [resRealData, resErre, res500, res400, res401, resSuccess],
        // 默认是 header
        getHeader: HEADER,
        // 请求 code 错误信息
        errCodeMsg: {
            400: '后端未找到相应信息',
            401: '认证失败，无法访问系统资源',
            403: '当前操作没有权限',
            404: '服务器升级中，请稍后重试。',
            500: '服务器出错，请稍后再试',
            1001: '系统未知错误，系统未知错误，请反馈给管理员',
            default: '系统未知错误，请反馈给管理员',
        },
    },

    // 全局常量 命名使用$开头 通过 this.$global 获取 不可修改
    global: global,
    // 全局组件
    components: components,
});

// 导出配置和初始化方法
export default config;
export const initBootstrap = () => {
    // 向请求器注入 store 相关登出逻辑（http.js 本身零 store 依赖，避免初始化期循环依赖）
    configureRequest({
        onUnauthorized: createUnauthorizedHandler(() => store.dispatch('LogOut')),
        onTokenExpired: () => {
            store.dispatch('LogOut');
            uni.useToLoginView();
        },
    });
    config.init();
};
