<template>
    <view class="page-reset-password">
        <CPage>
            <ResetPasswordForm :telno="telno" :state="resetPwd.state" @send-captcha="onSendCaptcha" @submit="onSubmit" />
        </CPage>

        <!-- 左上角返回按钮：与 CPage 顶部装饰区重叠（fixed 定位 + 高 z-index） -->
        <view v-if="canBack" class="back-fab" hover-class="back-fab--active" @click="onBack">
            <image class="back-fab__icon" :src="IMAGES.back" />
        </view>
    </view>
</template>

<script>
import CPage from '@/pages_login/components/CPage.vue';
import ResetPasswordForm from './ResetPasswordForm.vue';
import { useResetPassword } from './useResetPassword';
import { IMAGES } from '@/pages_login/constants';
import { TIPS } from './constants';

/**
 * @file pages_login/resetPassword/index.vue  修改密码页外壳
 *
 * 外壳结构对齐 register/setPassword/index.vue（<CPage> + 表单组件 + 内联标题）；
 * 左上角额外加一个 fixed 浮动返回按钮（不在 CPage 内部，避免与其 top-section 装饰冲突）。
 *
 * 职责边界：本文件只做「页面级编排」——
 *   1. 从 store 取手机号并注入表单组件（telno prop）；
 *   2. 监听表单组件的 send-captcha / submit 事件，接线到 hook 的 actions；
 *   3. 判定返回按钮可用性；
 *   4. 提交成功后的登录态清理与跳转。
 * 表单校验、请求、倒计时等业务逻辑全部下沉到 useResetPassword.js。
 *
 * —— 微信小程序语法与数据通道兼容性 ——
 *  - 本文件 <script> 仅使用标准 ES6+/ES2017（async/await，解构，箭头函数）；
 *  - 不使用 #ifdef 注释块（uni 模板条件编译仅在 <template>/<style> 内有效，JS 块内只是注释，无意义）；
 *  - getCurrentPages 是 uni 全局同步 API，H5 与微信小程序都可用，直接调用即可；
 *  - 小程序端 props/事件数据通道会剥离函数：子组件不再接收「函数集合 actions」，
 *    行为统一由页面在此监听 $emit 事件后调用 hook actions；
 *  - 不引入新依赖。
 */
export default {
    components: { CPage, ResetPasswordForm },
    data() {
        return {
            IMAGES,
            telno: '',
            // 路由栈内层级 > 1 才显示返回按钮（栈底页时返回键无效）
            canBack: false,
            resetPwd: useResetPassword({
                // 注意：这里 onSuccess 走箭头函数保留 vm 引用（绑定到外层 this）
                onSuccess: () => this.handleSuccess(),
            }),
        };
    },
    onLoad() {
        this.telno = this.resolveTelno();
        if (!this.telno) this.warnTelnoMissing();
        // 路由栈深度判定：栈底页时隐藏返回按钮，避免按下无效
        this.canBack = this.resolveCanBack();
    },
    onUnload() {
        this.resetPwd.actions.destroy();
    },
    methods: {
        /**
         * 从 vuex 读取当前用户手机号
         * userInfo.phonenumber 是项目内权威字段（与 T_RegisterForm 同源）；
         * 见 pages_auth/auth/idCard.vue、pages_quoteCreate/createQuote/index.vue 现有用法。
         * @returns {string} 手机号；缺失时返回空串
         */
        resolveTelno() {
            const u = (this.$store && this.$store.getters && this.$store.getters.userInfo) || {};
            return u.phonenumber || '';
        },

        /**
         * 判定是否可返回上级页面
         * getCurrentPages 是 uni 全局同步 API，不分端，无需 typeof 检查
         * @returns {boolean} 路由栈深度 > 1 时为 true
         */
        resolveCanBack() {
            try {
                return getCurrentPages().length > 1;
            } catch (e) {
                return false;
            }
        },

        /**
         * 手机号缺失时的兜底：提示后重定向到设置页
         * @returns {void}
         */
        warnTelnoMissing() {
            uni.showModal({
                title: '提示',
                content: TIPS.telnoMissing,
                showCancel: false,
                success: () => uni.redirectTo({ url: '/pages_login/setting/index' }),
            });
        },

        /** 返回上级页面（settings/index）；栈底时禁用 */
        onBack() {
            if (!this.canBack) return;
            uni.navigateBack({ delta: 1 });
        },

        /**
         * 子组件「获取验证码」事件 → hook sendCaptcha
         * 手机号由页面（vuex userInfo）提供；不随 props 下发函数，故统一经事件在此接线
         * @returns {void}
         */
        onSendCaptcha() {
            this.resetPwd.actions.sendCaptcha(this.telno);
        },

        /**
         * 子组件「提交」事件 → hook submit
         * 载荷由子组件本地表单 + telno prop 组装（纯数据，可跨端序列化）
         * @param {object} payload 表单载荷（telno / captcha / password / passwordAgain）
         * @returns {void}
         */
        onSubmit(payload) {
            this.resetPwd.actions.submit(payload || {});
        },

        /**
         * 修改密码成功后的收尾：清登录态 → 跳登录页
         * 与 setting/index.vue 的登出流程保持同源（uni.useToLoginView + store.dispatch('LogOut')）
         * @returns {void}
         */
        handleSuccess() {
            this.$store.dispatch('LogOut');
            uni.useToLoginView();
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

/**
 * 左上角浮动返回按钮
 *  - 位置 top 100rpx：避开 uni 状态栏（h5 端）和 MP 胶囊
 *  - z-index 100：高于页面内大多数元素（z1-header 默认 99；CPage top-section 无 z-index）
 *  - 用 hover-class 做按下反馈
 */
.back-fab {
    position: fixed;
    top: 100rpx;
    left: 24rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    &__icon {
        width: 36rpx;
        height: 60rpx;
    }

    &--active {
        opacity: 0.55;
    }
}
</style>
