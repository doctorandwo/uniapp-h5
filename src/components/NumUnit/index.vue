<template>
    <view class="num-unit" :style="{ '--color': color }">
        <view class="num-unit__num">{{ num }}</view>
        <view class="num-unit__unit" :style="{ 'margin-left': gap }">{{ unit }}</view>
    </view>
</template>

<script>
export default {
    props: {
        num: {
            type: [String, Number],
            default: '',
        },
        unit: {
            type: String,
            default: '',
        },
        gap: {
            type: String,
            default: '0rpx',
        },
        color: {
            type: String,
            default: '',
        },
    },
    computed: {},
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
.num-unit {
    display: flex;
    align-items: center;
    color: var(--color);

    .num-unit__num {
        font-size: 32rpx;
        font-weight: bold;
    }
    .num-unit__unit {
        font-size: 24rpx;
        font-weight: normal;
    }
}
</style>
