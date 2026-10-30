<template>
    <view class="c-input">
        <view class="c-input__content" :class="{ focus: isFocused }">
            <slot name="prefix" />
            <!-- 非密码类型：直接使用传入的 type -->
            <input
                v-if="type !== 'password'"
                v-model="_value"
                :type="type"
                :placeholder="placeholder"
                :maxlength="maxlength"
                :readonly="readonly"
                class="c-input__content-input"
                @focus="onFocus"
                @blur="onBlur"
                @input="onInput"
            />
            <!-- 密码类型：固定 type="text" + password 属性，避免 iOS 动态切换清空 -->
            <input
                v-else
                v-model="_value"
                type="text"
                :password="true"
                :placeholder="placeholder"
                :maxlength="maxlength"
                :readonly="readonly"
                class="c-input__content-input"
                @focus="onFocus"
                @blur="onBlur"
                @input="onInput"
            />
            <slot name="suffix" />
        </view>
        <view class="c-input__error">
            {{ displayError }}
        </view>
    </view>
</template>

<script>
export default {
    props: {
        validate: {
            type: [String, Number],
            default: () => '',
        },
        value: {
            type: [String, Number],
            default: '',
        },
        type: {
            type: String,
            default: 'text',
        },
        placeholder: {
            type: String,
            default: '',
        },
        maxlength: {
            type: Number,
            default: 140,
        },
        /**
         * 只读模式：
         *  - true  时渲染层 <input readonly disabled> + 同时禁用 .focus 视觉
         *  - false 默认保持原行为（向后兼容）
         * 修改时间 2026-09-02：用于 resetPassword 页只读展示手机号。
         */
        readonly: {
            type: Boolean,
            default: false,
        },
        /**
         * 外部受控错误文案（优先级高于内部 error）：
         *  - 微信小程序端 props/事件数据通道对函数做 JSON 序列化，@validate 回调入参不可靠，
         *    因此错误文案改为纯字符串 prop 下发，可跨端稳定展示；
         *  - 未传（默认空串）时保持原内部 error 行为，向后兼容。
         */
        errMsg: {
            type: String,
            default: '',
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
        /** 展示用错误文案：优先外部受控 errMsg，其次内部 error */
        displayError() {
            return this.errMsg || this.error;
        },
    },
    data() {
        return {
            isFocused: false,
            error: '',
        };
    },
    methods: {
        onFocus() {
            this.isFocused = true;
            this.$emit('focus', this._value);
        },
        onBlur() {
            this.isFocused = false;
            this.$emit('blur', this._value);
            this.$emit('validate', err => {
                this.error = err || '';
            });
        },
        onInput(e) {
            if (e.target.value.length > this.maxlength) {
                this._value = e.target.value.slice(0, this.maxlength);
            }
            this.$emit('onInput', e.target.value);
        },
        updateError() {
            this.$emit('validate', err => {
                this.error = err || '';
            });
            return this.error;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.c-input {
    display: flex;
    flex-direction: column;
    @include flex-gap(8rpx, column);

    &__content {
        background-color: #f8f8f8;
        display: flex;
        align-items: center;
        border-radius: 10rpx;
        padding: 16rpx 20rpx;
        border: 1rpx solid #f8f8f8;

        &.focus {
            border-color: $uni-color-primary;
        }

        &-input {
            flex: 1;
            min-width: 0;
            border: none;
            outline: none;
            font-size: 16px;
            background-color: transparent;
        }
    }
    &__error {
        color: $uni-color-error;
        font-size: 22rpx;
        min-height: 36rpx;
    }
}
</style>
