<template>
    <view class="list" :style="{ 'max-height': maxHeight }">
        <view class="item" :class="{ active: item[valueKey] === _current }" v-for="item in list" :key="item[valueKey]" @click="selectItem(item)">
            <view class="item__txt">{{ item[labelKey] }}</view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        labelKey: {
            type: String,
            default: 'label',
        },
        valueKey: {
            type: String,
            default: 'value',
        },
        current: {
            type: [String, Number],
            default: () => '',
        },
        maxHeight: {
            type: String,
            default: () => '400rpx',
        },
    },
    computed: {
        _current: {
            get() {
                return this.current;
            },
            set(v) {
                this.$emit('update:current', v);
            },
        },
    },
    data() {
        return {};
    },
    methods: {
        selectItem(item) {
            this._current = item[this.valueKey];
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
.list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    @include flex-gap(10rpx, column);

    .item {
        min-height: 68rpx;
        font-size: 28rpx;
        color: #999;
        background-color: #f6f6f6;
        display: flex;
        align-items: center;

        &__txt {
            width: 100%;
            padding: 0 54rpx;
        }
        &.active {
            background-color: #fff;
            color: #3a65ff;
            font-weight: bold;
        }
    }
}
</style>
