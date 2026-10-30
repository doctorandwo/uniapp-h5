<template>
    <view class="aside-filter">
        <image v-if="hasShadow" :src="$global.getImageUrl('pages/home/icon-shadow.png')" mode="scaleToFill" class="icon-shadow" />
        <view class="icon-more-wrap" @click="$emit('more')">
            <image :src="$global.getImageUrl('pages/home/icon-more.png')" class="icon-more" />
        </view>
    </view>
</template>

<script>
export default {
    props: {
        hasShadow: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss" scoped>
.aside-filter {
    position: relative;
    .icon-shadow {
        $w: 40rpx;
        position: absolute;
        top: 0;
        left: -$w;
        width: $w;
        height: 100%;
    }

    .icon-more-wrap {
        margin-left: 11rpx;
        display: flex;
        padding: 13rpx 0;

        &::before {
            content: '';
            display: block;
            align-items: stretch;
            width: 1rpx;
            background: #000;
        }
        .icon-more {
            $w: 26rpx;
            width: $w;
            height: $w;
            margin-left: 11rpx;
        }
    }
}
</style>
