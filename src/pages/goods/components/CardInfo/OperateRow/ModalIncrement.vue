<template>
    <z1-modal :show="visible" title="增量确认" @close="close" @confirm="handleConfirm">
        <view class="content" slot="content">
            <view class="row">
                <view class="row-label">货物信息</view>
                <view class="row-value txt g-single-row">
                    <span>{{ goodsName }}</span>
                </view>
            </view>
            <view class="row">
                <view class="row-label">当前量</view>
                <view class="row-value txt">
                    <span>{{ current }} {{ unit }}</span>
                </view>
            </view>
            <view class="row">
                <view class="row-label">增量</view>
                <view class="row-value">
                    <input type="digit" v-model="increment" placeholder="请输入" style="text-align: right" @blur="handleBlur" />
                    <span class="unit">| {{ unit }}</span>
                </view>
            </view>
        </view>
    </z1-modal>
</template>

<script>
export default {
    name: 'ModalIncrement',

    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        current: {
            type: Number,
            default: 0,
        },
        goodsName: {
            type: String,
            default: '',
        },
        unit: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            increment: void 0,
        };
    },
    methods: {
        close() {
            this.increment = void 0;
            this.$emit('update:visible', false);
            this.$emit('close');
        },
        handleConfirm() {
            this.$emit('confirm', this.increment);
        },
        // true: 值为空且不为0
        isEmpytNotZero(val) {
            return val !== 0 && !val;
        },
        handleBlur() {
            if (this.isEmpytNotZero(this.increment)) {
                this.increment = void 0;
                return;
            }
            this.increment = Number(this.increment)
                .toFixed(2)
                .replace(/\.?0+$/, '');
        },
    },
};
</script>
<style lang="scss" scoped>
.content {
    min-height: 200rpx;
    padding-top: 20rpx;
    padding-bottom: 30rpx;

    .row {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        margin-bottom: 40rpx;

        &:last-child {
            margin-bottom: 0;
        }

        &-label {
            width: 140rpx;
            margin-right: 20rpx;
            font-weight: bold;
            text-align: left;
        }
        &-value {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            color: #999;
            font-size: 30rpx;

            .unit {
                flex-shrink: 0;
                font-weight: bold;
                color: #333;
                margin-left: 10rpx;
            }
        }
    }
}
</style>
