<template>
    <view class="operate-row">
        <!-- @by oh-my-zerone status=0 已发布/上架：仅保留上下架操作，服务商入口按设计稿移除 -->
        <template v-if="orderStatus === ORDER_STATUS.PUBLISHED">
            <view class="left">
                <StatusText :text="orderStatusText" color="#0460FB" />
                <view class="desc g-single-row" v-if="createTime">{{ createTime }}</view>
            </view>
            <view class="right">
                <CButton text="取消货源" type="info" @click="hanldeOperate({ command: 'cancelGoods' })" />
            </view>
        </template>

        <!-- @by oh-my-zerone status=1 下架：仅保留重新发布（上架）操作 -->
        <template v-else-if="orderStatus === ORDER_STATUS.OFF_SHELF">
            <view class="left">
                <StatusText :text="orderStatusText" color="#707070" />
                <view class="desc g-single-row" v-if="updateTime">{{ updateTime }}</view>
            </view>
            <view class="right">
                <CButton text="重新发布" type="info" @click="hanldeOperate({ command: 'reRelease' })" />
            </view>
        </template>

        <!-- status=2 未发布：仅展示状态；操作不确定，暂不放按钮 -->
        <template v-else-if="orderStatus === ORDER_STATUS.UNPUBLISHED">
            <view class="left">
                <StatusText :text="orderStatusText" color="#707070" />
                <!-- 不确定：未发布是否展示创建时间 / 其它辅助文案 -->
                <!-- <view class="desc g-single-row" v-if="createTime">{{ createTime }}</view> -->
            </view>
            <view class="right">
                <!-- 不确定：未发布是否有「去发布 / 编辑 / 删除」等操作 -->
                <!-- <CButton text="去发布" type="primary" @click="hanldeOperate({ command: 'reRelease' })" /> -->
            </view>
        </template>

        <!-- @by oh-my-zerone status=3 已完成：无操作按钮（服务商入口按设计稿移除） -->
        <template v-else-if="orderStatus === ORDER_STATUS.COMPLETED">
            <view class="left">
                <StatusText :text="orderStatusText" color="#707070" />
                <view class="desc g-single-row" v-if="updateTime">{{ updateTime }}</view>
            </view>
            <view class="right"></view>
        </template>

        <!--
          旧 executionStatus「已接单/运输中」布局已下线（含进度条）。
          注意：勿在 HTML 注释里写真实组件标签（如进度条组件），
          小程序编译仍会收集 usingComponents，导致缺 .wxss。
        -->
    </view>
</template>

<script>
import StatusText from './StatusText.vue';
import CButton from './CButton.vue';

import dayjs from 'dayjs';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { orderStatusMap, ORDER_STATUS, stowageStatusMap } from '@/pages/goods/constants.js';
import { ApiLoadAndUnloadingGoods, ApiIncrementDkOrderStowage } from '@/pages/goods/services.js';

