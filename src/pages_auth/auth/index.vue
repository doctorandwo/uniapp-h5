<template>
    <PageFrame class="page-auth" bg="#F7F7F7" :hasHeader="true" headBackground="#fff" title="认证信息">
        <view style="overflow: hidden">
            <view v-if="alertConfig" class="auth-alert" :class="'auth-alert--' + alertConfig.type">
                <image v-if="authStatus == AUTH_STATUS.APPROVED" class="auth-alert__icon" :src="$global.getImageUrl('pages/auth/status-success.png')" />
                <image
                    v-if="authStatus == AUTH_STATUS.REJECTED || authStatus == AUTH_STATUS.UNREVIEWED"
                    class="auth-alert__icon"
                    :src="$global.getImageUrl('pages/auth/status-error.png')"
                />
                {{ alertText }}
            </view>

            <!-- 身份证 -->
            <view class="auth-card">
                <image class="auth-card__bg" :src="$global.getImageUrl('pages/auth/idcard-bg.png')" mode="aspectFill" />
                <view class="auth-card__body">
                    <view class="auth-card__content">
                        <image class="auth-card__icon" :src="$global.getImageUrl('pages/auth/idcard-head.png')" mode="aspectFit" />
                        <view class="auth-card__info">
                            <view class="auth-card__title-row">
                                <text class="auth-card__title">身份证</text>
                                <view v-if="hasIdInfo" class="auth-card__eye" @click.stop="togglePlain">
                                    <uni-icons :type="showPlain ? 'eye' : 'eye-slash'" size="16" color="#666" />
                                </view>
                            </view>
                            <text class="auth-card__number">{{ idNumberText }}</text>
                        </view>
                    </view>
                </view>
                <view v-if="authStatus == AUTH_STATUS.UNREVIEWED && !hasIdInfo" class="auth-card__action auth-card__action--unreviewed">
                    <view class="auth-card__action-desc">添加证件信息</view>
                    <view class="auth-card__action-btn" @click="toActiveIdCard">立即添加</view>
                </view>
                <view v-else class="auth-card__action" @click="toActiveIdCard">{{ actionText }}</view>
            </view>

            <!-- 企业信息 -->
            <view v-if="activeLeaderType === LEADER_TYPE.ENTERPRISE" class="auth-card license-card">
                <image class="auth-card__bg" :src="$global.getImageUrl('pages/auth/license-bg.png')" mode="aspectFill" />
                <view class="auth-card__body">
                    <view class="auth-card__content">
                        <image class="auth-card__icon" :src="$global.getImageUrl('pages/auth/license-head.png')" mode="aspectFit" />
                        <view class="auth-card__info">
                            <view class="auth-card__title-row">
                                <text class="auth-card__title">企业信息</text>
                            </view>
                            <text class="auth-card__number">{{ enterpriseNameText }}</text>
                        </view>
                    </view>
                </view>
                <view v-if="authStatus == AUTH_STATUS.UNREVIEWED && !hasEnterpriseInfo" class="auth-card__action auth-card__action--unreviewed">
                    <view class="auth-card__action-desc">添加企业信息</view>
                    <view class="auth-card__action-btn" @click="toEnterprise">立即添加</view>
                </view>
                <view v-else class="auth-card__action" @click="toEnterprise">{{ actionText }}</view>
            </view>
        </view>
    </PageFrame>
</template>

<script>
/**
 * 认证信息
 * @by oh-my-zerone 2026-06-24
 */
// components
import PageFrame from '@/pages/components/PageFrame/index.vue';
import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';

// const
import { AUTH_STATUS, AUTH_STATUS_ALERT, ID_CARD_ROLE, LEADER_TYPE, needSelectLeaderType } from '@/common/constants/auth';

// services
import { getShipmentDetail } from '@/api/auth';
import { formatAuthTime, inferLeaderType, maskIdNumber, pickEnterpriseFormFromDetail, pickIdFormFromDetail } from '@/pages_auth/utils';

