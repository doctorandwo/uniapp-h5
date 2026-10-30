<template>
    <view class="goods-statistics">
        <view class="total">
            <image :src="$global.getImageUrl('pages/home/title-hi.png')" class="title-hi" />
            <image :src="$global.getImageUrl('pages/home/text-dqjxzhy.png')" class="text-dqjxzhy" />
            <view class="total-num">{{ formatNum(totalNum) }}</view>
            <view class="unit">票</view>
        </view>
        <view class="detail">
            <view v-for="item in details" :key="item.key" class="item">
                <view class="item-label">{{ item.label }}</view>
                <view class="item-value">
                    <span class="item-value__num">{{ formatNum(item.value) }}</span>
                    <span class="item-value__unit">{{ item.unit }}</span>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
// hooks
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';

// services
import { ApiGetShipperOrderStatistics } from '@/pages/waybill/services.js';

/**
 * @by oh-my-zerone
 * @desc 首页货物流转统计看板：组件内自治拉取（仿 Attention 组件的 useRequest + init 模式）
 */

// 组件内置 mock 数据（useMock 开启时使用），字段与 getShipperOrderStatistics 接口返回保持一致
const MOCK_STATISTICS = {
    runningOrderCount: 12, // 进行中货源数量
    pendingLoadOrderCount: 3, // 待装货货源数量
    pendingUnloadOrderCount: 7, // 待卸货货源数量
};

export default {
    name: 'HomeGoodsStatistics',
    props: {
        /**
         * 外部可传入统计数据（可序列化对象，仅传纯数据），优先于接口返回数据
         * 结构同 getShipperOrderStatistics.data
         * @type {Object}
         */
        statistics: {
            type: Object,
            default: () => ({}),
        },
        /**
         * 开关：是否使用本地 mock 数据。开启则强制使用 mock，关闭则使用接口/外部数据
         * @type {boolean}
         */
        useMock: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // 接口拉取的统计数据（仿 Attention 组件内自治）
            statisticsData: {},
            loading: false,
        };
    },
    computed: {
        // 实际数据源：开启 mock 使用内置数据；否则优先外部 statistics，再兜底接口数据
        source() {
            if (this.useMock) return MOCK_STATISTICS;
            if (this.statistics && Object.keys(this.statistics).length) return this.statistics;
            return this.statisticsData;
        },
        details() {
            return [
                { key: 'dzh', label: '待装货', value: this.source.pendingLoadOrderCount, unit: '票' },
                { key: 'dyxh', label: '待卸货', value: this.source.pendingUnloadOrderCount, unit: '票' },
            ];
        },
        totalNum() {
            return this.source.runningOrderCount;
        },
    },
    methods: {
        /**
         * 初始化：由父页面 home/index.vue 的 updateData() 统一驱动刷新（仿 Attention.init）。
         * 未登录时清空数据，避免展示上一账号的残留统计。
         * @returns {Promise<void>}
         */
        async init() {
            if (!uni.isLogin()) {
                this.statisticsData = {};
                return;
            }
            await this.getList();
        },

        /**
         * 拉取货主订单统计（仿 Attention 的 useRequest 拉取模式）。
         * 将 getShipperOrderStatistics 的 data 直接作为展示数据源。
         * @returns {Promise<void>}
         */
        async getList() {
            this.loading = true;
            const [err, res] = await useRequest(ApiGetShipperOrderStatistics);
            this.loading = false;
            if (err) return;
            this.statisticsData = (res && res.data) || {};
        },

        /**
         * 数字格式化：超过 99 统一显示为 99+；空值兜底为 '-'
         * @param {number|string|null|undefined} val 原始数值
         * @returns {number|string} 格式化后的展示值
         */
        formatNum(val) {
            // 空值兜底展示
            if (val === null || val === undefined || val === '') return '-';
            const num = Number(val);
            if (Number.isNaN(num)) return val;
            return num > 99 ? '99+' : num;
        },
    },
};
</script>

<style lang="scss" scoped>
.goods-statistics {
    padding-left: 8rpx;
    .total {
        display: flex;
        align-items: center;
        .title-hi {
            width: 78rpx;
            height: 55rpx;
            margin-right: 4rpx;
        }
        .text-dqjxzhy {
            width: 224rpx;
            height: 39rpx;
        }
        .total-num {
            color: #3a65ff;
            font-family: 'Douyin Sans';
            font-style: Bold;
            font-size: 36rpx;
            font-weight: bold;
            margin: 0 8rpx;
        }
        .unit {
            font-size: 24rpx;
            font-weight: bold;
        }
    }
    .detail {
        margin-top: 15rpx;
        padding-left: 16rpx;
        display: flex;
        .item {
            min-width: 112rpx;
            display: flex;
            flex-direction: column;
            &-label {
                margin-bottom: 4rpx;
                font-size: 20rpx;
                color: #999;
                font-weight: bold;
            }
            &-value {
                font-weight: bold;
                &__num {
                    font-family: 'Douyin Sans';
                    font-size: 36rpx;
                    margin-right: 2rpx;
                }
                &__unit {
                    font-size: 20rpx;
                }
            }
        }
    }
}
</style>
