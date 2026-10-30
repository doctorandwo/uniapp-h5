<template>
    <view class="c-button" :class="[type]" @click.stop="$emit('click')">
        {{ text }}
    </view>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: 'primary',
            required: true,
            validator: val => ['primary', 'info'].includes(val),
        },
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
.c-button {
    // width: 164rpx;
    min-width: 164rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    border-radius: 30rpx;
    font-size: 26rpx;
    font-weight: bold;
    box-sizing: border-box;

    &.primary {
        background: linear-gradient(54deg, #3370ff 0%, #678eec 100%);
        color: #fff;
    }
    &.info {
        background-color: #fff;
        border: 1px solid #d4d4d4;
        color: #333;
    }
}
</style>
