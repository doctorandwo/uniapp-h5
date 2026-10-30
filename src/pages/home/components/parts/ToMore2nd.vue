<template>
    <view class="more" @click="$emit('more')">
        <view class="more-desc">{{ desc }}</view>
        <view class="more-text">{{ title }}</view>
    </view>
</template>

<script>
export default {
    props: {
        desc: { type: String, default: '' },
        title: { type: String, default: '更多' },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
.more {
    display: flex;
    align-items: center;
    @include flex-gap(18rpx);
    &-desc {
        font-size: 24rpx;
        color: #333;
    }
    &-text {
        font-size: 24rpx;
        color: #3a65ff;
    }
}
</style>
