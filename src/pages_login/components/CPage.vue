<template>
    <view class="c-page">
        <view class="top-section" :style="{ 'background-image': `url(${IMAGES.bg})` }">
            <!-- <view class="top-title">您好</view>
            <view class="top-tag">欢迎使用{{ appName }}</view> -->
        </view>

        <view class="main-content">
            <slot></slot>
        </view>
    </view>
</template>

<script>
import { IMAGES } from '../constants.js';

export default {
    data() {
        return {
            IMAGES,
            appName: this.$ui.brand.name, // @by oh-my-zerone 2026-10-08
        };
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

.c-page {
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
    }
}
</style>
