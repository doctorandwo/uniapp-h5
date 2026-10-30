<template>
    <view class="user-info-card">
        <view class="user-info-card__avatar" @click="onClickAvatar">
            <image :src="avatarSrc" class="avatar" />
        </view>
        <view class="user-info-card__content">
            <template v-if="isLogin">
                <view class="user-info-card__name">
                    <view class="user-info-card__name--text">{{ nickName || '--' }}</view>
                    <image
                        :src="$global.getImageUrl('https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/178904007205634a69a.png')"
                        class="tag-auth"
                        v-if="isAuth"
                    />
                    <image :src="$global.getImageUrl('pages/user/tag-un-auth.png')" class="tag-un-auth" v-else />
                </view>
                <view class="user-info-card__enterprise" @click="onClickEnterprise">
                    <text class="user-info-card__enterprise--text">{{ enterprise || '未认证企业' }}</text>
                    <text class="user-info-card__enterprise--edit">修改</text>
                    <uni-icons type="arrowright" size="28rpx" color="#3a65ff" class="arrow-right" />
                </view>
            </template>
            <template v-else>
                <view class="user-info-card__name">
                    <view class="user-info-card__name--text">{{ '未登录' }}</view>
                </view>
            </template>
        </view>
    </view>
</template>

<script>
export default {
    name: 'UserInfoCard',
    props: {
        /**
         * 登录态
         */
        isLogin: {
            type: Boolean,
            default: false,
        },
        /**
         * 头像地址
         */
        avatar: {
            type: String,
            default: '',
        },
        /**
         * 昵称
         */
        nickName: {
            type: String,
            default: '',
        },
        /**
         * 是否认证
         */
        isAuth: {
            type: Boolean,
            default: false,
        },
        /**
         * 企业名称
         */
        enterprise: {
            type: String,
            default: '',
        },
    },
    computed: {
        /**
         * 头像展示地址，兜底默认头像
         * @returns {string}
         */
        avatarSrc() {
            return this.avatar || this.$global.getImageUrl('pages/user/avatar.png');
        },
    },
    methods: {
        /**
         * 点击头像：未登录态本组件内引导登录；已登录态的跳转后续补充
         */
        onClickAvatar() {
            if (!this.isLogin) {
                uni.useToLoginView();
                return;
            }
            // @by oh-my-zerone 占位：已登录态跳转个人资料后续补充
        },
        /**
         * 点击企业资料：本组件内处理（占位）
         */
        onClickEnterprise() {
            // @by oh-my-zerone 占位：企业资料交互本组件内处理，后续补充
            console.log('enterprise', this.enterprise);
        },
    },
};
</script>
<style lang="scss" scoped>
.user-info-card {
    display: flex;
    align-items: center;
    box-sizing: border-box;

    &__avatar {
        flex: none;
        $s: 100rpx;
        width: $s;
        height: $s;
        border-radius: 50%;
        border: 4rpx solid #fff;
        box-shadow: 0px 3rpx 6rpx 1rpx rgba(198, 203, 217, 0.36);
        background: linear-gradient(180deg, #f2f2f2 0%, #fff 100%);
        box-sizing: border-box;
        overflow: hidden;
        .avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }

    &__content {
        flex: 1;
        margin-left: 24rpx;
        min-width: 0;
    }

    &__name {
        display: flex;
        align-items: center;
        &--text {
            font-size: 36rpx;
            line-height: 44rpx;
            font-weight: bold;
            color: #1a1a1a;
            max-width: calc(100% - 180rpx);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tag-auth {
            margin-left: 12rpx;
            width: 132rpx;
            height: 34rpx;
            flex: none;
        }
        .tag-un-auth {
            margin-left: 12rpx;
            width: 116rpx;
            height: 34rpx;
            flex: none;
        }
    }

    &__enterprise {
        margin-top: 4rpx;
        display: flex;
        align-items: center;
        &--text {
            font-size: 24rpx;
            line-height: 32rpx;
            color: #4d4d4d;
        }
        &--edit {
            margin-left: 16rpx;
            font-size: 24rpx;
            line-height: 32rpx;
            color: #3a65ff;
            font-weight: bold;
        }
        .arrow-right {
            margin-left: 8rpx;
        }
    }
}
</style>
