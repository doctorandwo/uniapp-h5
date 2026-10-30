<template>
    <CPage>
        <PhoneValidate />
        <view class="to-login" @click="toLogin">
            <span>已有账号？</span>
            <view class="login-text">
                <span>去登录</span>
                <image class="login-text-image" :src="IMAGES.right" />
            </view>
        </view>
    </CPage>
</template>

<script>
import CPage from '../components/CPage.vue';
import PhoneValidate from './components/PhoneValidate.vue';
import { IMAGES } from '../constants.js';

export default {
    components: { CPage, PhoneValidate },
    data() {
        return {
            IMAGES,
            appName: this.$ui.brand.name, // @by oh-my-zerone 2026-10-08
        };
    },
    methods: {
        toLogin() {
            uni.navigateTo({ url: '/pages_login/login/index' });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.to-login {
    width: max-content;
    margin: 15% auto 0;
    display: flex;

    .login-text {
        display: flex;
        align-items: center;
        @include flex-gap(10rpx);
        color: $uni-color-primary;
        &-image {
            width: 18rpx;
            height: 32rpx;
        }
    }
}
</style>
