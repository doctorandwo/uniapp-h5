<template>
    <view class="card-info" :class="{ 'card-info--pending-pay': isPendingPay }" @click.stop="goDetail">
        <view class="header">
            <view class="status-wrap">
                <StatusText :status="status" :isAbnormal="isAbnormal" :label="statusLabel" :tone="statusTone" />
            </view>
            <view class="waybill-no" @click.stop="copyWaybillNo">
                <text class="waybill-no__text">{{ info.waybillNo || '-' }}</text>
                <image v-if="info.waybillNo" class="waybill-no__icon" :src="$global.getImageUrl('pages/waybill/icon-copy.png')" mode="scaleToFill" />
            </view>
            <view class="price">{{ priceText }}</view>
        </view>

        <view v-if="isPendingPay" class="pay-main">
            <view class="pay-main__row">
                <view class="pay-stats">
                    <view class="pay-col">
                        <view class="goods-line">
                            <text class="goods-name">{{ goodsName }}</text>
                            <text class="goods-weight">{{ weightText }}</text>
                        </view>
                        <text class="pay-col__label">货品吨位</text>
                    </view>
                    <view class="pay-col" v-if="platformName">
                        <text class="pay-col__value g-single-row">{{ platformName || '-' }}</text>
                        <text class="pay-col__label">承接平台</text>
                    </view>
                </view>
                <view class="pay-time">
                    <text class="pay-time__clock">{{ payTimeClock }}</text>
                    <text class="pay-time__date">{{ payTimeDate }}</text>
                </view>
            </view>
            <view class="route g-single-row">{{ payRouteText }}</view>
        </view>
        <view v-else class="transport-main">
            <!-- @by oh-my-zerone 2026-10-27 有承接平台时与待付款卡片同排：货品 | 平台 | 时间 -->
            <template v-if="platformName">
                <view class="pay-main__row">
                    <view class="pay-stats">
                        <view class="pay-col">
                            <view class="goods-line">
                                <text class="goods-name">{{ goodsName }}</text>
                                <text class="goods-weight">{{ weightText }}</text>
                            </view>
                            <text class="pay-col__label">货品吨位</text>
                        </view>
                        <view class="pay-col">
                            <text class="pay-col__value g-single-row">{{ platformName }}</text>
                            <text class="pay-col__label">承接平台</text>
                        </view>
                    </view>
                    <view class="pay-time">
                        <text class="pay-time__clock">{{ timeLabel }}</text>
                        <view>
                            <text>{{ timeDate }}</text>
                            <text class="pair-side__extra">{{ timeClock }}</text>
                        </view>
                    </view>
                </view>
                <view class="route g-single-row transport-main__route">{{ routeText }}</view>
            </template>
            <template v-else>
                <view class="pair-row">
                    <view class="goods-line">
                        <text class="goods-name">{{ goodsName }}</text>
                        <text class="goods-weight">{{ weightText }}</text>
                    </view>
                    <view class="pair-side">{{ timeLabel }}</view>
                </view>
                <view class="pair-row">
                    <view class="route g-single-row">{{ routeText }}</view>
                    <view class="pair-side">
                        <text>{{ timeDate }}</text>
                        <text class="pair-side__extra">{{ timeClock }}</text>
                    </view>
                </view>
            </template>
        </view>

        <view class="operate">
            <view class="info-wrap">
                <image class="info__avatar" :src="info.driverAvatar || $global.getImageUrl('pages/waybill/icon-avatar.png')" mode="scaleToFill" />
                <view class="info__company g-single-row">{{ driverLine }}</view>
            </view>
            <view v-if="btn" class="btn-wrap">
                <CButton :type="btn.type" :text="btn.text" @click="onBtnClick" />
            </view>
        </view>
    </view>
</template>

<script>
// components
import CButton from './CButton.vue';
import StatusText from './StatusText.vue';

// hooks
import dayjs from 'dayjs';

// const
import { stowageStatusMap, stowageStatusList } from '@/pages/waybill/constants.js';

/**
 * @by oh-my-zerone 2026-10-16
 * 运单、结算列表卡片。补凭证/核算/申请打款/打款跳转子页（自货主端迁入）。
 */
