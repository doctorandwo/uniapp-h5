<template>
    <view class="service-card" @click="$emit('detail', info)">
        <view class="card-left">
            <image :src="info.cover || defaultCover" class="card-image" />
            <view class="card-tag g-single-row" v-if="info.cooperationDesc">{{ info.cooperationDesc }}</view>
        </view>
        <view class="card-right">
            <view class="card-title">
                <view class="card-title__name g-single-row">{{ info.title }}</view>
                <view class="card-title__tuijian">
                    <span class="tuijian-percent">{{ info.tuijianPercent }}</span>
                    <span>推荐</span>
                </view>
            </view>
            <view class="card-right-content">
                <view class="card-row">
                    <view class="card-row__label">车辆</view>
                    <view class="card-row__value g-single-row" :class="{ 'is-placeholder': isPlaceholder(info.vehicleDesc) }">{{ info.vehicleDesc }}</view>
                </view>
                <view class="card-row">
                    <view class="card-row__label">线路</view>
                    <view class="card-row__value g-single-row" :class="{ 'is-placeholder': isPlaceholder(info.routeDesc) }">{{ info.routeDesc }}</view>
                </view>
            </view>
            <view class="tag-box" v-if="tags.length">
                <CardTag v-for="(tag, i) in tags" :key="i" :value="tag.label" :className="tag.className" />
            </view>
        </view>
    </view>
</template>

<script>
/**
 * @by oh-my-zerone 2026-10-21
 * 推荐运力司机卡片：按原型图渲染司机维度数据（车辆/线路/履约/准时率）
 */
// components
import CardTag from '../parts/CardTag.vue';

// hooks
import { useVehicleDict } from '@/pages/home/hooks.js';

// const
// 后端字段为空且开启 mock 兜底时使用的占位数值（与 UI 原型一致）
const MOCK_RECOMMEND_RATE = 96;
const MOCK_ONTIME_RATE = 98;

