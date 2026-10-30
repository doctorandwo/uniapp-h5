<!--
 * @by oh-my-zerone 2026-10-27
 * 推荐运力司机详情页
 * 布局：SubPageLayout（Header + 内容区 + 底部操作栏）
 * 内容区：蓝色渐变 Hero（头像/姓名/运力来源/推荐度） + 三张信息卡片
 * 底部：加为常用（本地翻转） + 定向发布资源（本期预留）
 * @by oh-my-zerone 2026-10-27 车型展示复用首页 useVehicleDict 字典映射，格式沿用 ServiceCard
-->
<template>
    <SubPageLayout title="运力详情" body-padding="0">
        <!-- 加载失败 / 无数据 -->
        <Empty v-if="!loading && !hasData" content="未获取到司机信息" />

        <view v-else class="detail">
            <!-- Hero：司机基础画像（蓝色渐变） -->
            <view class="detail-hero">
                <view class="detail-hero__base">
                    <image
                        class="detail-hero__avatar"
                        :src="driverAvatar || defaultAvatar"
                        mode="aspectFill"
                    />
                    <view class="detail-hero__info">
                        <view class="detail-hero__name">{{ driverName || '—' }}</view>
                        <view class="detail-hero__source" v-if="capacitySource">运力来源 · {{ capacitySource }}</view>
                    </view>
                </view>

                <view class="detail-hero__recommend">
                    <view class="detail-hero__rate">
                        <text class="detail-hero__rate-num">{{ recommendRateText }}</text>
                        <text class="detail-hero__rate-unit">推荐</text>
                    </view>
                    <view class="detail-hero__reason" v-if="recommendReason">{{ recommendReason }}</view>
                </view>
            </view>

            <!-- 卡片：能干什么活 -->
            <view class="detail-card">
                <view class="detail-card__head">
                    <text class="detail-card__title">能干什么活</text>
                    <text class="detail-card__tag">车辆与承运经历</text>
                </view>

                <view class="detail-row">
                    <view class="detail-row__label">常跑线路</view>
                    <view class="detail-row__main">
                        <view class="detail-route">
                            <text class="detail-route__line">{{ routeDesc || '—' }}</text>
                            <text class="detail-route__count" v-if="sameRouteWaybillCount != null">{{ sameRouteWaybillCount }}趟</text>
                        </view>
                        <view class="detail-tip" v-if="routeStatisticsDays != null">近{{ routeStatisticsDays }}天该方向的已完成运输</view>
                    </view>
                </view>

                <view class="detail-row">
                    <view class="detail-row__label">可用车型与载重</view>
                    <view class="detail-row__main">
                        <view
                            class="detail-vehicle"
                            v-for="(v, i) in availableVehicles"
                            :key="v.vehicleCode || i"
                        >{{ buildVehicleDesc(v) }}</view>
                        <view class="detail-tip">实际执行车辆在司机接单时确认</view>
                    </view>
                </view>

                <view class="detail-row">
                    <view class="detail-row__label">实际承运过</view>
                    <view class="detail-row__main">
                        <view class="detail-goods" v-if="transportedGoodsNames.length">
                            <text
                                class="detail-goods__tag"
                                v-for="(g, i) in transportedGoodsNames"
                                :key="i"
                            >{{ g }}</text>
                        </view>
                        <view class="detail-tip">来源平台提供的历史承运记录</view>
                    </view>
                </view>
            </view>

            <!-- 卡片：跑得怎么样 -->
            <view class="detail-card">
                <view class="detail-card__head">
                    <text class="detail-card__title">跑得怎么样</text>
                    <text class="detail-card__tag">平台记录</text>
                </view>

                <view class="detail-stats">
                    <view class="detail-stat">
                        <view class="detail-stat__num">{{ fulfilledWaybillCount != null ? fulfilledWaybillCount : '—' }}</view>
                        <view class="detail-stat__label">履约订单</view>
                    </view>
                    <view class="detail-stat">
                        <view class="detail-stat__num">{{ onTimeRate != null ? onTimeRate + '%' : '—' }}</view>
                        <view class="detail-stat__label">准时率</view>
                    </view>
                    <view class="detail-stat">
                        <view class="detail-stat__num">{{ shipperPraiseRate != null ? shipperPraiseRate + '%' : '—' }}</view>
                        <view class="detail-stat__label">货主好评率</view>
                    </view>
                </view>

                <view class="detail-tip detail-tip--center" v-if="liableComplaintCount != null">
                    有责投诉 {{ liableComplaintCount }} 次
                </view>
            </view>

            <!-- 卡片：你和 TA -->
            <view class="detail-card">
                <view class="detail-card__head">
                    <text class="detail-card__title">你和 TA</text>
                    <text class="detail-card__tag">本平台记录</text>
                </view>

                <view class="detail-coop">
                    <view class="detail-coop__check">✓</view>
                    <text class="detail-coop__text">与你合作 {{ cooperationCount != null ? cooperationCount : 0 }} 次</text>
                </view>
                <view class="detail-coop-date" v-if="latestCooperationDate">最近一次合作 {{ formatDate(latestCooperationDate) }}</view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view slot="footer" class="detail-footer">
            <!-- 加为常用：本地翻转状态，点击调接口 -->
            <view
                class="detail-footer__star"
                :class="{ 'is-active': isCommon, 'is-loading': toggling }"
                @click="onToggleCommon"
            >
                <text v-if="toggling" class="detail-footer__spinner"></text>
                <text v-else class="detail-footer__star-icon">{{ isCommon ? '★' : '☆' }}</text>
                <text class="detail-footer__star-text">{{ isCommon ? '已加为常用' : '加为常用' }}</text>
            </view>

            <!-- 定向发布资源：本期预留，仅占位 -->
            <view class="detail-footer__publish" @click="onPublishReserved">
                <text class="detail-footer__publish-text">定向发布资源</text>
            </view>
        </view>
    </SubPageLayout>
