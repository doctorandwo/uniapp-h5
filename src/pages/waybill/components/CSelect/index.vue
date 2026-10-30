<template>
    <view class="c-select" @click.stop="$emit('click')">
        <view class="label g-single-row">
            <span>{{ label }}</span>
            <view v-if="point" class="point" />
            <span v-else-if="countView"> · {{ countView }}</span>
        </view>
        <view class="triangle" />
    </view>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: '',
        },
        count: {
            type: Number,
            default: 0,
        },
        point: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        countView() {
            if (!this.count) return '';
            if (this.count > 99) return '99+';
            return this.count;
        },
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/icon.scss';

.triangle {
    $w: 18rpx;
    $h: 11rpx;
    flex-shrink: 0;
    width: $w;
    height: $h;
    @include triangle(#333);
    transform: rotate(0deg);
    transition: transform 0.3s ease;
    margin-left: 7rpx;
}
.c-select {
    display: flex;
    align-items: center;
    position: relative;
    .label {
        flex-shrink: 0;
        font-size: 24rpx;
        font-weight: bold;
        color: #333;
    }
    .point {
        position: absolute;
        top: 0;
        right: 14rpx;
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background-color: #ff4d4f;
    }
}
</style>
