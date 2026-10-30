<!--
 * @by oh-my-zerone 2026-10-27
 * 常用（收藏）司机列表页
 * 接口：GET /driver/recommend/commonDriver/{shipmentCode}
 * 列表项：头像 / 姓名 / 运力来源 / 车型载重 / 合作次数 / 准时率
 * 交互：点击进入详情；「取消」移除收藏（调用 ApiSetCommonDriver type=0）
 * @by oh-my-zerone 2026-10-27 车型名称在列表中已直接返回，无需字典映射
-->
<template>
    <SubPageLayout title="常用司机" body-padding="0 32rpx">
        <!-- 空态 -->
        <Empty v-if="!loading && list.length === 0" content="暂无常用司机" />

        <view v-else class="collect">
            <view
                class="collect-card"
                v-for="item in list"
                :key="item.driverCode"
                @click="goDetail(item)"
            >
                <image
                    class="collect-card__avatar"
                    :src="item.driverAvatar || defaultAvatar"
                    mode="aspectFill"
                />

                <view class="collect-card__main">
                    <view class="collect-card__top">
                        <text class="collect-card__name">{{ item.driverName || '—' }}</text>
                        <text class="collect-card__badge" v-if="item.capacitySource">{{ item.capacitySource }}</text>
                    </view>

                    <view class="collect-card__vehicle">{{ buildVehicleDesc(item) }}</view>

                    <view class="collect-card__meta">
                        <text class="collect-card__meta-item">合作 {{ item.cooperationCount != null ? item.cooperationCount : 0 }} 次</text>
                        <text
                            class="collect-card__meta-item"
                            v-if="item.onTimeRate != null"
                        >准时率 {{ item.onTimeRate }}%</text>
                    </view>
                </view>

                <!-- 取消收藏：stop 阻止冒泡，避免触发卡片跳转（跨端安全，纯方法调用） -->
                <view class="collect-card__action" @click.stop="onRemove(item)">取消</view>
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

// services
import { ApiGetCommonDriverList, ApiSetCommonDriver } from '../service.js';

// platform（跨端 Modal 兼容层）
import { showModal } from '@/common/platform/modal.js';

export default {
    name: 'TransportCapacityCollectList',
    components: { SubPageLayout, Empty },
    data() {
        return {
            /** 货主编码 */
            shipmentCode: '',
            /** 收藏司机列表 */
            list: [],
            /** 是否请求中 */
            loading: false,
            /** 默认头像占位 */
            defaultAvatar: '',
            /** 正在取消的司机编码（防重复点击） */
            removingCode: null,
        };
    },
    onLoad(options) {
        this.shipmentCode =
            (options && options.shipmentCode) || this.$store.getters.shipmentInfo?.code || '';
        this.defaultAvatar = this.$global.getImageUrl('pages/home/cover-service.png');
        this.fetchList();
    },
    methods: {
        /**
         * 拉取收藏司机列表
         * @returns {Promise<void>}
         */
        async fetchList() {
            if (!this.shipmentCode) {
                uni.showToast({ title: '缺少货主参数', icon: 'none' });
                return;
            }
            this.loading = true;
            const [err, res] = await useRequest(ApiGetCommonDriverList, this.shipmentCode);
            this.loading = false;
            if (err) {
                uni.showToast({ title: '获取常用司机失败', icon: 'none' });
                return;
            }
            this.list = (res && res.data) || [];
        },
        /**
         * 组装车型描述：车长车型 · 载重吨（列表已直接返回名称，无需字典）
         * @param {Object} item 收藏司机行，含 vehicleLength / vehicleType / vehicleLoadWeight
         * @returns {string} 如「13米高栏·31吨」
         */
        buildVehicleDesc(item) {
            const length = item.vehicleLength || '';
            const type = item.vehicleType || '';
            const weight = item.vehicleLoadWeight != null ? `${item.vehicleLoadWeight}吨` : '';
            return [length + type, weight].filter(Boolean).join('·') || '—';
        },
        /**
         * 进入司机详情
         * @param {Object} item 收藏司机行
         * @returns {void}
         */
        goDetail(item) {
            if (!item || !item.driverCode) return;
            uni.navigateTo({
                url: `/pages_user/transportCapacity/detail/index?driverCode=${item.driverCode}&shipmentCode=${this.shipmentCode}`,
            });
        },
        /**
         * 取消收藏：二次确认后调用接口，成功从列表移除
         * @param {Object} item 收藏司机行
         * @returns {Promise<void>}
         */
        async onRemove(item) {
            if (!item || !item.driverCode) return;
            if (this.removingCode) return;
            const targetCode = item.driverCode;
            showModal({
                title: '取消常用司机',
                content: `确认将「${item.driverName || '该司机'}」移出常用司机？`,
                confirmText: '取消收藏',
                cancelText: '再想想',
                onConfirm: async () => {
                    this.removingCode = targetCode;
                    const [err] = await useRequest(ApiSetCommonDriver, {
                        shipmentCode: this.shipmentCode,
                        driverCode: targetCode,
                        type: 0,
                    });
                    this.removingCode = null;
                    if (err) {
                        uni.showToast({ title: '取消失败，请重试', icon: 'none' });
                        return;
                    }
                    this.list = this.list.filter(it => it.driverCode !== targetCode);
                    uni.showToast({ title: '已取消', icon: 'none' });
                },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

$primary: #3a65ff;

.collect {
    padding: 24rpx 0;
    display: flex;
    flex-direction: column;
    @include flex-gap(20rpx, column);

    &-card {
        display: flex;
        align-items: center;
        @include flex-gap(24rpx);
        padding: 24rpx 24rpx;
        background-color: #fff;
        border-radius: 20rpx;
        box-sizing: border-box;

        &__avatar {
            flex-shrink: 0;
            width: 96rpx;
            height: 96rpx;
            border-radius: 50%;
            border: 2rpx solid #e7e7e7;
            background-color: #f3f3f3;
            box-sizing: border-box;
        }

        &__main {
            flex: 1;
            min-width: 0;
        }

        &__top {
            display: flex;
            align-items: center;
            @include flex-gap(12rpx);
        }

        &__name {
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
        }

        &__badge {
            flex-shrink: 0;
            padding: 4rpx 12rpx;
            font-size: 20rpx;
            color: $primary;
            background-color: rgba(58, 101, 255, 0.08);
            border-radius: 8rpx;
        }

        &__vehicle {
            margin-top: 10rpx;
            font-size: 26rpx;
            color: #333;
            font-weight: bold;
            line-height: 36rpx;
        }

        &__meta {
            display: flex;
            @include flex-gap(24rpx);
            margin-top: 10rpx;

            &-item {
                font-size: 22rpx;
                color: #999;
            }
        }

        &__action {
            flex-shrink: 0;
            padding: 12rpx 20rpx;
            font-size: 24rpx;
            color: #999;
            background-color: #f5f5f5;
            border-radius: 10rpx;
        }
    }
}
</style>
