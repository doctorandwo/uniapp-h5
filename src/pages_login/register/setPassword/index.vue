<template>
    <CPage>
        <PasswordSet :options="options" @toLogin="toLogin" />
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
import { IMAGES } from '../../constants.js';
import CPage from '../../components/CPage.vue';
import PasswordSet from './PasswordSet.vue';

export default {
    components: { CPage, PasswordSet },
    data() {
        return {
            IMAGES,
            appName: this.$ui.brand.name, // @by oh-my-zerone 2026-10-08
            options: {},
        };
    },
    onLoad(options) {
        this.options = options;
    },
    methods: {
        toLogin() {
            if (this.options.phone) uni.setStorageSync('AccountLogin', this.options.phone); // 存下登录账号
            const url = '/pages_login/login/index';
            uni.redirectTo({ url });
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
