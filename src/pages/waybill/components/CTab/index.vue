<template>
    <view class="c-tab">
        <view class="item" :class="{ active: current == item.value }" v-for="item in items" :key="item.value" @click.stop="tabClick(item)">{{ item.label }}</view>
    </view>
</template>

<script>
export default {
    name: 'CTab',
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        value: {
            type: [String, Number],
            default: '',
        },
    },
    data() {
        return {};
    },
    computed: {
        current: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    methods: {
        tabClick(item) {
            this.current = item.value;
            this.$emit('change', item.value, item);
        },
    },
};
</script>

<style lang="scss" scoped>
%bg-active {
    background-color: #fff;
    border-radius: 24rpx;
    box-shadow: 2rpx 1rpx 6rpx 1rpx rgba(0, 0, 0, 0.16);
}

.c-tab {
    padding: 8rpx;
    background-color: #ccd3eb;
    display: flex;
    border-radius: 32rpx;
    overflow: hidden;
    align-items: center;
    box-sizing: border-box;

    .item {
        flex-shrink: 0;
        height: 48rpx;
        padding: 0 24rpx;
        color: #767a87;
        font-size: 24rpx;
        font-weight: bold;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        &.active {
            color: #333;
            @extend %bg-active;
        }
    }
}
</style>
