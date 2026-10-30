<template>
    <view class="page-deletion">
        <Header title="注销账号" backgroundColor="#fff" />
        <view class="page-main">
            <view class="notice">
                <image class="notice-icon" :src="icon" />
                <view class="notice-title">注销账号说明</view>
                <view class="notice-desc">注销账号是不可逆的操作，注销后将无法恢复。</view>
                <view class="notice-subtitle">账号注销后，将执行以下操作：</view>
                <view class="notice-list">
                    <view v-for="(item, index) in effectList" :key="index" class="notice-item">
                        <text class="dot">·</text>
                        <text class="notice-item-text">{{ item }}</text>
                    </view>
                </view>
                <view class="notice-tip">请确保您已备份重要数据，并确认无需继续使用本服务。</view>
            </view>

            <!-- <view class="agree" @click="toggleAgree">
                <CCheckBox :checked="agreed" @change="toggleAgree" />

                <view class="agree-text">
                    我已阅读并同意
                    <text class="link" @click.stop="goNotice">《注销须知》</text>
                </view>
            </view> -->

            <view class="submit-btn" :class="{ disabled: !agreed }" @click="handleSubmit">申请注销账号</view>
        </view>
    </view>
</template>

<script>
import Header from '@/components/Header/z1Header.vue';
import CCheckBox from '@/components/CCheckBox/index.vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiAddCancelApply, ApiCheckDelete } from './services.js';

export default {
    components: {
        Header,
        CCheckBox,
    },
    data() {
        return {
            icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702953990205fe6dd.png',
            iconCheck: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702953990205fe6dd.png',
            agreed: true,
            submitting: false,
            effectList: ['账户信息、个人资料将被清空', '账户下所有数据将被永久删除', '与账户相关的权益将被终止', '无法使用当前账号登录我们的服务'],
        };
    },
    methods: {
        toggleAgree() {
            this.agreed = !this.agreed;
        },
        goNotice() {
            uni.navigateTo({ url: '/pages_login/agreement/privacy' });
        },
        handleSubmit() {
            if (!this.agreed) {
                uni.showToast({ title: '请先阅读并同意《注销须知》', icon: 'none' });
                return;
            }
            if (this.submitting) return;
            uni.showModal({
                title: '提示',
                content: '确认申请注销账号吗？',
                confirmText: '确认',
                cancelText: '取消',
                showCancel: true,
                success: ({ confirm }) => {
                    confirm && this.submitApply();
                },
            });
        },
        /**
         * 提交注销申请
         * 先校验是否满足「直接注销」条件：
         *  - directDeleted=true：账号已由后端直接注销，清理登录态并回到登录页
         *  - directDeleted=false：继续发起注销申请，进入审核中
         * @by oh-my-zerone
         */
        async submitApply() {
            this.submitting = true;
            uni.$z1.showLoading({ title: '提交中...', mask: true });
            const [checkErr, checkRes] = await useRequest(ApiCheckDelete);
            if (checkErr) {
                uni.$z1.closeLoading();
                this.submitting = false;
                return;
            }
            // 后端可能返回字符串，统一按布尔处理
            const checkData = (checkRes && checkRes.data) || {};
            const directDeleted = checkData.directDeleted === true || String(checkData.directDeleted) === 'true';
            if (directDeleted) {
                uni.$z1.closeLoading();
                this.submitting = false;
                uni.showToast({ title: '账号已注销', icon: 'none' });
                setTimeout(() => {
                    this.$store.dispatch('LogOut');
                    uni.useToLoginView();
                }, 1000);
                return;
            }

            const [err] = await useRequest(ApiAddCancelApply);
            uni.$z1.closeLoading();
            this.submitting = false;
            if (err) return;
            // 用 redirectTo 替换当前页，避免返回时重复提交申请
            uni.redirectTo({ url: '/pages_login/deletion/pendding' });
        },
    },
};
</script>
<style lang="scss" scoped>
.page-deletion {
    background: #f3f3f3;
    height: 100vh;
    .page-main {
        padding: 30rpx 24rpx;
        .notice {
            background: #fff;
            border-radius: 16rpx;
            padding: 40rpx 30rpx;
            &-icon {
                width: 80rpx;
                height: 80rpx;
                margin: 0 auto 20rpx;
                display: block;
            }
            &-title {
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
                text-align: center;
                margin-bottom: 20rpx;
            }
            &-desc {
                font-size: 28rpx;
                color: #666;
                line-height: 44rpx;
            }
            &-subtitle {
                font-size: 28rpx;
                color: #333;
                margin: 30rpx 0 10rpx;
            }
            &-list {
                .notice-item {
                    display: flex;
                    font-size: 28rpx;
                    color: #666;
                    line-height: 44rpx;
                    .dot {
                        margin-right: 12rpx;
                        color: #999;
                    }
                    &-text {
                        flex: 1;
                    }
                }
            }
            &-tip {
                font-size: 26rpx;
                color: #999;
                margin-top: 30rpx;
                line-height: 42rpx;
            }
        }
        .agree {
            display: flex;
            align-items: center;
            margin: 30rpx 6rpx;

            &-text {
                margin-left: 14rpx;
                font-size: 26rpx;
                color: #666;
                .link {
                    color: #e54d42;
                }
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
            margin-top: 20rpx;
            &.disabled {
                opacity: 0.5;
            }
        }
    }
}
</style>
