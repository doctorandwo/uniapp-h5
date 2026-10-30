<template>
    <view class="phone-validate">
        <view class="header">
            <view class="header-title">
                <text class="header-title__text">手机号验证</text>
            </view>
        </view>

        <view class="form">
            <CInput placeholder="请输入手机号" type="number" v-model="form.phone" @validate="cb => cb(rules.phone(form.phone))" ref="phoneInput">
                <image slot="prefix" :src="IMAGES.phone" class="icon-prefix" />
            </CInput>
            <view class="input-captch-wrap">
                <CInput placeholder="请输入验证码" type="number" class="captcha-input" v-model="form.captcha" @validate="cb => cb(rules.captcha(form.captcha))" ref="captchaInput">
                    <image slot="prefix" :src="IMAGES.captcha" class="icon-prefix" />
                </CInput>
                <view class="btn-get-captcha" :class="{ disabled: lockCaptcha }" @click="handleGetCaptcha"> {{ btnCaptchView }} </view>
            </view>

            <z1-button style="margin-top: 40rpx" type="primary" @click="nextStep">下一步</z1-button>
        </view>
    </view>
</template>

<script>
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { IMAGES } from '../../constants';
import CInput from '../../components/CInput.vue';
import { ApiSendSms, ApiCheckCaptcha } from '@/pages_login/service';

const COUNTDOWN = 60; // 验证码倒计时

export default {
    components: { CInput },
    props: {},
    data() {
        return {
            IMAGES,
            form: {},

            // 验证码
            countdown: 0,
            timer: null,
            lockCaptcha: false, // 验证码锁

            rules: {
                phone: value => {
                    if (!value) return '请输入手机号';
                    const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
                    if (!phoneReg.test(value)) return '请输入正确的手机号';
                },
                captcha: value => {
                    if (!value) return '请输入验证码';
                    if (value.length !== 6) return '验证码长度为6位';
                },
            },
        };
    },
    computed: {
        btnCaptchView() {
            return this.countdown > 0 ? `${this.countdown}秒后重新获取` : '获取验证码';
        },
    },
    mounted() {},
    methods: {
        async handleGetCaptcha() {
            if (this.$refs.phoneInput.updateError()) return;

            if (this.lockCaptcha) return;
            uni.$z1.showLoading();
            const [err, res] = await useRequest(ApiSendSms, { telno: this.form.phone, type: 'register' }, true);
            uni.$z1.closeLoading();
            if (err) {
                if (res) uni.showModal({ title: '提示', content: res, showCancel: false });
                return;
            }
            uni.showToast({ title: res?.msg || '验证码发送成功', icon: 'none' });
            this.startCountdown();
        },
        //  验证码倒计时
        startCountdown() {
            if (this.timer) return;
            this.lockCaptcha = true;
            this.countdown = COUNTDOWN;
            this.timer = setInterval(() => {
                this.countdown > 0 && this.countdown--;
                if (this.countdown === 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                    this.countdown = 0;
                    this.lockCaptcha = false;
                }
            }, 1000);
        },
        // 前端验证
        validateFront(mode) {
            const { phoneInput, captchaInput } = this.$refs;
            const funcMap = {
                captcha: () => !phoneInput.updateError() && !captchaInput.updateError(),
            };
            return funcMap[mode]();
        },
        // 校验验证码(后端)
        async validateCaptcha() {
            const { phone, captcha } = this.form;
            const [err, res] = await useRequest(ApiCheckCaptcha, { telno: phone, captcha: captcha, type: 'register' });
            if (err) return;
            return true;
        },

        async nextStep() {
            if (!this.validateFront('captcha')) return;
            const isOkCaptcha = await this.validateCaptcha();
            if (!isOkCaptcha) return;
            // 跳转到下一步,设置密码
            const url = '/pages_login/register/setPassword/index?phone=' + this.form.phone + '&captcha=' + this.form.captcha + '&type=register';
            uni.redirectTo({ url });
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

.phone-validate {
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

        .input-captch-wrap {
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
