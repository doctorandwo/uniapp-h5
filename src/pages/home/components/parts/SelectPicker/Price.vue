<template>
    <view class="price-picker">
        <view class="custom-input">
            <view class="custom-input__title">自定义价格区间</view>
            <view class="custom-input__content">
                <input class="input-min" placeholder="自定义最低价" type="number" v-model="min" @blur="format('min')" />
                <view class="icon-divider">-</view>
                <input class="input-max" placeholder="自定义最高价" type="number" v-model="max" @blur="format('max')" />
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        current: {
            type: [String, Number],
            default: () => '',
        },
    },

    data() {
        return {
            min: void 0,
            max: void 0,
        };
    },
    mounted() {
        this.initMinMax();
    },
    methods: {
        initMinMax() {
            console.log('initMinMax==', this.current);
            if (!this.current) {
                this.min = this.max = void 0;
                return;
            }
            const [min, max] = this.current.split('-');
            this.min = min;
            this.max = max;
        },
        getPrice() {
            const { isEmpytNotZero, min = '', max = '' } = this;

            // 同时为空，则返回空字符串
            if (isEmpytNotZero(min) && isEmpytNotZero(max)) return '';

            // 有一个为空，则不校验
            if (isEmpytNotZero(min)) return `${max}以下`;
            if (isEmpytNotZero(max)) return `${min}以上`;

            if (Number(min) > Number(max)) {
                return { errMsg: '最低价不能大于最高价' };
            }
            return `${min}-${max}`;
        },
        // true: 值为空且不为0
        isEmpytNotZero(val) {
            return val !== 0 && !val;
        },
        reset() {
            this.$emit('update:current', '');
            this.min = this.max = void 0;
        },
        format(prop) {
            if (this.isEmpytNotZero(this[prop])) {
                this[prop] = void 0;
                return;
            }
            this[prop] = Number(this[prop])
                .toFixed(2)
                .replace(/\.?0+$/, '');
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
.price-picker {
    padding: 20rpx 32rpx;
    .custom-input {
        &__title {
            font-weight: bold;
            font-size: 28rpx;
            color: #333;
            margin-bottom: 20rpx;
        }
        &__content {
            display: flex;
            align-items: center;
            @include flex-gap(27rpx);
            .input-min,
            .input-max {
                flex: 1;
            }
            .icon-divider {
                font-size: 32rpx;
                font-weight: bold;
            }
        }
    }
}
</style>
