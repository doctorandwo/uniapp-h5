<template>
    <view class="login-mode">
        <view class="logo">
            <image :src="logo" class="logo-image" />
            <span class="logo-txt">{{ title || '' }}</span>
        </view>
        <view class="mode">
            <view class="mode-item" :class="mode.class" v-for="mode in modes" :key="mode.value" @click="$emit('modeSelect', mode)">{{ mode.name }}</view>
            <view class="btn-text" @click="$store.dispatch('BackHome')">暂不登录</view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        logo: { type: String, default: '' },
        title: String,
    },
    data() {
        return {
            modes: [
                { name: '快捷登录', value: 'wechat', class: 'primary' },
                { name: '手机号登录', value: 'password', class: 'info' },
            ],
        };
    },
    methods: {},
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

%btn-style {
    color: #fff;
    font-size: 34rpx;
    border-radius: 999rpx;
    text-align: center;
    padding: 20rpx 0;
}
.btn-text {
    font-size: 28rpx;
    color: #999;
    padding: 20rpx;
}

.login-mode {
    .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        @include flex-gap(28rpx, column);

        &-image {
            $w: 112rpx;
            width: $w;
            height: $w;
            box-shadow: 0 3rpx 6rpx 1rpx rgba(198, 203, 217, 0.68);
            border-radius: 20rpx;
        }
        &-txt {
            font-size: 32rpx;
            color: #333;
        }
    }
    .mode {
        margin-top: 54rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        @include flex-gap(28rpx, column);
        width: 100%;

        &-item {
            width: 100%;
            @extend %btn-style;
            background-color: #3a65ff;

            &.info {
                background-color: unset;
                border: 1rpx solid #e3e3e3;
                color: #3e4051;
            }
        }
    }
}
</style>