export default {
    props: {
        info: {
            type: Object,
            default: () => {},
        },
    },
    components: {
        StatusText,
        CButton,
    },
    data() {
        return {
            ORDER_STATUS,
        };
    },
    computed: {
        /**
         * 货物信息：redisOrderGoodsVoList[0]
         * @returns {object}
         */
        goods() {
            return this.info.redisOrderGoodsVoList?.[0] || {};
        },
        /**
         * 货源单状态：统一转字符串，兼容接口返回 number / string
         * 0 已发布 · 1 下架 · 2 未发布 · 3 已完成
         * @returns {string}
         */
        orderStatus() {
            const s = this.info.status;
            if (s === null || s === undefined || s === '') return '';
            return String(s);
        },
        orderStatusText() {
            return orderStatusMap[this.orderStatus] || '';
        },
        /**
         * @by oh-my-zerone 时间字段统一格式 YYYY年M月D日（对齐设计稿）
         * 发布/下架/完成时间在原卡片里直接渲染原始字符串（含时分秒），此处统一格式化
         * @returns {string}
         */
        createTime() {
            if (!this.info.createTime) return '';
            return dayjs(this.info.createTime).format('YYYY年M月D日');
        },
        updateTime() {
            if (!this.info.updateTime) return '';
            return dayjs(this.info.updateTime).format('YYYY年M月D日');
        },
        // —— 以下进度相关：仅旧 RECEIVE/EXECUTING 使用，新 status 暂无；保留备查 ——
        // unit() {
        //     return stowageStatusMap[this.goods.stowageStatus] || '';
        // },
        // total() {
        //     return this.goods.stowageStatus == '2' ? this.goods.number : this.goods.weight;
        // },
        // remain() {
        //     return this.goods.stowageStatus == '2' ? this.goods.remainingNumber : this.goods.remainingWeight;
        // },
        // loaded() {
        //     const count = this.total - this.remain;
        //     return count.toFixed(2);
        // },
        // progress() {
        //     return this.getProgress(this.loaded, this.total);
        // },
        unit() {
            return stowageStatusMap[this.goods.stowageStatus] || '';
        },
        total() {
            return this.goods.stowageStatus == '2' ? this.goods.number : this.goods.weight;
        },
    },
    methods: {
        getProgress(complete = 0, total = 0) {
            if (!total) return '0%';
            return `${((complete / total) * 100).toFixed(2)}%` || '0%';
        },
        hanldeOperate({ command }) {
            const map = {
                increment: () => {
                    // 文档暂无「品名」，增量弹窗标题沿用货源名称 orderName
                    const { stowageStatus } = this.goods;
                    const { orderName, code } = this.info;
                    const { total, unit } = this;
                    uni.$emit('pages/goods/index:showIncrementModal', { total, unit, goodsName: orderName, stowageStatus, code });
                },
                // @by oh-my-zerone 服务商入口已按设计稿从 UI 移除，方法暂保留备查
                selectPartner: () => {
                    // 不确定：新 status 下进入服务商列表默认 tab 是否仍按「待审核=1」
                    // 旧逻辑：已接单/运输中定位「已通过」tab=2
                    // const isApproved = [ORDER_STATUS.???].includes(this.orderStatus);
                    const tab = '1';
                    const url = `/pages_supplier/listSupplier/index?orderCode=${this.info.code}&tab=${tab}`;
                    uni.navigateTo({ url });
                },
                // @by oh-my-zerone 取消货源 = 下架，统一走上下架接口
                cancelGoods: () => {
                    this.handleLoadAndUnloading(ORDER_STATUS.OFF_SHELF, '点击确定,取消货源');
                },
                // 不确定：新 status 是否仍有「确认完成」入口（原 RECEIVE/EXECUTING）
                confirmComplete: () => {
                    console.log('确认完成', { ...this.info });
                    uni.showModal({
                        title: '提示',
                        content: '点击确定,完成货源',
                        showCancel: true,
                        success: ({ confirm, cancel }) => {
                            if (cancel) return;
                            this.confirmComplete();
                        },
                    });
                },
                // @by oh-my-zerone 重新发布 = 上架，统一走上下架接口
                reRelease: () => {
                    this.handleLoadAndUnloading(ORDER_STATUS.PUBLISHED, '点击确定,重新发布货源');
                },
                // @by oh-my-zerone 服务商入口已按设计稿从 UI 移除，方法暂保留备查
                viewPartner: () => {
                    const url = `/pages_supplier/listSupplier/index?orderCode=${this.info.code}&action=view&tab=2`;
                    uni.navigateTo({ url });
                },
            };
            map?.[command]?.();
        },
        /**
         * @by oh-my-zerone 上下架货源（统一对接）
         * 接口：POST /transportation/order/loadAndUnloadingGoods
         * 入参：{ orderCode: 货源单号, status: 状态值（上架/下架） }
         * @param {string|number} status 目标状态：ORDER_STATUS.PUBLISHED(0) 上架 / ORDER_STATUS.OFF_SHELF(1) 下架
         * @param {string} content 二次确认弹窗文案
         */
        handleLoadAndUnloading(status, content) {
            if (!this.info.code) {
                uni.showToast({ title: '缺少货源编码', icon: 'none' });
                return;
            }
            uni.showModal({
                title: '提示',
                content,
                showCancel: true,
                success: async ({ confirm, cancel }) => {
                    if (cancel) return;
                    const payload = {
                        orderCode: this.info.code,
                        status: Number(status),
                    };
                    uni.showLoading({ title: '处理中', mask: true });
                    const [err, res] = await useRequest(ApiLoadAndUnloadingGoods, payload);
                    uni.hideLoading();
                    // @by oh-my-zerone 2026-10-20 成功码兼容 200/1；失败明确提示，避免「点了没反应、列表也不刷新」
                    if (err) {
                        console.warn('[goods] 上下架失败', err, payload);
                        uni.showToast({ title: typeof err === 'string' ? err : '操作失败', icon: 'none' });
                        return;
                    }
                    if (res && res.code !== 200 && res.code !== 1) {
                        uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
                        return;
                    }
                    uni.showToast({ title: '操作成功', icon: 'success' });
                    // 刷新列表：CardInfo 透传给 pages/goods/index.vue 的 refresh
                    this.$emit('refresh');
                },
            });
        },
        /**
         * @by oh-my-zerone 「确认完成」旧逻辑，当前无 UI 入口
         * 注意：上下架接口仅处理上架/下架，此处传 status=COMPLETED(3) 语义存疑，待产品确认后再启用
         */
        async confirmComplete() {
            const payload = {
                orderCode: this.info.code,
                status: Number(ORDER_STATUS.COMPLETED),
                // executionStatus: 'COMPLETED',
            };
            const [err, res] = await useRequest(ApiLoadAndUnloadingGoods, payload);
            if (err) return;
            uni.showToast({ title: '操作成功', icon: 'success' });
            this.$emit('refresh');
        },
        async handleConfirmIncrement(increment) {
            if (!increment) return;
            const key = this.goods.stowageStatus == '2' ? 'number' : 'weight';
            const payload = {
                code: this.info.code,
                [key]: increment,
            };
            const [err, res] = await useRequest(ApiIncrementDkOrderStowage, payload);
            if (err) return;
            uni.showToast({ title: '操作成功', icon: 'success' });
            this.$emit('refresh');
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
.operate-row {
    display: flex;
    align-items: center;
    .left {
        flex: 1;
        min-width: 0;
        display: flex;
        margin-right: 10rpx;

        .desc {
            flex: 1;
            min-width: 0;
            margin-left: 16rpx;
            font-size: 24rpx;
            color: #999;
        }

        /* 旧 RECEIVE / EXECUTING 进度条布局，暂保留样式备查 */
        &.RECEIVE,
        &.EXECUTING {
            .desc {
                flex: initial;
            }
            .progress-line-box {
                margin: 0 8rpx;
                flex: 1;
                min-width: 0;
                display: flex;
                align-items: center;
            }
        }
    }
    .right {
        margin-left: auto;
        display: flex;
        align-items: center;
        @include flex-gap(16rpx);
    }
}
</style>
