<template>
    <view class="card-info" :class="{ 'card-info--highlight': highlight }">
        <!-- 右上角货源码徽标：使用设计稿导出的本地图（浅蓝三角 + 二维码）；点击弹出真实二维码大图 -->
        <view class="qr" @click.stop="handleShowQr">
            <image class="qr__badge" :src="$global.getImageUrl('pages/goods/qr-badge.png')" mode="scaleToFill" />
        </view>
        <view class="card-body" @click.stop="jumpTo">
            <view class="header">
                <view class="goods-info">
                    <!-- 文档暂无「品名」字段，暂用「货源名称 orderName」展示 -->
                    <view class="goods-info__name">{{ goods.goodsTypeName || goods.goodsBigTypeName }}</view>
                    <NumUnit :num="quantity.num" :unit="quantity.unit" color="#1cae7c" gap="4rpx" />
                </view>
                <TimeLoad :info="info" />
            </view>
            <AddressList :info="info" />
            <view v-if="tags.length || totalPrice.has" class="price-row">
                <view class="tag-box">
                    <view class="tag" v-for="tag in tags" :key="tag.key">
                        {{ tag.label }}
                    </view>
                </view>
                <view v-if="totalPrice.has" class="total-price">
                    <view class="total-price__label">运输总价</view>
                    <NumUnit class="total-price__value" :num="totalPrice.value" unit="元" color="#3A65FF" gap="2rpx" />
                </view>
            </view>
        </view>
        <view class="card-bottom">
            <OperateRow :info="info" @refresh="$emit('refresh')" />
        </view>
    </view>
</template>

<script>
import TimeLoad from './TimeLoad.vue';
import AddressList from './AddressList.vue';
import OperateRow from './OperateRow/index.vue';
import NumUnit from '@/components/NumUnit/index.vue';
import { stowageStatusMap, priceTypeRuleItemCode, priceTypeMap } from '@/pages/goods/constants.js';
import { formatNumber } from '@/common/utils/format.js';