export default {
    name: 'auth-index',
    components: { PageFrame, uniIcons },
    data() {
        return {
            AUTH_STATUS,
            LEADER_TYPE,
            detail: {},
            loading: false,
            showPlain: false,
            routeShipperType: null,
        };
    },
    computed: {
        shipmentCode() {
            return this.$store.getters.shipmentInfo?.code;
        },
        authStatus() {
            const status = this.detail?.authStatus;
            return status === undefined || status === null ? AUTH_STATUS.UNREVIEWED : Number(status);
        },
        alertConfig() {
            return AUTH_STATUS_ALERT[this.authStatus];
        },
        alertText() {
            if (this.authStatus === AUTH_STATUS.APPROVED) {
                const time = formatAuthTime(this.detail.authTime);
                return time ? `您的帐号已于${time}审核通过，如需修改请联系客服处理！` : '您的帐号已审核通过，如需修改请联系客服处理！';
            }
            if (this.authStatus === AUTH_STATUS.REJECTED && this.detail.remark) {
                return `${this.alertConfig.text}：${this.detail.remark}`;
            }
            return this.alertConfig?.text || '';
        },
        isReadonly() {
            return this.authStatus === AUTH_STATUS.APPROVED;
        },
        needReselectType() {
            return needSelectLeaderType(this.authStatus);
        },
        activeLeaderType() {
            if (this.needReselectType && this.routeShipperType !== null) {
                return this.routeShipperType;
            }
            return inferLeaderType(this.detail);
        },
        idFormSnapshot() {
            return pickIdFormFromDetail(this.detail);
        },
        enterpriseFormSnapshot() {
            return pickEnterpriseFormFromDetail(this.detail);
        },
        hasIdInfo() {
            return !!this.idFormSnapshot.identificationNumber;
        },
        hasEnterpriseInfo() {
            return !!this.enterpriseFormSnapshot.organizationCodeNo;
        },
        idNumberText() {
            const num = this.idFormSnapshot.identificationNumber;
            if (!num) return '证件号';
            return this.showPlain ? num : maskIdNumber(num);
        },
        enterpriseNameText() {
            return this.enterpriseFormSnapshot.companyName || '请完善';
        },
        canEdit() {
            return this.authStatus !== AUTH_STATUS.APPROVED;
        },
        actionText() {
            return this.canEdit ? '编辑证件' : '查看证件';
        },
    },
    onLoad(options) {
        if (options.shipperType !== undefined && options.shipperType !== '') {
            this.routeShipperType = Number(options.shipperType);
        }
    },
    async onShow() {
        await this.fetchDetail();
        if (this.needReselectType && this.routeShipperType === null) {
            uni.showToast({ title: '请先选择认证类型', icon: 'none' });
            setTimeout(() => uni.navigateBack(), 800);
        }
    },
    methods: {
        togglePlain() {
            this.showPlain = !this.showPlain;
        },
        async fetchDetail() {
            if (!this.shipmentCode) {
                this.detail = {};
                return;
            }
            this.loading = true;
            try {
                const res = await getShipmentDetail(this.shipmentCode);
                if (res?.code === 200 && res.data) {
                    this.detail = res.data;
                    this.showPlain = false;
                }
            } catch (e) {
                this.detail = {};
            } finally {
                this.loading = false;
            }
        },
        toActiveIdCard() {
            const role = this.activeLeaderType === LEADER_TYPE.ENTERPRISE ? ID_CARD_ROLE.LEGAL : ID_CARD_ROLE.OWNER;
            this.toIdCard(role);
        },
        toIdCard(role) {
            uni.navigateTo({
                url: `/pages_auth/auth/idCard?role=${role}&shipperType=${this.activeLeaderType}`,
            });
        },
        toEnterprise() {
            uni.navigateTo({
                url: `/pages_auth/auth/enterprise?shipperType=${this.activeLeaderType}`,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.auth-alert {
    padding: 20rpx 32rpx;
    font-weight: bold;
    font-size: 24rpx;
    line-height: 36rpx;
    display: flex;

    &--warning {
        color: #e55050;
        background: #fdeeed;
    }

    &--pending {
        color: #ff8422;
        background: #fff1e5;
    }

    &--success {
        color: #00c800;
        background: #daefda;
    }

    &__icon {
        width: 30rpx;
        height: 30rpx;
        margin-right: 12rpx;
        margin-top: 2rpx;
    }
}

.auth-card {
    margin: 20rpx 32rpx 28rpx;
    width: calc(100% - 64rpx);
    height: 264rpx;
    border-radius: 20rpx;
    overflow: hidden;
    position: relative;

    &__body {
        position: relative;
        padding: 32rpx 28rpx 28rpx;
        z-index: 1;
    }

    &__bg {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    &__content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: flex-start;
    }

    &__icon {
        flex-shrink: 0;
        width: 90rpx;
        height: 90rpx;
        margin-right: 24rpx;
    }

    &__info {
        flex: 1;
        min-width: 0;
    }

    &__title-row {
        display: flex;
        align-items: center;
    }

    &__title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        line-height: 44rpx;
    }

    &__eye {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 16rpx;
        padding: 4rpx;
    }

    &__number {
        display: block;
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #999;
        line-height: 34rpx;
        word-break: break-all;
    }

    &__action {
        padding: 0 28rpx;
        height: 76rpx;
        line-height: 76rpx;
        text-align: center;
        font-size: 28rpx;
        color: #333;
        background: rgba(0, 0, 0, 0.2);
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2;

        &--unreviewed {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        &-desc {
            font-size: 28rpx;
            color: #ffffff;
        }
        &-btn {
            width: 142rpx;
            height: 48rpx;
            line-height: 48rpx;
            font-size: 24rpx;
            color: #333333;
            text-align: center;
            border-radius: 8rpx;
            background: #ffffff;
        }
    }

    &.license-card {
        .auth-card__title,
        .auth-card__number,
        .auth-card__eye,
        .auth-card__action {
            color: #fff;
        }
    }
}
</style>
