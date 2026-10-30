<template>
    <view class="custom-indicator">
        <view
            v-for="(item, index) in total"
            :key="index"
            class="indicator-dot"
            :class="{ active: current == index }"
            :style="{
                backgroundColor: current == index ? activeColor : color,
                width: current == index ? activeWidth : width,
                borderRadius: current == index ? activeBorderRadius : borderRadius,
                '--height': height,
            }"
        ></view>
    </view>
</template>

<script>
export default {
    name: 'CustomIndicator',
    props: {
        current: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
        color: {
            type: String,
            default: 'rgba(0,0,0,0.2)',
        },
        activeColor: {
            type: String,
            default: '#3A65FF',
        },
        width: {
            type: String,
            default: '12rpx',
        },
        height: {
            type: String,
            default: '6rpx',
        },
        activeWidth: {
            type: String,
            default: '24rpx',
        },
        borderRadius: {
            type: String,
            default: '999rpx',
        },
        activeBorderRadius: {
            type: String,
            default: '999rpx',
        },
    },
    computed: {},
};
</script>

<style lang="scss" scoped>
.custom-indicator {
    display: flex;
    justify-content: center;
    gap: 4rpx;
}

.indicator-dot {
    height: var(--height);
    transition: all 0.3s;

    &.active {
        transition: all 0.3s;
    }
}
</style>
