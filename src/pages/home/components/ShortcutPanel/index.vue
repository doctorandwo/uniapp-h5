<template>
    <view class="shortcut-panel">
        <view class="left" :style="{ backgroundImage: `url(${$global.getImageUrl('pages/home/bg-publish.png')})` }" @click="goCreateQuote"> </view>
        <view class="right">
            <view class="right-card yqhy" :style="{ backgroundImage: `url(${$global.getImageUrl('pages/home/bg-yqhy.png')})` }"></view>
            <view class="right-card xsbk" :style="{ backgroundImage: `url(${$global.getImageUrl('pages/home/bg-xsbk.png')})` }"></view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {};
    },
    methods: {
        goCreateQuote() {
            // TODO: 等首页选点完成后，替换为真实选点数据
            const startPoint = encodeURIComponent(
                JSON.stringify({
                    longitude: '119.329352',
                    latitude: '26.047975',
                    provinceCode: '35',
                    cityCode: '3501',
                    districtCode: '350104',
                    province: '福建省',
                    city: '福州市',
                    district: '仓山区',
                    addressName: '闽樾湾',
                    detail: '南江滨西大道88号',
                    alias: '测试起点',
                }),
            );
            uni.navigateTo({
                // @by oh-my-zerone 2026-10-13 与首页快速发布一致：先进入选点页，再由选点页引导进入 createQuote
                url: `/pages_goodsSource/sourcePublish/selectRoute/index?startPoint=${startPoint}`,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

%bg-style {
    background-size: 100% 100%;
    background-position: left top;
    background-repeat: no-repeat;
}

.shortcut-panel {
    display: flex;
    @include flex-gap(34rpx);
    .left {
        width: 348rpx;
        height: 248rpx;
        @extend %bg-style;
    }
    .right {
        display: flex;
        flex-direction: column;
        @include flex-gap(32rpx, column);
        &-card {
            width: 304rpx;
            height: 108rpx;
            @extend %bg-style;
        }
    }
}
</style>