export default {
    components: { CardTag },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        // 可选：由父级预加载的车长/车型字典映射（code->label），用于首屏直接组装车辆描述
        vehicleDict: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            defaultCover: this.$global.getImageUrl('pages/home/cover-service.png'),
            dictMaps: this.vehicleDict || { lengthMap: {}, typeMap: {} },
            // mock 开关（组件内部）：后端字段（推荐度/准时率）为空时是否兜底为 mock 数值；后端补齐后改为 false
            mockEnabled: true,
        };
    },
    computed: {
        info() {
            const item = this.item || {};
            const vehicles = item.availableVehicles || [];
            const cooperationCount = item.cooperationCount || 0;
            return {
                title: item.driverName || '',
                cover: vehicles[0]?.vehicleImage || '',
                cooperationDesc: cooperationCount ? `合作过 ${cooperationCount} 次` : '',
                tuijianPercent: this.resolvePercent(item.recommendRate, MOCK_RECOMMEND_RATE),
                vehicleDesc: this.buildVehicleDesc(vehicles) || '—',
                routeDesc: this.buildRouteDesc(item) || '—',
                ...item,
            };
        },
        /**
         * 卡片标签：仅「履约 N 单」「准时率 N%」两个；准时率字段缺失时，开启 mock 开关则兜底为 mock 数值
         */
        tags() {
            const item = this.item || {};
            const tags = [];
            // 履约单数：为 0 或缺失时隐藏该标签
            if (item.fulfilledWaybillCount != null && item.fulfilledWaybillCount > 0) {
                tags.push({ label: `履约${item.fulfilledWaybillCount}单`, className: '' });
            }
            if (item.onTimeRate != null) {
                tags.push({ label: `准时率${item.onTimeRate}%`, className: 'blue-dark' });
            } else if (this.mockEnabled) {
                tags.push({ label: `准时率${MOCK_ONTIME_RATE}%`, className: 'blue-dark' });
            }
            return tags;
        },
    },
    mounted() {
        // 父级未预加载字典时，卡片自行创建 hook 实例加载（模块级缓存），加载完成后触发 recompute
        if (!this.vehicleDict) {
            const { state, loadVehicleDict } = useVehicleDict();
            this.dictMaps = state;
            loadVehicleDict().catch(() => {});
        }
    },
    methods: {
        /**
         * 判断展示值是否为空值占位符（车辆/线路为「—」，推荐度为「—%」）
         * @param {string} val 展示文本
         * @returns {boolean}
         */
        isPlaceholder(val) {
            return val === '—' || val === '—%';
        },
        /**
         * 组装车辆描述：逐辆「车长 车型 载重吨」，多辆以 / 拼接
         * @param {Array} vehicles 车辆聚合列表，元素含 vehicleLength/vehicleTypeCode/vehicleLoadWeight
         * @returns {string} 如「13米高栏 31吨 / 17米平板 32吨」，无车辆时返回空串
         */
        buildVehicleDesc(vehicles) {
            if (!vehicles.length) return '';
            const { lengthMap = {}, typeMap = {} } = this.dictMaps || {};
            return vehicles
                .map(v => {
                    const length = lengthMap[String(v.vehicleLength)] || v.vehicleLength || '';
                    const type = typeMap[String(v.vehicleTypeCode)] || v.vehicleTypeName || '';
                    const weight = v.vehicleLoadWeight != null ? `${v.vehicleLoadWeight}吨` : '';
                    return [length, type, weight].filter(Boolean).join(' ');
                })
                .filter(Boolean)
                .join(' / ');
        },
        /**
         * 组装线路描述：「装货城市 → 卸货城市 · N趟」
         * @param {Object} item 列表行数据
         * @returns {string} 无装卸货城市时返回空串
         */
        buildRouteDesc(item) {
            const load = item.loadCityName || '';
            const unload = item.unloadCityName || '';
            const count = item.sameRouteWaybillCount || 0;
            if (!load && !unload) return '';
            return `${load} → ${unload} · ${count}趟`;
        },
        /**
         * 解析百分比展示值：后端返回有效数值时原样展示；为空且开启 mock 开关时兜底为 mock 数值，否则展示占位「—%」
         * @param {number|string|null} raw 后端返回的原始百分比数值
         * @param {number} mockVal mock 兜底数值
         * @returns {string} 带百分号的展示文本，如「96%」「—%」
         */
        resolvePercent(raw, mockVal) {
            if (raw != null && raw !== '') return `${raw}%`;
            return this.mockEnabled ? `${mockVal}%` : '—%';
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
.service-card {
    padding: 22rpx 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    display: flex;
    @include flex-gap(30rpx);

    .is-placeholder {
        opacity: 0.4;
    }

    .card-left {
        flex-shrink: 0;
        position: relative;
        width: 152rpx;
        height: 204rpx;
        .card-image {
            width: 100%;
            height: 100%;
            border-radius: 12rpx;
            border: 1rpx solid #e7e7e7;
            box-sizing: border-box;
        }
        .card-tag {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 9rpx;
            padding: 5rpx 9rpx 5rpx 15rpx;
            border-radius: 8rpx;
            background-color: rgba(39, 39, 39, 0.65);
            color: #f9d6ad;
            font-size: 18rpx;
            font-weight: bold;
            max-width: 90%;
            white-space: nowrap;
        }
    }
    .card-right {
        flex: 1;
        min-width: 0;
        .card-title {
            line-height: 56rpx;
            display: flex;
            align-items: center;
            &__name {
                flex: 1;
                min-width: 0;
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
            }
            &__tuijian {
                margin-left: 15rpx;
                font-size: 20rpx;
                font-weight: bold;
                color: #1cae7c;
                .tuijian-percent {
                    margin-right: 4rpx;
                    font-size: 32rpx;
                    font-family: Douyin Sans, Douyin Sans;
                    font-weight: 400;
                }
            }
        }
        &-content {
            display: flex;
            flex-direction: column;
            @include flex-gap(8rpx, column);
            margin: 16rpx 0 20rpx;
            .card-row {
                display: flex;
                @include flex-gap(16rpx);
                align-items: center;
                font-size: 24rpx;
                font-weight: bold;

                &__label {
                    color: #999;
                    flex-shrink: 0;
                }
                &__value {
                    color: #333;
                }
            }
        }
    }

    .tag-box {
        display: flex;
        @include flex-gap(12rpx);
        align-items: center;
        overflow-x: auto;
    }
}
</style>
