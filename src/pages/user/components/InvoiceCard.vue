<template>
    <view class="invoice-section">
        <view class="invoice-section__header">
            <view class="invoice-section__title">我的发票</view>
            <view class="invoice-section__record" @click="onClickRecord">
                <text class="record-label">开票记录</text>
                <uni-icons type="arrowright" size="28rpx" color="#999999" class="arrow-right" />
            </view>
        </view>

        <view class="invoice-card">
            <view class="invoice-card__stats">
                <view class="invoice-card__stat invoice-card__stat--amount">
                    <view class="invoice-card__stat--label">可开票金额（元）</view>
                    <view class="invoice-card__stat--num">{{ formattedAmount }}</view>
                </view>
                <view class="invoice-card__divider"></view>
                <view class="invoice-card__stat" @click="onClickPending">
                    <view class="invoice-card__stat--label">待开票</view>
                    <view class="invoice-card__stat--num">{{ pendingCount }}<text class="unit">单</text></view>
                </view>
                <view class="invoice-card__stat" @click="onClickProcessing">
                    <view class="invoice-card__stat--label">开票中</view>
                    <view class="invoice-card__stat--num">{{ processingCount }}<text class="unit">单</text></view>
                </view>
            </view>

            <view class="invoice-card__footer">
                <view class="invoice-card__footer--text">
                    <text>结算完可申请开票</text>
                    <text class="invoice-card__footer--count">当前可开：{{ availableCount }}单</text>
                </view>
                <view class="invoice-card__btn" @click="onClickInvoice">去开票</view>
            </view>
        </view>
    </view>
</template>

<script>
// utils
import { formatMoney } from '@/common/utils/format.js';

export default {
    name: 'InvoiceCard',
    props: {
        /**
         * 可开票金额
         */
        invoiceAmount: {
            type: Number,
            default: 0,
        },
        /**
         * 待开票单数
         */
        pendingCount: {
            type: Number,
            default: 0,
        },
        /**
         * 开票中单数
         */
        processingCount: {
            type: Number,
            default: 0,
        },
        /**
         * 当前可开张数
         */
        availableCount: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        /**
         * 可开票金额格式化（复用 @/common/utils/format.js 的 formatMoney）
         * @returns {string}
         */
        formattedAmount() {
            return formatMoney(this.invoiceAmount);
        },
    },
    methods: {
        /**
         * 点击开票记录（占位，本组件内处理）
         */
        onClickRecord() {
            // @by oh-my-zerone 占位：开票记录跳转后续补充
            console.log('invoice record');
        },
        /**
         * 点击待开票（占位，本组件内处理）
         */
        onClickPending() {
            // @by oh-my-zerone 占位：待开票列表后续补充
            console.log('invoice pending');
        },
        /**
         * 点击开票中（占位，本组件内处理）
         */
        onClickProcessing() {
            // @by oh-my-zerone 占位：开票中列表后续补充
            console.log('invoice processing');
        },
        /**
         * 点击去开票（占位，本组件内处理）
         */
        onClickInvoice() {
            // @by oh-my-zerone 占位：去开票后续补充
            console.log('invoice go');
        },
    },
};
</script>
<style lang="scss" scoped>
.invoice-section {
    margin: 24rpx 32rpx 0;

    &__header {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
    }
    &__title {
        font-size: 32rpx;
        font-weight: bold;
        color: #1a1a1a;
        font-family: 'Douyin Sans';
    }
    &__record {
        margin-left: auto;
        display: flex;
        align-items: center;
        .record-label {
            font-size: 24rpx;
            color: #999;
        }
        .arrow-right {
            margin-left: 8rpx;
        }
    }
}

.invoice-card {
    padding: 32rpx 32rpx 28rpx;
    box-sizing: border-box;
    border: 1rpx solid #fff;
    border-radius: 20rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 1) 100%);

    &__stats {
        display: flex;
        align-items: center;
    }
    &__stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        &--amount {
            flex: 2;
            align-items: flex-start;
            padding-right: 24rpx;
        }
        &--label {
            font-size: 24rpx;
            color: #999;
        }
        &--num {
            margin-top: 15rpx;
            font-size: 36rpx;
            font-weight: bold;
            color: #1a1a1a;
            font-family: 'Douyin Sans';
            .unit {
                margin-left: 4rpx;
                font-size: 24rpx;
                font-weight: normal;
                color: #1a1a1a;
            }
        }
    }
    &__divider {
        width: 2rpx;
        height: 56rpx;
        background: #eee;
    }

    &__footer {
        margin-top: 28rpx;
        padding: 12rpx 24rpx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        border-radius: 16rpx;
        background: linear-gradient(0deg, rgba(222, 234, 255, 0.5) 2.329%, rgba(226.34, 237.04, 255, 0.57) 50.794%, rgba(232, 241, 255, 0) 114.034%);
        &--text {
            flex: 1;
            margin-right: 12rpx;
            font-size: 24rpx;
            color: #333;
        }
        &--count {
            margin-left: 12rpx;
            color: #333;
        }
    }
    &__btn {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 140rpx;
        height: 48rpx;
        font-size: 24rpx;
        font-weight: bold;
        color: #fff;
        border-radius: 999rpx;
        background: linear-gradient(90deg, #3a65ff 0%, #5c8bfe 100%);
    }
}
</style>
