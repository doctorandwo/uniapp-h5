<template>
    <uni-popup type="bottom" ref="popup" background-color="#fff" border-radius="32rpx 32rpx 0 0" @maskClick="close">
        <view class="multi-select-picker">
            <view class="picker-header ly-flex ly-flex-align-center ly-flex-pack-justify">
                <text class="picker-title">{{ title }}</text>
                <text class="picker-confirm" @click="onConfirm">确定</text>
            </view>
            <view class="picker-body">
                <view v-if="options.length === 0" class="empty-state">
                    <text class="empty-text">暂无选项</text>
                </view>
                <view v-for="item in options" :key="item.value" class="option-row ly-flex ly-flex-align-center ly-flex-pack-justify" @click="toggle(item)">
                    <text class="option-label">{{ item.label }}</text>
                    <view class="option-check" :class="{ active: isSelected(item) }"></view>
                </view>
            </view>
            <view v-if="tipText" class="picker-tip">{{ tipText }}</view>
        </view>
    </uni-popup>
</template>

<script>
export default {
    name: 'MultiSelectPicker',
    props: {
        visible: { type: Boolean, default: false },
        value: { type: Array, default: () => [] },
        options: {
            type: Array,
            default: () => [],
            validator(value) {
                return value.every(item => item && typeof item.label !== 'undefined' && typeof item.value !== 'undefined');
            },
        },
        title: { type: String, default: '请选择' },
        max: { type: Number, default: 5 },
    },
    data() {
        return {
            innerValue: [],
        };
    },
    computed: {
        tipText() {
            return this.max ? `最多选择 ${this.max} 项` : '';
        },
    },
    watch: {
        visible(val) {
            if (val) {
                this.open();
            } else {
                this.close();
            }
        },
    },
    methods: {
        open() {
            this.innerValue = (this.value || []).slice();
            this.$nextTick(() => {
                this.$refs.popup && this.$refs.popup.open();
            });
        },
        close() {
            this.$emit('update:visible', false);
            this.$nextTick(() => {
                this.$refs.popup && this.$refs.popup.close();
            });
        },
        isSelected(item) {
            return this.innerValue.some(v => v.value === item.value);
        },
        toggle(item) {
            const index = this.innerValue.findIndex(v => v.value === item.value);
            if (index > -1) {
                this.innerValue.splice(index, 1);
            } else {
                if (this.max && this.innerValue.length >= this.max) {
                    uni.showToast({ title: `最多选择 ${this.max} 项`, icon: 'none' });
                    return;
                }
                this.innerValue.push(item);
            }
        },
        onConfirm() {
            this.$emit('input', this.innerValue.slice());
            this.$emit('change', this.innerValue.slice());
            this.close();
        },
    },
};
</script>

<style lang="scss" scoped>
.multi-select-picker {
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));

    .picker-header {
        padding: 28rpx 32rpx;
        border-bottom: 1rpx solid #f5f5f5;
    }

    .picker-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
    }

    .picker-confirm {
        font-size: 30rpx;
        color: #3a65ff;
    }

    .picker-body {
        max-height: 600rpx;
        overflow-y: auto;
    }

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 80rpx 32rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999999;
    }

    .option-row {
        padding: 28rpx 32rpx;
        border-bottom: 1rpx solid #f5f5f5;
    }

    .option-label {
        font-size: 30rpx;
        color: #333333;
    }

    .option-check {
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        border: 2rpx solid #cccccc;

        &.active {
            background: #3a65ff;
            border-color: #3a65ff;
        }
    }

    .picker-tip {
        padding: 16rpx 32rpx;
        font-size: 24rpx;
        color: #999999;
        text-align: center;
    }
}
</style>
