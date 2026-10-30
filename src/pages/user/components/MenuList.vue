<template>
    <view class="menu-list">
        <view class="menu-list__item" v-for="item in list" :key="item.key" @click="onClickItem(item)">
            <view class="menu-list__left">
                <image v-if="item.icon" :src="$global.getImageUrl(item.icon)" class="menu-list__icon" />
                <view v-else class="menu-list__icon menu-list__icon--placeholder"></view>
                <view class="menu-list__label">{{ item.label }}</view>
            </view>
            <view class="menu-list__right">
                <template v-if="item.key == 'auth'">
                    <view v-if="item.isAuth" class="auth-success">
                        <text class="auth-success__text">已认证</text>
                        <image class="auth-success__icon" :src="$global.getImageUrl('pages/user/icon-authed.png')" />
                    </view>
                    <view v-else class="auth-pendding">
                        <text class="auth-pendding__text">未认证</text>
                    </view>
                </template>
            </view>

            <uni-icons type="arrowright" size="28rpx" color="#333333" class="menu-list__arrow" />
        </view>
    </view>
</template>

<script>
// const
import { LEADER_TYPE } from '@/common/constants/auth';

export default {
    name: 'MenuList',
    props: {
        /**
         * 菜单列表：[{ key, label, icon, status, statusType }]
         */
        list: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        /**
         * 点击菜单项：本组件内按 key 处理
         * @param {{key:string}} item 菜单项
         */
        onClickItem(item) {
            if (!uni.isLogin()) {
                uni.useToLoginView();
                return;
            }
            const handler = {
                auth: () => {
                    // 暂时关闭认证类型选择，默认企业认证
                    uni.navigateTo({ url: `/pages_auth/auth/index?shipperType=${LEADER_TYPE.ENTERPRISE}` });
                },
                contact: () => {
                    uni.makePhoneCall({ phoneNumber: this.$ui.brand.servicePhone }); // @by oh-my-zerone 2026-10-08
                },
                setting: () => {
                    uni.navigateTo({ url: '/pages_login/setting/index' });
                },
                enterprise:()=>{
                    // const url = 'http://192.168.10.27:8090/#/pages/charge/index?statusBarHeight=33&companyCode=e0086571f4684780b15ee64bb16ef708&networkCode=297359e73f9447d08b4436efe794a279&perms=&menuCode=c1247552a3b14c0d820fe64cde359992&token=b598b3cc-96fd-49ce-827a-097839a61f9f'
                    const url = 'http://192.168.10.27:8886/zjzy/#/pages_user/addressBook/list/index'
                    uni.useJsBridge('navigate.toWeb',{url})
                }
            }[item.key];

            if (handler) {
                handler();
                return;
            }
            // @by oh-my-zerone 占位：enterprise/rules/feedback 跳转后续补充
            console.log('menu click', item.key);
        },
    },
};
</script>
<style lang="scss" scoped>
.menu-list {
    margin: 24rpx 0 0;
    padding-top: 40rpx;
    border-radius: 46rpx 46rpx 0 0;
    background: #fff;
    box-shadow: 0px -10rpx 10rpx 0px rgba(198, 203, 217, 0.1);
    overflow: hidden;

    &__item {
        display: flex;
        align-items: center;
        padding: 20rpx 40rpx;
        & + & {
            margin-top: 14rpx;
        }
    }
    /* 左 */
    &__left {
        flex: 1;
        display: flex;
        align-items: center;
        min-width: 0;
    }
    &__icon {
        $s: 60rpx;
        width: $s;
        height: $s;
        border-radius: 50%;
        margin-right: 20rpx;
        flex: none;
        &--placeholder {
            background: #eef1f7;
        }
    }
    &__label {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
    }

    /* 右 */
    &__right {
        .auth-success {
            display: flex;
            align-items: center;
            &__text {
                font-size: 24rpx;
                color: #09b288;
            }
            &__icon {
                width: 24rpx;
                height: 24rpx;
                margin-left: 6rpx;
            }
        }
        .auth-pendding {
            &__text {
                font-size: 24rpx;
                color: #999;
            }
        }
    }

    &__arrow {
        margin-left: 14rpx;
        flex: none;
    }
}
</style>
