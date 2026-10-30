<template>
    <view class="more" @click="$emit('more')">
        <view class="more-text">{{ title }}</view>
        <view class="more-icon"></view>
    </view>
</template>

<script>
export default {
    props: {
        title: { type: String, default: '更多' },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

%arrow-down {
    $size: 12rpx;
    $border: 2rpx solid #666;
    width: $size;
    height: $size;
    border-right: $border;
    border-bottom: $border;
    transform: rotate(-45deg);
}
.more {
    display: flex;
    align-items: center;
    @include flex-gap(11rpx);
    color: #666;
    &-text {
        font-size: 26rpx;
    }
    &-icon {
        @extend %arrow-down;
    }
}
</style>
