<template>
    <view class="page-pendding">
        <Header title="注销审核中" backgroundColor="#fff" />
        <view class="page-main">
            <view class="card">
                <image class="card-icon" :src="icon" />
                <view class="card-title">账号注销审核中</view>
                <view class="card-desc">您的注销申请已提交，我们将在1-3个工作日内审核处理，请您耐心等待。</view>
                <view class="card-desc">审核结果将通过消息通知或短信告知您。</view>
            </view>

            <view class="home-btn" @click="goHome">返回首页</view>

            <view class="contact">如有疑问，请联系客服：400-123-4567</view>
        </view>
    </view>
</template>

<script>
import Header from '@/components/Header/z1Header.vue';

export default {
    components: {
        Header,
    },
    data() {
        return {
            icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702953990205fe6dd.png',
        };
    },
    methods: {
        goHome() {
            this.$store.dispatch('BackHome');
        },
    },
};
</script>
<style lang="scss" scoped>
.page-pendding {
    background: #f3f3f3;
    height: 100vh;
    .page-main {
        padding: 60rpx 24rpx;
        .card {
            background: #fff;
            border-radius: 16rpx;
            padding: 60rpx 40rpx;
            text-align: center;
            &-icon {
                width: 90rpx;
                height: 90rpx;
                margin: 0 auto 24rpx;
                display: block;
            }
            &-title {
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
                margin-bottom: 30rpx;
            }
            &-desc {
                font-size: 28rpx;
                color: #666;
                line-height: 46rpx;
            }
        }
        .home-btn {
            background: #e54d42;
            color: #fff;
            text-align: center;
            height: 88rpx;
            line-height: 88rpx;
            border-radius: 44rpx;
            font-size: 30rpx;
            margin-top: 50rpx;
        }
        .contact {
            text-align: center;
            font-size: 24rpx;
            color: #999;
            margin-top: 40rpx;
        }
    }
}
</style>