</template>

<script>
// components
import SubPageLayout from '@/components/SubPageLayout/index.vue';
import Empty from '@/components/Empty/index.vue';

// hooks
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { useVehicleDict } from '@/pages/home/hooks.js';

// services
import { ApiGetDriverRecommendDetail, ApiSetCommonDriver } from '../service.js';

export default {
    name: 'TransportCapacityDetail',
    components: { SubPageLayout, Empty },
    data() {
        return {
            /** 司机编码（路由参数） */
            driverCode: '',
            /** 货主编码（路由参数，缺省回退至 store） */
            shipmentCode: '',
            /** 是否请求中 */
            loading: false,
            /** 是否已有详情数据 */
            hasData: false,

            // —— 详情字段 ——
            driverName: '',
            driverAvatar: '',
            capacitySource: '',
            recommendRate: null,
            recommendReason: '',
            loadCityName: '',
            unloadCityName: '',
            sameRouteWaybillCount: null,
            routeStatisticsDays: null,
            availableVehicles: [],
            transportedGoodsNames: [],
            fulfilledWaybillCount: null,
            onTimeRate: null,
            shipperPraiseRate: null,
            liableComplaintCount: null,
            cooperationCount: null,
            latestCooperationDate: '',
            /** 是否为常用司机（0否 / 1是），本地维护 */
            commonDriverFlag: 0,

            /** 车长/车型字典映射（来自 useVehicleDict） */
            dictMaps: { lengthMap: {}, typeMap: {} },
            /** 默认头像占位 */
            defaultAvatar: '',
            /** 加为常用请求中 */
            toggling: false,
        };
    },
    computed: {
        /** 推荐度展示文本：100% 推荐，缺失时占位 */
        recommendRateText() {
            return this.recommendRate != null ? `${this.recommendRate}%` : '—';
        },
        /** 是否常用司机（本地翻转） */
        isCommon() {
            return this.commonDriverFlag === 1;
        },
        /** 常跑线路描述：装货城市 → 卸货城市 */
        routeDesc() {
            const load = this.loadCityName || '';
            const unload = this.unloadCityName || '';
            if (!load && !unload) return '';
            return `${load} → ${unload}`;
        },
    },
    onLoad(options) {
        // 入参：推荐列表 / 常用司机列表携带 driverCode + shipmentCode
        this.driverCode = (options && options.driverCode) || '';
        this.shipmentCode =
            (options && options.shipmentCode) || this.$store.getters.shipmentInfo?.code || '';
        this.defaultAvatar = this.$global.getImageUrl('pages/home/cover-service.png');
        this.loadDict();
        this.fetchDetail();
    },
    methods: {
        /**
         * 预载车长/车型字典（首屏直接映射车型名称）
         * @returns {void}
         */
        loadDict() {
            const { state, loadVehicleDict } = useVehicleDict();
            this.dictMaps = state;
            loadVehicleDict().catch(() => {});
        },
        /**
         * 拉取司机详情
         * @returns {Promise<void>}
         */
        async fetchDetail() {
            if (!this.driverCode || !this.shipmentCode) {
                uni.showToast({ title: '缺少司机或货主参数', icon: 'none' });
                return;
            }
            this.loading = true;
            const [err, res] = await useRequest(
                ApiGetDriverRecommendDetail,
                this.driverCode,
                this.shipmentCode,
            );
            this.loading = false;
            if (err) {
                uni.showToast({ title: '获取司机详情失败', icon: 'none' });
                return;
            }
            const data = (res && res.data) || {};
            this.applyDetail(data);
            this.hasData = true;
        },
        /**
         * 将接口数据写入页面状态
         * @param {Object} data 详情 data
         * @returns {void}
         */
        applyDetail(data) {
            this.driverName = data.driverName || '';
            this.driverAvatar = data.driverAvatar || '';
            this.capacitySource = data.capacitySource || '';
            this.recommendRate = data.recommendRate != null ? data.recommendRate : null;
            this.recommendReason = data.recommendReason || '';
            this.loadCityName = data.loadCityName || '';
            this.unloadCityName = data.unloadCityName || '';
            this.sameRouteWaybillCount = data.sameRouteWaybillCount != null ? data.sameRouteWaybillCount : null;
            this.routeStatisticsDays = data.routeStatisticsDays != null ? data.routeStatisticsDays : null;
            this.availableVehicles = data.availableVehicles || [];
            this.transportedGoodsNames = data.transportedGoodsNames || [];
            this.fulfilledWaybillCount = data.fulfilledWaybillCount != null ? data.fulfilledWaybillCount : null;
            this.onTimeRate = data.onTimeRate != null ? data.onTimeRate : null;
            this.shipperPraiseRate = data.shipperPraiseRate != null ? data.shipperPraiseRate : null;
            this.liableComplaintCount = data.liableComplaintCount != null ? data.liableComplaintCount : null;
            this.cooperationCount = data.cooperationCount != null ? data.cooperationCount : null;
            this.latestCooperationDate = data.latestCooperationDate || '';
            this.commonDriverFlag = data.commonDriverFlag === 1 ? 1 : 0;
        },
        /**
         * 组装单辆车描述：车长车型 · 载重吨（格式沿用 ServiceCard）
         * @param {Object} v 车辆对象，含 vehicleLength / vehicleTypeCode / vehicleLoadWeight
         * @returns {string} 如「13米高栏·31吨」
         */
        buildVehicleDesc(v) {
            const { lengthMap = {}, typeMap = {} } = this.dictMaps || {};
            const length = lengthMap[String(v.vehicleLength)] || v.vehicleLength || '';
            const type = typeMap[String(v.vehicleTypeCode)] || v.vehicleTypeName || '';
            const weight = v.vehicleLoadWeight != null ? `${v.vehicleLoadWeight}吨` : '';
            return [length + type, weight].filter(Boolean).join('·');
        },
        /**
         * 日期格式化：yyyy-MM-dd → yyyy年M月D日
         * @param {string} val 原始日期
         * @returns {string} 格式化结果，缺失返回占位
         */
        formatDate(val) {
            if (!val) return '—';
            const parts = String(val).split('-');
            if (parts.length < 3) return val;
            return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
        },
        /**
         * 加为常用 / 取消：本地先翻转，调用接口成功后保持，失败回滚
         * @returns {Promise<void>}
         */
        async onToggleCommon() {
            if (this.toggling) return;
            const nextType = this.isCommon ? 0 : 1;
            const prevFlag = this.commonDriverFlag;
            // 本地乐观翻转，保证即时反馈
            this.commonDriverFlag = nextType;
            this.toggling = true;
            const [err] = await useRequest(ApiSetCommonDriver, {
                shipmentCode: this.shipmentCode,
                driverCode: this.driverCode,
                type: nextType,
            });
            this.toggling = false;
            if (err) {
                // 失败回滚
                this.commonDriverFlag = prevFlag;
                uni.showToast({ title: '操作失败，请重试', icon: 'none' });
            } else {
                uni.showToast({ title: nextType === 1 ? '已加为常用' : '已取消常用', icon: 'none' });
            }
        },
        /**
         * 定向发布资源：本期预留，暂不实现跳转
         * @returns {void}
         */
        onPublishReserved() {
            uni.showToast({ title: '功能开发中，敬请期待', icon: 'none' });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

$primary: #3a65ff;

.detail {
    min-height: 100%;
    padding-bottom: 24rpx;
    background-color: #f3f3f3;

    /* Hero 蓝色渐变头部 */
    &-hero {
        background: linear-gradient(135deg, #3a65ff 0%, #5b7cff 100%);
        padding: 32rpx;
        color: #fff;

        &__base {
            display: flex;
            align-items: center;
            @include flex-gap(24rpx);
        }

        &__avatar {
            flex-shrink: 0;
            width: 112rpx;
            height: 112rpx;
            border-radius: 50%;
            border: 4rpx solid rgba(255, 255, 255, 0.6);
            background-color: rgba(255, 255, 255, 0.2);
            box-sizing: border-box;
        }

        &__info {
            flex: 1;
            min-width: 0;
        }

        &__name {
            font-size: 36rpx;
            font-weight: bold;
            line-height: 48rpx;
        }

        &__source {
            margin-top: 8rpx;
            font-size: 24rpx;
            opacity: 0.85;
        }

        &__recommend {
            display: flex;
            align-items: flex-end;
            @include flex-gap(20rpx);
            margin-top: 32rpx;
        }

        &__rate {
            display: flex;
            align-items: baseline;
            @include flex-gap(8rpx);
        }

        &__rate-num {
            font-size: 56rpx;
            font-weight: bold;
            line-height: 1;
        }

        &__rate-unit {
            font-size: 28rpx;
            font-weight: bold;
        }

        &__reason {
            flex: 1;
            min-width: 0;
            font-size: 22rpx;
            line-height: 32rpx;
            opacity: 0.85;
        }
    }

    /* 通用信息卡片 */
    &-card {
        margin: 24rpx 32rpx 0;
        padding: 28rpx 28rpx 32rpx;
        background-color: #fff;
        border-radius: 20rpx;
        box-sizing: border-box;

        &__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20rpx;
        }

        &__title {
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
        }

        &__tag {
            font-size: 22rpx;
            color: #999;
        }
    }

    /* 行（标签 + 内容） */
    &-row {
        display: flex;
        align-items: flex-start;
        @include flex-gap(20rpx);
        padding: 18rpx 0;
        border-top: 2rpx solid #f2f2f2;

        &__label {
            flex-shrink: 0;
            width: 140rpx;
            font-size: 26rpx;
            color: #999;
            line-height: 40rpx;
        }

        &__main {
            flex: 1;
            min-width: 0;
        }
    }

    /* 常跑线路 */
    &-route {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
        line-height: 40rpx;

        &__count {
            flex-shrink: 0;
            margin-left: 16rpx;
            color: $primary;
            font-size: 26rpx;
        }
    }

    /* 可用车型每行 */
    &-vehicle {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        line-height: 44rpx;
    }

    /* 实际承运货物标签 */
    &-goods {
        display: flex;
        flex-wrap: wrap;
        @include flex-gap(16rpx, row);

        &__tag {
            padding: 8rpx 20rpx;
            font-size: 24rpx;
            color: #3a65ff;
            background-color: rgba(58, 101, 255, 0.08);
            border-radius: 8rpx;
        }
    }

    /* 提示说明行 */
    &-tip {
        margin-top: 10rpx;
        font-size: 22rpx;
        color: #999;
        line-height: 32rpx;

        &--center {
            margin-top: 20rpx;
            text-align: center;
        }
    }

    /* 跑得怎么样：三列指标 */
    &-stats {
        display: flex;
        align-items: center;
    }

    &-stat {
        flex: 1;
        text-align: center;

        &__num {
            font-size: 40rpx;
            font-weight: bold;
            color: #333;
            line-height: 52rpx;
        }

        &__label {
            margin-top: 6rpx;
            font-size: 24rpx;
            color: #999;
        }
    }

    /* 你和 TA */
    &-coop {
        display: flex;
        align-items: center;
        @include flex-gap(12rpx);
        font-size: 28rpx;
        font-weight: bold;
        color: #333;

        &__check {
            flex-shrink: 0;
            width: 36rpx;
            height: 36rpx;
            line-height: 36rpx;
            text-align: center;
            border-radius: 50%;
            background-color: #1cae7c;
            color: #fff;
            font-size: 22rpx;
        }

        &-date {
            margin-top: 14rpx;
            font-size: 24rpx;
            color: #999;
        }
    }
}

/* 底部操作栏 */
.detail-footer {
    display: flex;
    align-items: center;
    @include flex-gap(20rpx);

    &__star {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        padding: 0 28rpx;
        box-sizing: border-box;
        background-color: #fff;
        border: 2rpx solid #d4d4d4;
        border-radius: 16rpx;
        color: #333;
        font-size: 26rpx;
        font-weight: bold;

        &.is-active {
            border-color: #f5a623;
            color: #f5a623;
        }

        &.is-loading {
            opacity: 0.6;
        }

        &-icon {
            margin-right: 8rpx;
            font-size: 30rpx;
        }
    }

    &__publish {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        background-color: $primary;
        border-radius: 16rpx;
        color: #fff;
        font-size: 30rpx;
        font-weight: bold;
    }

    /* 按钮内转圈：currentColor 随文字色自适应 */
    &__spinner {
        flex-shrink: 0;
        width: 26rpx;
        height: 26rpx;
        margin-right: 10rpx;
        border: 4rpx solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        animation: detail-footer-spin 0.7s linear infinite;
    }
}

@keyframes detail-footer-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
