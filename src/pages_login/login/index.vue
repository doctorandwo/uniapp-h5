<template>
    <view class="pages-login">
        <view class="top-section" :style="{ 'background-image': `url(${IMAGES.bg})` }">
            <!-- <view class="top-title">您好</view>
            <view class="top-tag">欢迎使用{{ appName }}</view> -->
        </view>

        <view class="main-content">
            <LoginMode v-if="['mode', 'wechat'].includes(action)" :logo="IMAGES.logo" :title="appName" @modeSelect="modeSelect" />

            <template v-else-if="['password', 'captcha'].includes(action)">
                <PhoneLogin :appName="appName" :isAgreement="isAgreement" @back="action = 'mode'" @agreement="isAgreement = true" />
                <view style="height: 28rpx" />
                <CheckAgreement v-model="isAgreement" :appName="appName" />
            </template>

            <view class="register" @click="toRegister">
                <view class="register-image">
                    <image :src="IMAGES.phoneOn" class="register-image-inner" />
                </view>
                <span class="register-text">注册</span>
            </view>
            <view class="agreement-box" v-if="['mode', 'wechat'].includes(action)">
                <CheckAgreement v-model="isAgreement" :appName="appName" />
            </view>
        </view>
        <AuthModal :open.sync="modalOpen" @phoneBind="phoneBind" />
    </view>
</template>

<script>
import { IMAGES } from '../constants';
import LoginMode from './components/LoginMode.vue';
import CheckAgreement from './components/CheckAgreement.vue';
import PhoneLogin from './components/PhoneLogin.vue';
import { getWxLoginCode, wxAuthLogin } from './wxLogin.js';
import AuthModal from './components/AuthModal.vue';

export default {
    components: { LoginMode, CheckAgreement, PhoneLogin, AuthModal },
    data() {
        return {
            IMAGES,
            appName: this.$ui.brand.name, // @by oh-my-zerone 2026-10-08
            isAgreement: false,

            // action: mode(选择登录方式)；password(账号密码登录)；captcha(验证码登录)；wechat(快捷登录)
            action: 'mode',

            modalOpen: false, // 授权登录弹窗
        };
    },
    methods: {
        modeSelect({ name, value }) {
            console.log(name, value);
            this.action = value;
            if (value === 'wechat') {
                if (!this.isAgreement) {
                    this.checkAgreement();
                    return;
                }
                this.wxLogin();
            }
        },
        toRegister() {
            uni.navigateTo({ url: '/pages_login/register/index' });
        },

        /**
         * @description: 微信授权登陆+手机号绑定登陆
         */
        async wxLogin() {
            uni.$z1.showLoading({ title: '正在登录...', mask: true });
            // 1.微信授权登陆（微信服务器）
            const [err, info] = await getWxLoginCode();
            if (err) {
                uni.$z1.closeLoading();
                return;
            }

            // 2.code换token（公司服务器）--账号已绑定，可直接登陆
            const loginRes = await wxAuthLogin(info.code);
            if (!loginRes) {
                // 3.手机验证弹窗（未绑定手机用户）
                this.modalOpen = true;
                uni.$z1.closeLoading();
                return;
            }
            const { Authorization, expires_in } = loginRes;
            this.loginSuccessed(Authorization, expires_in);
        },
        // 手机号绑定登陆
        async phoneBind(loginRes) {
            if (!loginRes) return;
            console.log('是否登陆成功==', loginRes);
            const { Authorization, expires_in } = loginRes;
            this.loginSuccessed(Authorization, expires_in);
        },
        // 登录成功
        async loginSuccessed(token, expires_in) {
            // uni.setStorageSync('AccountLogin', this.form.phone);
            uni.showToast({ title: '登录成功', icon: 'none' });
            // 1.存储token
            this.$store.commit('UPDATE_TOEKN', token);
            // 2. 拉取用户数据（用户信息，按钮权限等等）
            uni.showLoading({ title: '加载用户信息...', mask: true });
            const isOk = await this.$store.dispatch('GetInfo');
            if (!isOk) {
                setTimeout(() => uni.hideLoading(), 1500);
                return;
            }
            uni.hideLoading();
            uni.useJsBridge('showFloatingTip'); // 显示原生的悬浮按钮
            // 3.跳转对应页面
            this.$store.dispatch('BackHome');
            console.log('登录成功', token, expires_in);
        },
        // 检查协议
        checkAgreement() {
            const content = `是否同意《${this.appName}用户协议》与《${this.appName}隐私政策》？`;
            const success = res => {
                if (!res.confirm) return;
                this.isAgreement = true;
                this.wxLogin();
            };
            uni.showModal({ title: '提示', content, success });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

%bg-style {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: left top;
}

// 顶部
$top-height: 500rpx;

.pages-login {
    height: 100vh;

    .top-section {
        @extend %bg-style;
        position: fixed;
        width: 100%;
        height: $top-height;
        color: #333;
        padding-top: 140rpx;
        padding-left: 60rpx;

        .top-title {
            font-size: 52rpx;
            font-weight: bold;
            margin-bottom: 35rpx;
        }
        .top-tag {
            font-size: 28rpx;
            letter-spacing: 5rpx;
            font-style: italic;
            &:first-letter {
                font-size: 1.4em;
                font-weight: bolder;
                margin-right: 5rpx;
            }
        }
    }
    .main-content {
        position: absolute;
        @include inset;
        top: calc(#{$top-height} - 100rpx);
        width: 100%;
        background-color: #fff;
        border-radius: 50rpx 50rpx 0 0;
        padding: 62rpx 68rpx 0;

        > * {
            position: relative;
        }
        .register {
            position: absolute;
            bottom: calc(18% + env(safe-area-inset-bottom));
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            @include flex-gap(15rpx, column);

            &-image {
                padding: 24rpx;
                background-color: #f7f8fa;
                border-radius: 50%;
                box-sizing: border-box;
                line-height: 0;
                &-inner {
                    $s: 48rpx;
                    width: $s;
                    height: $s;
                }
            }
            &-text {
                font-size: 28rpx;
                color: #596794;
            }
        }
        .agreement-box {
            $p: 40rpx;
            position: absolute;
            bottom: calc(10rpx + env(safe-area-inset-bottom));
            left: $p;
            right: $p;
        }
    }
}
</style>
