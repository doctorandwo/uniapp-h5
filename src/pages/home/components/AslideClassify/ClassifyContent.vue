<template>
    <view class="classify-content">
        <view class="title">全部分类</view>
        <view class="content">
            <view class="tag" :class="{ active: tag[valueKey] === current }" v-for="(tag, i) in list" :key="i" @click="select(tag, i)"> {{ tag[labelKey] }}</view>
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
        value: {
            type: [String, Number],
            default: '',
        },
    },
    computed: {
        current: {
            get() {
                return this.value;
            },
            set(v) {
                this.$emit('input', v);
            },
        },
    },
    data() {
        return {};
    },
    methods: {
        select(tag, i) {
            this.current = tag[this.valueKey];
            this.$emit('change', tag[this.valueKey], tag, i);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
.classify-content {
    padding: 155rpx 36rpx 30rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    .title {
        font-weight: bold;
        font-size: 40rpx;
        color: #333;
        margin-bottom: 48rpx;
        flex-shrink: 0; // 防止标题被压缩
    }
    .content {
        flex: 1;
        min-height: 0; // 允许 flex 子项缩小到内容以下
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        @include flex-gap(24rpx, column);
        justify-content: space-between;
        .tag {
            min-width: 42%;
            height: max-content;
            padding: 16rpx 72rpx;
            color: #333;
            font-size: 28rpx;
            border-radius: 2rpx;
            background-color: #f1f1f1;
            &.active {
                background: rgba(58, 101, 255, 0.12);
                color: #3a65ff;
            }
        }
    }
}
</style>