export default {
    components: {
        CButton,
        StatusText,
    },
    props: {
        info: {
            type: Object,
            default: () => ({}),
        },
        listType: {
            type: String,
            default: 'transport',
        },
    },
    computed: {
        status() {
            return this.isAbnormal? 8 : this.info.status;
        },
        isAbnormal() {
            return this.info.isAbnormal;
        },
        // @by oh-my-zerone 2026-10-27 对齐稿 489:8906：status=6 待付款卡片
        isPendingPay() {
            return this.isAbnormal == 0 && Number(this.info.status) === 6;
        },
        statusLabel() {
            return this.isPendingPay ? '待付款' : '';
        },
        statusTone() {
            return this.isPendingPay ? '#E19C12' : '';
        },
        // @by oh-my-zerone 2026-10-21 对齐货主端详情契约：2/3补凭证、4核算、5申请打款、6打款
        // @by oh-my-zerone 2026-10-29 isAbnormal=1 跳转申诉材料页
        btn() {
            if (Number(this.info.isAbnormal) === 1) {
                return { text: '提交申诉材料', type: 'info', key: 'DEAL_ABNORMAL' };
            }
            const status = Number(this.info.status);
            const map = {
                2: { text: '补凭证', type: 'info', key: 'SUPPLEMENTARY' },
                3: { text: '补凭证', type: 'info', key: 'SUPPLEMENTARY' },
                4: { text: '核算', type: 'primary', key: 'ACCOUNT' },
                5: { text: '申请打款', type: 'primary', key: 'APPLY_PAY' },
                6: { text: '去付款', type: 'primary', key: 'PAY' },
                7: { text: '查看', type: 'info', key: 'view' },
            };
            return map[status] || null;
        },
        waybillCode() {
            return this.info.waybillCode || this.info.wayBillCode || this.info.code || '';
        },
        // load 页 getStowageStatusLabel 使用 dictValue/dictLabel
        dictStowageStatusList() {
            return stowageStatusList.map(item => ({ dictValue: item.value, dictLabel: item.label }));
        },
        goodsName() {
            return this.info.goodTypeName || '-';
        },
        weightText() {
            // @by oh-my-zerone 2026-10-28 列表吨位单位：吨展示为 T，其余沿用配载字典
            const unit = stowageStatusMap[this.info.stowageStatus] || stowageStatusMap[String(this.info.stowageStatus)] || '吨';
            const displayUnit = unit === '吨' ? 't' :( unit === '方' ? 'm³' : unit);
            return `${this.info.unloadWeight || this.info.loadWeight || '-'}${displayUnit}`;
        },
        platformName() {
            return this.info.platformName || '';
        },
        routeText() {
            const load = this.info.loadAddressDetail;
            const unload = this.info.unloadAddressDetail;
            if (!load && !unload) return '-';
            return `${load || '-'} - ${unload || '-'}`;
        },
        priceText() {
            const raw = this.pickAmount(this.info.estimatedCost, this.info.shipperRealPay);
            if (!this.hasValue(raw)) return '-';
            return `¥${raw}`;
        },
        timeSource() {
            const status = Number(this.info.status);
            if (status === 1) return { label: '接单时间', value: this.info.receiveTime };
            if (status === 2) return { label: '装货时间', value: this.info.loadTime };
            return { label: '卸货时间', value: this.info.unloadTime };
        },
        timeLabel() {
            return this.timeSource.label;
        },
        timeDate() {
            const value = this.timeSource.value;
            if (!value) return '-';
            const date = dayjs(value);
            if (!date.isValid()) return '-';
            // @by oh-my-zerone 2026-10-27 当天展示「今天」
            if (date.isSame(dayjs(), 'day')) return '今天';
            return date.format('MM[月]DD[日]');
        },
        timeClock() {
            return this.formatTime(this.timeSource.value, 'HH:mm') || '-';
        },
        payTimeDate() {
            return this.formatTime(this.timeSource.value, 'YYYY/MM/DD') || '-';
        },
        payTimeClock() {
            return this.formatTime(this.timeSource.value, 'HH:mm:ss') || '-';
        },
        payRouteText() {
            const load = this.formatPlace(this.info.loadCityName || this.info.loadCity, this.info.loadDistrictName || this.info.loadDistrict);
            const unload = this.formatPlace(this.info.unloadCityName || this.info.unloadCity, this.info.unloadDistrictName || this.info.unloadDistrict);
            if (load || unload) return `${load || '-'} - ${unload || '-'}`;
            return this.routeText;
        },
        driverLine() {
            const name = this.info.driverName || '-';
            const plate = this.info.licenseNumber || '-';
            return `${name} ${plate}`;
        },
    },
    methods: {
        hasValue(value) {
            return value !== undefined && value !== null && value !== '';
        },
        formatPlace(city, district) {
            if (city && district) return `${city}·${district}`;
            return city || district || '';
        },
        pickAmount(primary, fallback) {
            if (this.hasValue(primary)) return primary;
            return fallback;
        },
        formatTime(value, pattern) {
            if (!value) return '';
            const date = dayjs(value);
            if (!date.isValid()) return '';
            return date.format(pattern);
        },
        copyWaybillNo() {
            if (!this.info.waybillNo) return;
            uni.setClipboardData({
                data: this.info.waybillNo,
                success: () => {
                    uni.showToast({ title: '复制成功', icon: 'success' });
                },
            });
        },
        onBtnClick() {
            const map = {
                SUPPLEMENTARY: this.onSupplementary,
                DEAL_ABNORMAL: this.onDealAbnormal,
                ACCOUNT: this.onAccount,
                APPLY_PAY: this.onApplyPay,
                PAY: this.onPay,
                view: this.onView,
                VIEW_VOUCHER: this.onView,
            };
            map[this.btn?.key]?.();
        },
        emitListRefresh() {
            uni.$emit('pages/waybill/index:refresh');
        },
        navigateWithRefresh(url) {
            const that = this;
            uni.navigateTo({
                url,
                events: {
                    acceptDataFromOpenerPageBack() {
                        that.emitListRefresh();
                    },
                },
            });
        },
        goDetail() {
            const code = this.waybillCode;
            if (!code) {
                uni.showToast({ title: '运单编号缺失', icon: 'none' });
                return;
            }
            uni.navigateTo({
                url: `/pages/waybill/waybillDetails/index?code=${code}`,
            });
        },
        onSupplementary() {
            const code = this.waybillCode;
            if (!code) {
                uni.showToast({ title: '运单编号缺失', icon: 'none' });
                return;
            }
            const that = this;
            const status = Number(this.info.status);
            uni.navigateTo({
                url: '/pages_runGoods/load/index',
                events: {
                    acceptDataFromOpenerPageBack() {
                        that.emitListRefresh();
                    },
                },
                success(res) {
                    res.eventChannel.emit('acceptDataFromOpenerPage', {
                        wayInfo: { ...that.info, wayBillCode: code },
                        type: status === 2 ? 'load' : 'supplementaryUnloading',
                        stowageStatusList: that.dictStowageStatusList,
                    });
                },
            });
        },
        /**
         * @by oh-my-zerone 2026-10-29
         * 异常单：跳转提交申诉材料
         */
        onDealAbnormal() {
            const abnormalCodes = this.info.abnormalCodes || '';
            if (abnormalCodes && abnormalCodes.length > 0) {
                this.navigateWithRefresh(`/pages_waybill/dealAbnormal/index?waybillAbnormalCode=${abnormalCodes[0]}`);
            }else{
                uni.showToast({ title: '异常单号缺失', icon: 'none' });
                return;
            }
            
        },
        onAccount() {
            const code = this.waybillCode;
            if (!code) {
                uni.showToast({ title: '运单编号缺失', icon: 'none' });
                return;
            }
            this.navigateWithRefresh(`/pages_waybill/expenseAccounting/index?waybillCode=${code}`);
        },
        onApplyPay() {
            const code = this.waybillCode;
            if (!code) {
                uni.showToast({ title: '运单编号缺失', icon: 'none' });
                return;
            }
            this.navigateWithRefresh(`/pages_waybill/applyPayment/index?waybillCode=${code}`);
        },
        onPay() {
            const code = this.waybillCode;
            if (!code) {
                uni.showToast({ title: '运单编号缺失', icon: 'none' });
                return;
            }
            this.navigateWithRefresh(`/pages_waybill/payment/index?waybillCode=${code}`);
        },
        onView() {
            this.goDetail();
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.card-info {
    padding: 28rpx 28rpx;
    background-color: #fff;
    border-radius: 24rpx;
    &--pending-pay {
        padding: 28rpx;
        background: linear-gradient(118deg, #fffbf2 0%, #fff 68%);
        .header {
            .status-wrap ::v-deep .status-text {
                font-size: 26rpx;
            }
            .waybill-no__text {
                font-size: 26rpx;
                line-height: 34rpx;
                color:#8A91A1;
            }
            .price {
                font-size: 28rpx;
                color: #567bff;
            }
        }
        .operate {
            margin-top: 16rpx;
        }
    }

    .header {
        display: flex;
        align-items: center;
        .status-wrap {
            flex-shrink: 0;
            margin-right: 12rpx;
        }
        .waybill-no {
            min-width: 0;
            flex: 1;
            display: flex;
            align-items: center;
            &__text {
                font-size: 26rpx;
                color: #999;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            &__icon {
                flex-shrink: 0;
                $w: 28rpx;
                width: $w;
                height: $w;
                margin-left: 8rpx;
            }
        }
        .price {
            flex-shrink: 0;
            margin-left: 16rpx;
            font-size: 32rpx;
            font-weight: bold;
            color: #4d7cff;
            font-family: Douyin Sans, Douyin Sans;
        }
    }

    .goods-line {
        display: flex;
        align-items: center;
        min-width: 0;
        width: 100%;
        height: 56rpx;
    }
    .goods-name{
        font-size: 32rpx;
        color: #2a2f3b;
        line-height: 45rpx;
    }
    .goods-weight {
        font-size: 36rpx;
        font-weight: 700;
        color: #2a2f3b;
        line-height: 45rpx;
        font-family: Douyin Sans, Douyin Sans;
    }
    .goods-weight {
        margin-left: 8rpx;
        flex-shrink: 0;
    }
    .goods-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .route {
        min-width: 0;
        font-size: 24rpx;
        line-height: 34rpx;
        color: #999;
    }

    .transport-main {
        margin-top: 24rpx;
        &__route {
            margin-top: 16rpx;
        }
    }
    .pay-main {
        margin-top: 16rpx;
        &__row {
            display: flex;
            align-items: center;
            min-width: 0;
        }
        .route {
            margin-top: 16rpx;
            font-size: 24rpx;
            line-height: 33rpx;
            color: #8a91a1;
        }
    }
    .pay-stats {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: flex-start;
        @include flex-gap(32rpx);
    }
    .pay-col {
        min-width: 0;
        flex: 1;
        .goods-line {
            height: 48rpx;
        }
        &__value {
            display: block;
            font-size: 32rpx;
            line-height: 48rpx;
            color: #2A2F3B;
            font-weight: bold;
            
        }
        &__label {
            display: block;
            margin-top: 2rpx;
            font-size: 24rpx;
            line-height: 34rpx;
            color: #8A91A1;
        }
    }
    .pay-time {
        flex-shrink: 0;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 24rpx;
        line-height: 34rpx;
        color: #8a91a1;
        white-space: nowrap;
        &__clock {
            margin-bottom: 4rpx;
        }
    }
    .pair-row {
        display: flex;
        align-items: center;
        min-width: 0;
        & + & {
            margin-top: 8rpx;
        }
        .goods-line,
        .route {
            flex: 1;
            width: auto;
        }
    }
    .pair-side {
        flex-shrink: 0;
        margin-left: 20rpx;
        font-size: 24rpx;
        line-height: 34rpx;
        color: #999;
        text-align: right;
        white-space: nowrap;
        &__extra {
            margin-left: 8rpx;
        }
    }

    .operate {
        margin-top: 24rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        @include flex-gap(16rpx);
        .info-wrap {
            min-width: 0;
            flex: 1;
            display: flex;
            align-items: center;
            .info__avatar {
                flex-shrink: 0;
                $w: 40rpx;
                width: $w;
                height: $w;
                border-radius: 50%;
                margin-right: 12rpx;
            }
            .info__company {
                flex: 1;
                min-width: 0;
                font-size: 26rpx;
                color: #333;
            }
        }
        .btn-wrap {
            flex-shrink: 0;
            display: flex;
            align-items: center;
        }
    }
}
</style>
