<template>
    <view class="select-picker">
        <view class="top-view" :class="{ active: isShowPicker }" @click="showPicker">
            <view :class="{ 'has-value': _value }">{{ value_view }}</view>
            <view class="triangle"></view>
        </view>
        <view class="picker-dropdown" v-show="isShowPicker" :style="{ '--top': dropdownTop + 'px' }">
            <view class="mask" @click="hidePicker"></view>
            <view class="body">
                <view class="content" :style="{ 'background-color': bgColor }">
                    <List :current.sync="current" :list="list" :label-key="labelKey" :value-key="valueKey" :max-height="maxHeight" v-if="type === 'list'" ref="ListRef" />
                    <Price :current.sync="current" v-if="type === 'price'" ref="PriceRef" />
                </view>
                <view class="operate">
                    <view class="btn info" @click="reset">重置</view>
                    <view class="btn primary" @click="confirm">确定</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import List from './List.vue';
import Price from './Price.vue';

export default {
    components: { List, Price },
    props: {
        placeholder: {
            type: String,
            default: '请选择',
        },
        type: {
            type: String,
            default: () => 'list',
            validator: value => ['list', 'price'].includes(value),
        },
        // 内容区域的背景色
        bgColor: {
            type: String,
            default: () => '#fff',
        },
        // 下拉框距离顶部的距离
        dropdownTop: {
            type: [String, Number],
            default: () => 0,
        },
        value: {
            type: [String, Number],
            default: () => '',
        },
        refName: {
            type: String,
            default: () => '',
        },
        /* LIST */
        list: {
            type: Array,
            default: () => [],
        },
        labelKey: {
            type: String,
            default: 'label',
        },
        valueKey: {
            type: String,
            default: 'value',
        },

        maxHeight: {
            type: String,
            default: () => '400rpx',
        },
    },
    computed: {
        _value: {
            get() {
                return this.value;
            },
            set(v) {
                this.$emit('input', v);
            },
        },
        list_value_view() {
            const list = this.$attrs?.list;
            return list && list.find(item => item.value === this._value)?.label;
        },
        price_value_view() {
            return this.current;
        },
        value_view() {
            if (this.type == 'list') {
                return this.list_value_view || this.placeholder;
            } else if (this.type == 'price') {
                return this.price_value_view || this.placeholder;
            }
            return '';
        },
    },
    data() {
        return {
            isShowPicker: false,
            current: '',
            // dropdownTop: 0,
        };
    },
    methods: {
        setPickerDropdownTop() {
            this.$nextTick(() => {
                // 获取吸顶区域的元素
                const query = uni.createSelectorQuery().in(this);
                query
                    .select('.top-view')
                    .boundingClientRect(data => {
                        console.log('top-view', data);
                        this.dropdownTop = data.bottom;
                    })
                    .exec();
            });
        },
        showPicker() {
            this.$emit('showPicker', this.refName);
            this.current = this._value;

            setTimeout(() => {
                this.isShowPicker = true;
            }, 300);
        },
        hidePicker() {
            this.isShowPicker = false;
        },
        confirm() {
            if (this.type == 'list') this._value = this.current;
            else if (this.type == 'price') {
                const price = this.$refs.PriceRef.getPrice();
                if (price?.errMsg) return uni.showToast({ title: price.errMsg, icon: 'none' });

                this.current = price;
                this._value = price;
            }
            this.$emit('confirm');
            this.isShowPicker = false;
        },
        reset() {
            this.current = '';
            this._value = '';
            if (this.type == 'price') this.$refs?.PriceRef?.reset();
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

// 倒三角
.triangle {
    $w: 18rpx;
    $h: 11rpx;
    $color: #333333;
    width: 0;
    height: 0;
    border-top: $h solid $color;
    border-right: calc(#{$w} / 2) solid transparent;
    border-left: calc(#{$w} / 2) solid transparent;
    transform: rotate(0deg);
    transition: transform 0.3s ease;
    border-radius: 6rpx 6rpx 0 0;
}

.select-picker {
    .top-view {
        display: flex;
        align-items: center;
        @include flex-gap(12rpx);
        font-size: 26rpx;

        .has-value {
            color: #3a65ff;
        }

        &.active {
            color: #3a65ff;
            .triangle {
                border-top-color: #3a65ff;
                transform: rotate(180deg);
            }
        }
    }
    .picker-dropdown {
        position: fixed;
        z-index: 10;
        top: calc(var(--top));
        left: 0;
        right: 0;
        bottom: 0;

        .mask {
            background: rgba(0, 0, 0, 0.5);
            transition: all 0.2s ease 0s;
            height: calc(100vh - 100rpx);
        }
        .body {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            border-radius: 0px 0px 20rpx 20rpx;
            background-color: #fff;

            .content {
                min-height: 300rpx;
            }

            .operate {
                background-color: #fff;
                display: flex;
                padding: 22rpx 32rpx 32rpx;
                @include flex-gap(30rpx);
                .btn {
                    padding: 18rpx 132rpx;
                    font-weight: bold;
                    font-size: 32rpx;
                    border-radius: 10rpx;
                    &.info {
                        background-color: #f6f6f6;
                        color: #333;
                    }
                    &.primary {
                        background-color: #3a65ff;
                        color: #fff;
                    }
                }
            }
        }
    }
}
</style>
