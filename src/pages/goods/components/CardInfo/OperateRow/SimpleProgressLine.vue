<template>
    <view class="simple-progress-line" :style="{ '--p': progress }">
        <view class="done"></view>
    </view>
</template>

<script>
export default {
    props: {
        progress: {
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
.simple-progress-line {
    height: 13rpx;
    width: 100%;
    min-width: 170rpx;
    background-color: #e7e7e7;
    border-radius: 11rpx;
    position: relative;
    overflow: hidden;
    .done {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: calc(100% - var(--p));
        background-color: #3a65ff;
        border-radius: 11rpx;
    }
}
</style>
