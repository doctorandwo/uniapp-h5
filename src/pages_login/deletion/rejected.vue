<template>
    <view class="page-rejected">
        <Header title="注销审核不通过" backgroundColor="#fff" />
        <view class="page-main">
            <view class="card">
                <image class="card-icon" :src="icon" />
                <view class="card-title">账号注销审核不通过</view>
                <view class="card-desc">很抱歉，您的注销申请未通过审核，您可根据下方原因处理后重新提交申请。</view>

                <view class="reason">
                    <view class="reason-label">不通过原因</view>
                    <view class="reason-content">{{ reason || '暂无' }}</view>
                </view>
            </view>

            <view class="submit-btn" @click="reApply">重新申请注销</view>

            <view class="home-btn" @click="goHome">返回首页</view>

            <view class="contact">如有疑问，请联系客服：400-123-4567</view>
        </view>
    </view>
</template>

<script>
import Header from '@/components/Header/z1Header.vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiGetCurrentApply } from './services.js';

export default {
    components: {
        Header,
    },
    data() {
        return {
            icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702953990205fe6dd.png',
            reason: '',
        };
    },
    onLoad(options) {
        // 优先使用路由带入的原因；缺省时（如直接打开本页、原因过长被截断）兜底重新拉取一次
        if (options && options.reason) {
            this.reason = decodeURIComponent(options.reason);
            return;
        }
        this.fetchReason();
    },
    methods: {
        /** 兜底拉取审核不通过原因 */
        async fetchReason() {
            const [err, res] = await useRequest(ApiGetCurrentApply);
            if (err) return;
            const apply = res && res.data;
            this.reason = (apply && apply.reason) || '';
        },
        /** 重新申请注销：回到申请页，提交后会生成新的注销申请 */
        reApply() {
            uni.redirectTo({ url: '/pages_login/deletion/index' });
        },
        goHome() {
            this.$store.dispatch('BackHome');
        },
    },
};
</script>
<style lang="scss" scoped>
.page-rejected {
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
        .reason {
            margin-top: 40rpx;
            background: #f7f7f7;
            border-radius: 12rpx;
            padding: 24rpx;
            text-align: left;
            &-label {
                font-size: 26rpx;
                color: #999;
                margin-bottom: 12rpx;
            }
            &-content {
                font-size: 28rpx;
                color: #e54d42;
                line-height: 44rpx;
                word-break: break-all;
            }
        }
        .submit-btn {
            background: #e54d42;
            color: #fff;
            text-align: center;
            height: 88rpx;
            line-height: 88rpx;
            border-radius: 44rpx;
            font-size: 30rpx;
            margin-top: 50rpx;
        }
        .home-btn {
            background: #fff;
            color: #666;
            text-align: center;
            height: 88rpx;
            line-height: 88rpx;
            border-radius: 44rpx;
            font-size: 30rpx;
            margin-top: 24rpx;
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
