<template>
    <view class="reset-password-form">
        <view class="header">
            <view class="header-title">
                <text class="header-title__text">修改密码</text>
            </view>
        </view>

        <view class="form">
            <!-- 手机号（只读、打码） -->
            <CInput :value="displayTelno" readonly>
                <image slot="prefix" :src="IMAGES.phone" class="icon-prefix" />
            </CInput>

            <!-- 验证码 + 获取按钮 -->
            <view class="captcha-row">
                <view class="captcha-input">
                    <CInput placeholder="请输入验证码" type="number" :maxlength="6" v-model="form.captcha" :err-msg="errors.captcha" @blur="onFieldBlur('captcha')">
                        <image slot="prefix" :src="IMAGES.captcha" class="icon-prefix" />
                    </CInput>
                </view>
                <view class="btn-get-captcha" :class="{ disabled: isCaptchaDisabled }" @click="onSendCaptcha">
                    {{ captchaButtonText }}
                </view>
            </view>

            <!-- 新密码 -->
            <CInput placeholder="请输入新密码" :type="passwordOpt.type" v-model="form.password" :err-msg="errors.password" @blur="onFieldBlur('password')">
                <image slot="prefix" :src="IMAGES.password" class="icon-prefix" />
                <image slot="suffix" :src="passwordOpt.icon" class="icon-suffix" @click="showPassword = !showPassword" />
            </CInput>

            <!-- 确认新密码 -->
            <CInput placeholder="请再次输入新密码" :type="passwordAgainOpt.type" v-model="form.passwordAgain" :err-msg="errors.passwordAgain" @blur="onFieldBlur('passwordAgain')">
                <image slot="prefix" :src="IMAGES.password" class="icon-prefix" />
                <image slot="suffix" :src="passwordAgainOpt.icon" class="icon-suffix" @click="showPasswordAgain = !showPasswordAgain" />
            </CInput>

            <z1-button style="margin-top: 40rpx" type="primary" :disabled="state.submitting" @click="onSubmit">{{ submitButtonText }}</z1-button>
        </view>
    </view>
</template>

<script>
import CInput from '@/pages_login/components/CInput.vue';
import { IMAGES } from '@/pages_login/constants';
import { maskTelno, FIELD_VALIDATORS } from './rules';
import { SUBMIT_FIELDS } from './constants';

/**
 * @file ResetPasswordForm.vue  修改密码表单（纯视图层）
 *
 * 跨端约束（微信小程序）：
 *  - 小程序端 props 数据通道会做 JSON 序列化，函数成员会被剥离，
 *    因此本组件不接收「函数集合 actions」prop；行为统一通过 $emit 事件上抛：
 *      send-captcha（获取验证码） / submit（提交，载荷为可序列化的表单值）；
 *  - 表单字段值由此处本地持有（小程序端跨组件回写对象 props 不可靠），
 *    校验直接复用 rules.js 的纯函数（FIELD_VALIDATORS / SUBMIT_FIELDS）；
 *    本组件不写业务判定分支，仅保留 state.submitting 一类的交互并发守卫；
 *  - 校验错误文案经 CInput 新增的受控 err-msg prop 下发展示，
 *    不再依赖「@validate 事件携带回调函数」的跨端不可靠桥接。
 *
 * 展示态派生（打码手机号、按钮文案/禁用态）收敛到 computed，模板只做绑定；
 * maskTelno 是纯格式化函数，直接从 rules.js 引用，不绕经编排层。
 */
export default {
    name: 'ResetPasswordForm',
    components: { CInput },
    props: {
        /** 手机号明文，由页面从 vuex 注入，本组件只负责打码展示并随提交事件上抛 */
        telno: { type: String, default: '' },
        /** hook 暴露的流程状态（loading / submitting / countdown，仅纯数据） */
        state: { type: Object, required: true },
    },
    data() {
        return {
            IMAGES,
            showPassword: false,
            showPasswordAgain: false,
            /** 可编辑字段的本地值 */
            form: {
                captcha: '',
                password: '',
                passwordAgain: '',
            },
            /** 字段错误文案（本地持有，经 err-msg 下发 CInput 展示） */
            errors: {
                captcha: '',
                password: '',
                passwordAgain: '',
            },
        };
    },
    computed: {
        /** 打码后的手机号，如 138****8888 */
        displayTelno() {
            return maskTelno(this.telno);
        },
        /** 冷却中或验证码发送中时禁用获取按钮 */
        isCaptchaDisabled() {
            return this.state.countdown > 0 || this.state.loading;
        },
        /** 获取验证码按钮文案 */
        captchaButtonText() {
            return this.state.countdown > 0 ? `${this.state.countdown}秒后重新获取` : '获取验证码';
        },
        /** 提交按钮文案 */
        submitButtonText() {
            return this.state.submitting ? '提交中...' : '确认';
        },
        /** 新密码框的 type 与眼睛图标 */
        passwordOpt() {
            return this.showPassword ? { type: 'text', icon: IMAGES.show } : { type: 'password', icon: IMAGES.hide };
        },
        /** 确认密码框的 type 与眼睛图标 */
        passwordAgainOpt() {
            return this.showPasswordAgain ? { type: 'text', icon: IMAGES.show } : { type: 'password', icon: IMAGES.hide };
        },
    },
    methods: {
        /**
         * 用纯规则校验单字段，并把错误文案写入本地 errors
         * 规则缺失时视为通过
         * @param {'captcha'|'password'|'passwordAgain'} field 字段名
         * @returns {string} 空串表示通过，否则为错误文案
         */
        validateField(field) {
            const validator = FIELD_VALIDATORS[field];
            const msg = validator ? validator(this.form) : '';
            this.errors[field] = msg || '';
            return this.errors[field];
        },
        /**
         * 输入框失焦：校验当前字段并展示错误
         * @param {'captcha'|'password'|'passwordAgain'} field 字段名
         * @returns {void}
         */
        onFieldBlur(field) {
            this.validateField(field);
        },
        /**
         * 点击「获取验证码」：上抛事件，由页面接线到编排层 sendCaptcha
         * @returns {void}
         */
        onSendCaptcha() {
            this.$emit('send-captcha');
        },
        /**
         * 点击提交：全字段本地校验通过后，以可序列化载荷上抛 submit 事件
         * @returns {void}
         */
        onSubmit() {
            if (this.state.submitting) return;
            const valid = SUBMIT_FIELDS.every(field => !this.validateField(field));
            if (!valid) return;
            this.$emit('submit', {
                telno: this.telno,
                captcha: this.form.captcha,
                password: this.form.password,
                passwordAgain: this.form.passwordAgain,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.icon-prefix {
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
}
.icon-suffix {
    width: 28rpx;
    height: 28rpx;
    margin-left: 30rpx;
}

.reset-password-form {
    .header {
        display: flex;
        justify-content: center;
        margin-bottom: 60rpx;
        &-title {
            &__text {
                font-size: 38rpx;
                font-weight: bold;
            }
        }
    }
    .form {
        display: flex;
        flex-direction: column;
        @include flex-gap(10rpx, column);

        .captcha-row {
            display: flex;
            align-items: flex-start;
            @include flex-gap(20rpx);
            .captcha-input {
                flex: 1;
                min-width: 0;
            }
            .btn-get-captcha {
                width: max-content;
                padding: 20rpx 20rpx;
                background-color: $uni-color-primary;
                color: #fff;
                font-size: 28rpx;
                border-radius: 10rpx;
                &.disabled {
                    background-color: #ccc;
                }
            }
        }
    }
}
</style>
