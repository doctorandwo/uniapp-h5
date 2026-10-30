<template>
    <view class="status-text" :style="{ '--color': color }">
        <view class="icon-circle" />
        <view class="text">{{ text }}</view>
    </view>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: '待处理',
        },
        color: {
            type: String,
            default: '',
        },
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
.status-text {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--color);
    font-size: 24rpx;
    font-weight: bold;
    .icon-circle {
        $w: 8rpx;
        width: $w;
        height: $w;
        border-radius: 50%;
        background-color: var(--color);
        margin-right: 8rpx;
    }
}
</style>
