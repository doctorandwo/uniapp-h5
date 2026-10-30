<template>
    <view class="line-progress">
        <view class="line" :style="{ '--percent': `${percent}%` }">
            <view class="bubble">{{ percent }}% </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            percent: 50,
        };
    },
};
</script>

<style lang="scss" scoped>
%circle {
    border-radius: 50%;
    $size: 10rpx;
    width: $size;
    height: $size;
    display: block;
}
%bubble {
    background: linear-gradient(90deg, #3a65ff 0%, #a8b9f6 100%);
    border: 2rpx solid #fff;
    border-radius: 999rpx;
    box-shadow: 0px 3rpx 4rpx 1rpx rgba(0, 0, 0, 0.05);
    padding: 4rpx 11rpx;
    box-sizing: border-box;
}

$color-done: #3a65ff;
$color-un-done: #c4d1ff;

.line-progress {
    width: 100%;
    position: relative;

    .line {
        position: absolute;
        left: 0;
        right: 0;
        height: 3rpx;
        background: linear-gradient(90deg, $color-done 0%, $color-done var(--percent), $color-un-done var(--percent), $color-un-done 100%);

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            transform: translate(-50%, -50%);
            @extend %circle;
            background: $color-done;
        }
        &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            transform: translate(50%, -50%);
            @extend %circle;
            background: $color-un-done;
        }
        .bubble {
            position: absolute;
            top: 0;
            left: var(--percent);
            transform: translate(-50%, -50%);

            @extend %bubble;

            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            font-weight: bold;
            color: #fff;
            font-family: Douyin Sans, Douyin Sans;
        }
    }
}
</style>
