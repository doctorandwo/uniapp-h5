<template>
    <view class="c-tab-small">
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
.c-tab-small {
    display: flex;
    overflow-x: auto;

    .item {
        flex-shrink: 0;
        color: #666;
        font-size: 24rpx;
        font-weight: bold;
        padding: 6rpx 23rpx;
        margin-right: 30rpx;
        border-radius: 9rpx;
        background-color: #fff;
        &:last-child {
            margin-right: 0;
        }
        &.active {
            color: #3a65ff;
        }
    }
}
</style>
