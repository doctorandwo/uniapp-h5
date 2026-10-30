<template>
    <view class="location ly-flex-align-center" @click="$emit('location')">
        <image :src="$global.getImageUrl('pages/home/icon-location-small.png')" class="icon-location" />
        <span class="location__txt g-single-row">{{ location || '定位中...' }}</span>
        <!-- <span class="triangle"></span> -->
    </view>
</template>

<script>
export default {
    props: {
        value: {
            type: Object,
            default: () => ({}),
        },
    },
    computed: {
        location: {
            get() {
                return this.value.label || '';
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

%bg-style {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 31rpx;
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.icon-location {
    $w: 21rpx;
    width: $w;
    height: $w;
}
.location {
    @extend %bg-style;
    @include flex-gap(8rpx);
    padding: 8rpx 13rpx;
    padding-right: 22rpx;
    width: max-content;

    &__txt {
        font-weight: bold;
        font-size: 24rpx;
        line-height: 33rpx;
        max-width: 4em;
    }
}
// 倒三角
.triangle {
    $w: 12rpx;
    $h: 8rpx;
    $color: #333;
    width: 0;
    height: 0;
    border-top: $w solid $color;
    border-right: $h solid transparent;
    border-left: $h solid transparent;
}
</style>
