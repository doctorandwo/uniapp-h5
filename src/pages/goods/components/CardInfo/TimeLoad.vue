<template>
    <view class="time-load">
        <view class="date">
            <span class="num-month">{{ effectiveTime.month }}</span>
            <span>月</span>
            <span class="num-day">{{ effectiveTime.day }}</span>
            <span>日</span>
            <span>开始</span>
        </view>
        <image :src="$global.getImageUrl('pages/goods/icon-arrow.png')" class="arrow" mode="scaleToFill" />
        <view class="date">
            <span class="num-month">{{ expirationTime.month }}</span>
            <span>月</span>
            <span class="num-day">{{ expirationTime.day }}</span>
            <span>日</span>
            <span>结束</span>
        </view>
    </view>
</template>

<script>
import dayjs from 'dayjs';
export default {
    props: {
        info: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {};
    },
    computed: {
        effectiveTime() {
            if (!this.info.loadingTime) return '';
            const date = dayjs(this.info.loadingTime);
            return {
                month: date.month() + 1,
                day: date.date(),
                hour: date.hour(),
                minute: date.minute(),
                second: date.second(),
            };
        },
        expirationTime() {
            if (!this.info.unloadingTime) return '';
            const date = dayjs(this.info.unloadingTime);
            return {
                month: date.month() + 1,
                day: date.date(),
                hour: date.hour(),
                minute: date.minute(),
                second: date.second(),
            };
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.time-load {
    display: flex;
    align-items: center;
    @include flex-gap(4rpx); // 设计稿 194:7192 装卸货时间 gap 4

    .date {
        font-weight: bold;
        font-size: 20rpx;
        color: #333333;
        .num-month,
        .num-day {
            font-size: 32rpx;
        }
    }
    .arrow {
        width: 20rpx;
        height: 10rpx;
    }
}
</style>
