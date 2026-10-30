<template>
    <PageFrame class="page-index" :hasBack="true" bg="#f3f3f3" :hasHeader="true" title="关于我们" head-background="#fff">
        <view class="page-index__body" style="background-color: #fff">
            <view class="logo-box">
                <image class="logo-box-img" :src="images.logoUrl" />
            </view>
            <view class="item bottom">
                <text class="item-label">网站地址</text>
                <text class="item-value">{{ network }}</text>
            </view>
            <view class="item">
                <text class="item-label">服务热线</text>
                <text class="item-value">{{ phone }}</text>
            </view>
        </view>
    </PageFrame>
</template>

<script>
import PageFrame from '@/pages/components/PageFrame/index.vue';

import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
export default {
    components: { PageFrame },
    data() {
        return {
            content: '关于我们',
            network: this.$ui.brand.website, // @by oh-my-zerone 2026-10-08
            phone: this.$ui.brand.servicePhone, // @by oh-my-zerone 2026-10-08
        };
    },
    computed: {
        images() {
            return {
                logoUrl: this.$global.getImageUrl('pages_login/icon_logo.png'),
            };
        },
    },
    mounted() {
        // this.getDetail();
    },
    methods: {
        async getDetail() {
            const [err, res] = await useRequest(ApiGetContentDetail, this.contentId);
            if (err) return;
            const { content } = res.data;
            this.content = content;
        },
    },
};
</script>

<style lang="scss" scoped>
.scroll {
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    box-sizing: border-box;
}
.logo-box {
    height: 293rpx;
    margin: 0 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1rpx #eeeeee solid;
    &-img {
        width: 150rpx;
        height: 150rpx;
        border-radius: 30rpx;
    }
}
.bottom {
    border-bottom: 1rpx #eeeeee solid;
}
.item {
    padding: 30rpx 0;
    margin: 0 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &-label {
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 400;
        color: #333333;
    }
    &-value {
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 400;
        color: #999999;
    }
}
</style>