export default {
    components: { TimeLoad, AddressList, NumUnit, OperateRow },
    props: {
        info: {
            type: Object,
            default: () => ({}),
        },
        priceModelsMap: {
            type: Object,
            default: () => { },
        },
        // 是否为首个卡片（仅首个卡片使用设计稿的暖色渐变背景）
        highlight: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * 货物信息：文档 redisOrderInfoListVoList[].redisOrderGoodsVoList[0]
         * @returns {object}
         */
        goods() {
            return this.info.redisOrderGoodsVoList?.[0] || {};
        },
        /**
         * 数量 + 单位（车数配载取 number，否则取 weight）
         * @returns {{ num: number, unit: string }}
         */
        quantity() {
            const g = this.goods;
            const byCar = g.stowageStatus == '2';
            return {
                num: byCar ? g.number || 0 : g.weight || 0,
                unit: stowageStatusMap[g.stowageStatus] || '',
            };
        },
        /**
         * 斤单价：仅「吨」(stowageStatus='0') 需要换算，1 吨 = 2000 斤；
         * 其余单位（方 / 车）无斤换算，返回 null。
         * 兼容处理：当 元/斤 小于 0.005 时，2 位小数四舍五入会得到 "0.00"（实际非 0），
         * 因此自适应提升精度到 4 位、6 位，避免把极小非零值误显示为 0.00。
         * @returns {string|null}
         */
        jinPrice() {
            if (this.goods.stowageStatus !== '0') return null;
            const price = Number(this.goods.shipmentPrice);
            if (isNaN(price)) return null;
            const value = price / 2000;
            if (value === 0) return '0.00';
            const precisions = [2, 4, 6];
            for (const w of precisions) {
                const s = formatNumber(value, w, { hasComma: false });
                if (s !== `0.${'0'.repeat(w)}`) return s;
            }
            return formatNumber(value, 6, { hasComma: false });
        },
        /**
         * 计费方式：取地址下运费规则 redisAddressList[].redisOrderFreightVoList 中
         * ruleItemCode='19' 的元素，用其 ruleValue 判断：
         *  1 卸货量估算 / 2 装货量估算 / 3 装卸货最小数量估算 / 4 装卸货最大数量估算
         * @returns {string} 计费方式文案；无匹配返回 ''
         */
        priceType() {
            const addresses = this.info.redisAddressList || [];
            for (const addr of addresses) {
                const rule = (addr?.redisOrderFreightVoList || []).find(item => item?.ruleItemCode === priceTypeRuleItemCode);
                if (rule) return priceTypeMap[rule.ruleValue] || '';
            }
            return '';
        },
        /**
         * 单价：has（后端是否返回）+ text（展示文案）
         *  - 无返回 → has=false，text='--'
         *  - 有值 → 'X 元/单位' 或 'X 元/单位（Y 元 / 斤）'
         * @returns {{ has: boolean, text: string }}
         */
        price() {
            const p = this.goods.goodsPrice;
            const has = p !== null && p !== undefined && p !== '';
            if (!has) return { has: false, text: '' };
            const base = `${p} 元/${this.quantity.unit}`;
            return { has: true, text: base };
            // return { has: true, text: this.jinPrice !== null ? `${base}（${this.jinPrice} 元 / 斤）` : base };
        },
        /**
         * 标签：计费方式 / 作业时段 / 计价方式
         * 注意：文档响应字段表暂无 workStartTime / workEndTime / priceModel，后两者暂恒为空
         */
        tags() {
            const { workStartTime, workEndTime, priceModel } = this.info;
            return [
                {
                    label: this.priceType,
                    key: 'priceType',
                },
                {
                    label: this.price.text,
                    key: 'price',
                },
                // {
                //     label: workStartTime && workEndTime ? `每日${workStartTime}-${workEndTime} 作业` : '',
                //     key: 'time',
                // },
                // {
                //     label: this.priceModelsMap[priceModel] || '',
                //     key: 'priceModel',
                // },
            ].filter(item => item.label);
        },
        /**
         * 总价：取货物 estimatedFreight（预估运费）
         * info 已是 redisOrderInfoListVoList 元素，经 goods → redisOrderGoodsVoList[0]
         * @returns {{ has: boolean, value: string }}
         */
        totalPrice() {
            const p = this.goods.estimatedFreight;
            const has = p !== null && p !== undefined && p !== '';
            return { has, value: has ? formatNumber(p, 2) : '' };
        },
    },

    data() {
        return {};
    },
    methods: {
        /**
         * 点击右上角货源码徽标：通知页面弹出二维码大图（二维码由页面调 getCym 接口获取）
         */
        handleShowQr() {
            if (!this.info.code) return;
            uni.$emit('pages/goods/index:showQr', { orderCode: this.info.code });
        },
        /**
         * 跳转货源详情
         * @by oh-my-zerone 2026-10-20 由 confirmQuote 详情模式改为独立货源详情页
         */
        jumpTo() {
            if (!this.info.code) return;
            const url = '/pages_goodsSource/sourceDetail/index?code=' + this.info.code;
            uni.navigateTo({ url });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

/* 设计稿 194:7186：卡片 padding 26、主区间距 16、内容区间距 8 */
.card-info {
    position: relative;
    overflow: hidden; // 让右上角徽标被卡片圆角裁切
    display: flex;
    flex-direction: column;
    padding: 26rpx;
    background-color: #fff;
    box-shadow: inset 0 2rpx 0 1rpx #fff;
    border-radius: 20rpx;
    @include flex-gap(16rpx, column);

    /* 设计稿：仅首个卡片使用暖色渐变背景（左上暖奶油白 → 右下纯白） */
    &--highlight {
        background: linear-gradient(141deg, #fffbf2 0%, #ffffff 100%);
    }

    /* 右上角货源码徽标：设计稿导出的本地图（已含浅蓝三角），卡片圆角处裁切 */
    .qr {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 2; // 避免被后续兄弟节点盖住导致点击无效（小程序偶发）
        width: 68rpx;
        height: 68rpx;

        &__badge {
            width: 100%;
            height: 100%;
            pointer-events: none; // 点击落到外层 view，保证 @click 稳定触发
        }
    }

    .card-body {
        display: flex;
        flex-direction: column;
        @include flex-gap(8rpx, column);
    }

    .header {
        display: flex;
        align-items: center;
        @include flex-gap(20rpx);

        .goods-info {
            display: flex;
            align-items: center;

            &__name {
                font-size: 24rpx;
                font-weight: bold;
                color: #333333;
                margin-right: 4rpx;
            }
        }
    }

    .price-row {
        display: flex;
        align-items: flex-end;
        @include flex-gap(14rpx);

        .tag-box {
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            display: flex;
            align-items: center;
            @include flex-gap(10rpx);

            .tag {
                flex-shrink: 0;
                color: #647090;
                font-size: 20rpx;
                font-weight: bold;
                line-height: 20rpx;
                padding: 8rpx 16rpx;
                background-color: #e7ecf5;
                border-radius: 8rpx;
            }
        }

        .total-price {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            @include flex-gap(2rpx, column);

            &__label {
                font-size: 16rpx;
                font-weight: bold;
                line-height: 21rpx;
                color: #8a91a1;
            }
        }
    }

    .card-bottom {
        border-top: 1rpx solid #eeeeee;
        padding-top: 16rpx; // 设计：分割线与底栏间距 16
    }
}
</style>
