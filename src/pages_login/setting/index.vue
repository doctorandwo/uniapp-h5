<template>
    <view class="page-setting">
        <Header title="设置" backgroundColor="#fff" />
        <view class="page-main">
            <view class="list">
                <view v-for="item in menuList" :key="item.path" class="item" :data-path="item.path" @click="handleJump">
                    <image class="item-icon" :src="item.icon" />
                    <view class="item-content">
                        <text class="item-content-label">{{ item.label }}</text>
                        <view class="item-content-value">
                            <view>{{ item.desc || '' }}</view>
                            <image class="icon-arrow-right" :src="$global.getImageUrl('pages/user/icon-arrow-right.png')" />
                        </view>
                    </view>
                </view>
            </view>

            <view class="list">
                <view class="item">
                    <image class="item-icon" :src="iconVersion" />
                    <view class="item-content" style="border: none">
                        <text class="item-content-label">版本({{ version }})</text>
                    </view>
                </view>
            </view>
            <view class="logout-btn" @click="logout" v-if="isLogin"> 退出登录 </view>
        </view>
    </view>
</template>

<script>
import Header from '@/components/Header/z1Header.vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiGetCurrentApply, CANCEL_APPLY_STATUS } from '@/pages_login/deletion/services.js';

/** 注销账号申请页路径，handleJump 需要据此走状态分流 */
const DELETION_PATH = '/pages_login/deletion/index';
/** 修改密码页路径，handleJump 在未登录态需要拦截 */
const RESET_PWD_PATH = '/pages_login/resetPassword/index';

export default {
    components: {
        Header,
    },
    data() {
        return {
            version: 'v1.0.0',
            iconVersion: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702971203815d0641.png',

            isLogin: false,
            deletionLoading: false,

        };
    },
    computed: {
        menuList() {
            return [
                {
                    path: '/pages_login/agreement/aboutUs',
                    label: '关于我们',
                    icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702953990205fe6dd.png',
                },
                {
                    path: '/pages_login/agreement/privacy',
                    label: '隐私政策',
                    icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/16702966500828c21b7.png',
                },
                {
                    path: '/pages_login/agreement/userService',
                    label: '服务协议',
                    icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1670296669712d63b17.png',
                },

                {
                    path: '/pages_login/resetPassword/index',
                    label: '修改密码',
                    icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1670296669712d63b17.png',
                },
                {
                    path: '/pages_login/deletion/index',
                    label: '注销账号',
                    icon: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1670296669712d63b17.png',
                },
            ];
        },
        token() {
            const { Authorization, token } = this.$store.getters.headerInfo;
            return Authorization || token;
        },
    },
    onShow() {
        this.isLogin = uni.isLogin();
    },
    mounted() {},
    methods: {
        logout() {
            uni.showModal({
                title: '提示',
                content: '是否确认退出登录？',
                success: res => {
                    if (!res.confirm) return;
                    this.$store.dispatch('LogOut');
                    uni.useToLoginView();
                },
            });
        },
        handleJump(event) {
            const { path } = event.currentTarget.dataset;
            // 注销账号：先查询当前注销申请状态，再按状态分流跳转
            if (path === DELETION_PATH) {
                this.goDeletion();
                return;
            }
            // 修改密码：未登录态拦截（菜单在已登录时也展示，加一道防线）
            if (path === RESET_PWD_PATH) {
                if (!this.isLogin) {
                    uni.showModal({ title: '提示', content: '请先登录后再修改密码', showCancel: false });
                    return;
                }
                uni.navigateTo({ url: path });
                return;
            }
            uni.navigateTo({ url: path });
        },
        /**
         * 注销账号入口：按 getCurrentApply 返回的状态分流
         *  - 未发起过注销（data 为 null）→ 注销申请页
         *  - 待审核(0) → 审核中页
         *  - 审核不通过(2) → 审核不通过页（携带不通过原因）
         *  - 审核通过(1)：账号已注销，兜底走注销申请页
         */
        async goDeletion() {
            if (this.deletionLoading) return;
            this.deletionLoading = true;
            uni.$z1.showLoading();
            const [err, res] = await useRequest(ApiGetCurrentApply);
            uni.$z1.closeLoading();
            this.deletionLoading = false;
            if (err) return;

            const apply = res && res.data;
            const { PENDING, REJECTED } = CANCEL_APPLY_STATUS;
            // 后端可能返回字符串状态，统一转数字比较
            const status = apply ? Number(apply.status) : null;
            if (status === PENDING) {
                uni.navigateTo({ url: '/pages_login/deletion/pendding' });
                return;
            }
            if (status === REJECTED) {
                uni.navigateTo({ url: `/pages_login/deletion/rejected?reason=${encodeURIComponent(apply.reason || '')}` });
                return;
            }
            uni.navigateTo({ url: DELETION_PATH });
        },
    },
};
</script>
<style lang="scss" scoped>
.page-setting {
    background: #f3f3f3;
    height: 100vh;
    .page-main {
        padding-top: 22rpx;

        .list {
            background: #fff;
            padding: 31rpx 24rpx 0 24rpx;

            .item {
                display: flex;
                margin-bottom: 30rpx;
                &:last-child {
                    .item-content {
                        border-bottom: none;
                    }
                }
                &-icon {
                    width: 40rpx;
                    height: 40rpx;
                }
                &-content {
                    border-bottom: 1rpx #eee solid;
                    margin-left: 24rpx;
                    padding-bottom: 30rpx;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    &-label {
                        font-size: 28rpx;
                        color: #333;
                    }
                    &-value {
                        margin-left: auto;
                        display: flex;
                        align-items: center;
                        .icon-arrow-right {
                            margin-left: 10rpx;
                            width: 20rpx;
                            height: 28rpx;
                        }
                    }
                }
                .bottom {
                    border: 0;
                }
            }
        }
        .logout-btn {
            background: #fff;
            color: #333;
            text-align: center;
            height: 80rpx;
            line-height: 80rpx;
            font-weight: bold;
        }
    }
}
</style>
