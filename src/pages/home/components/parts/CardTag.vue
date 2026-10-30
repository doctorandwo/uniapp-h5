<template>
    <view class="card-tag g-single-row" :class="[className]">
        {{ value }}
    </view>
</template>

<script>
export default {
    props: {
        value: String,
        /* 类名: local | government */
        className: String,
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

@mixin tag($color, $bg, $icon) {
    overflow: visible;
    color: $color;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
    @include flex-gap(2rpx);
    &::before {
        content: '';
        display: block;
        $w: 24rpx;
        width: $w;
        height: $w;
        background: url($icon) no-repeat center center;
        background-size: 100% 100%;
    }
}
.card-tag {
    font-weight: bold;
    font-size: 18rpx;
    color: #808cb6;
    line-height: 35rpx;
    padding: 2rpx 16rpx 1rpx;
    background: #f6f7f9;
    border-radius: 8rpx;
    max-width: 20em;
    white-space: nowrap;

    &.local {
        $url: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1781230655484ee42b2.png';
        @include tag(#003c84, #e6f6fb, $url);
    }
    &.government {
        $url: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1781230648734302f63.png';
        @include tag(#784f21, #f9efd7, $url);
        border-radius: 9rpx;
    }
    &.blue-dark {
        color: #27419c;
        background-color: #eff3ff;
        border-radius: 9rpx;
    }
}
</style>
