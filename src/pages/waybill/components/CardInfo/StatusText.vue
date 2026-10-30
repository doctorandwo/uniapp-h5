<template>
    <view class="status-text" :style="{ '--color': color }">
        <view class="text">{{ text }}</view>
    </view>
</template>

<script>
// const
import { STATUS_WAYBILL_MAP } from '@/pages/waybill/constants.js';

/**
 * @by oh-my-zerone 2026-10-16
 */

export default {
    props: {
        status: {
            type: [String, Number],
            default: '',
        },
        // @by oh-my-zerone 2026-10-27 卡片可覆盖状态文案/色值
        label: {
            type: String,
            default: '',
        },
        tone: {
            type: String,
            default: '',
        },
        //是否异常单
        isAbnormal:{
            type: [String, Number],
            default: '0',
        }
    },
    data() {
        return {};
    },
    computed: {
        text() {
            return this.label || STATUS_WAYBILL_MAP[this.status]?.label || '';
        },
        color() {
            return this.tone || STATUS_WAYBILL_MAP[this.status]?.color || '';
        },
    },
};
</script>

<style lang="scss" scoped>
.status-text {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--color);
    font-size: 26rpx;
    font-weight: bold;
}
</style>
