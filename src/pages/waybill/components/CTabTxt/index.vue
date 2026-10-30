<template>
    <view class="c-tab-txt">
        <view class="item" :class="{ active: current == item.value }" v-for="item in items" :key="item.value" @click.stop="tabClick(item)">{{ item.label }}</view>
    </view>
</template>

<script>
export default {
    name: 'CTabTxt',
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

.c-tab-txt {
    display: flex;
    border-radius: 24rpx;
    overflow: hidden;
    width: max-content;

    .item {
        color: #333;
        font-size: 24rpx;
        font-weight: bold;
        margin-right: 30rpx;
        &:last-child {
            margin-right: 0;
        }
        &.active {
            color: #3a65ff;
            // @extend %bg-active;
        }
    }
}
</style>
