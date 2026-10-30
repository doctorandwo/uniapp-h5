<template>
    <view class="phone-login">
        <view class="header">
            <view class="header-title" @click="$emit('back')">
                <image class="header-title__icon" :src="IMAGES.back"></image>
                <text class="header-title__text">手机号登录</text>
            </view>
            <view class="header-right" @click="modeChange">
                <span class="header-right__text">{{ modeView }}</span>
            </view>
        </view>

        <view class="form">
            <CInput placeholder="请输入手机号" type="number" v-model="form.phone" :maxlength="11" @validate="cb => cb(rules.phone(form.phone))" ref="phoneInput">
                <image slot="prefix" :src="IMAGES.phone" class="icon-prefix" />
            </CInput>
            <CInput
                placeholder="请输入密码"
                :type="passwordOpt.type"
                v-if="mode === 'password'"
                v-model="form.password"
                @validate="cb => cb(rules.password(form.password))"
                ref="passwordInput"
            >
                <image slot="prefix" :src="IMAGES.password" class="icon-prefix" />
                <image slot="suffix" :src="passwordOpt.icon" class="icon-suffix" @click="visiblePassword = !visiblePassword" />
            </CInput>
            <view class="input-captch-wrap" v-if="mode === 'captcha'">
                <CInput
                    placeholder="请输入验证码"
                    type="number"
                    class="captcha-input"
                    v-model="form.captcha"
                    :maxlength="6"
                    @validate="cb => cb(rules.captcha(form.captcha))"
                    ref="captchaInput"
                >
                    <image slot="prefix" :src="IMAGES.captcha" class="icon-prefix" />
                </CInput>
                <view class="btn-get-captcha" :class="{ disabled: lockCaptcha }" @click="handleGetCaptcha"> {{ btnCaptchView }} </view>
            </view>

            <z1-button type="primary" @click="handleLogin">登录</z1-button>
        </view>
    </view>
</template>

<script>
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { IMAGES } from '../../constants';
import CInput from '../../components/CInput.vue';
import { ApiSendSms, ApiCheckCaptcha, ApiSmsLogin, ApiGetPublicKey, ApiPwdLogin } from '@/pages_login/service';
import { doSM2Encrypt } from '@/pages_login/crypto.js';

export default {
    components: { CInput },
    props: {
        isAgreement: Boolean,
        appName: String,
    },
    data() {
        return {
            IMAGES,
            form: {
                phone: void 0,
            },
            visiblePassword: false,
            mode: 'password',

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
                password: value => {
                    if (!value) return '请输入密码';
                    if (value.length < 6) return '密码长度不能少于6位';
                },
                captcha: value => {
                    if (!value) return '请输入验证码';
                    if (value.length !== 6) return '验证码长度为6位';
                },
            },
        };
    },
    computed: {
        passwordOpt() {
            return this.visiblePassword ? { type: 'text', icon: IMAGES.show } : { type: 'password', icon: IMAGES.hide };
        },
        modeView() {
            return this.mode === 'password' ? '验证码登录' : '密码登录';
        },
        btnCaptchView() {
            return this.countdown > 0 ? `${this.countdown}秒后重新获取` : '获取验证码';
        },
    },
    mounted() {
        if (uni.getStorageSync('AccountLogin')) {
            this.form.phone = uni.getStorageSync('AccountLogin');
        }
    },
    methods: {
        modeChange() {
            const vMap = { password: 'captcha', captcha: 'password' };
            this.mode = vMap[this.mode];
        },
        async handleGetCaptcha() {
            if (this.$refs.phoneInput.updateError()) return;

            if (this.lockCaptcha) return;
            uni.$z1.showLoading();
            const [err, res] = await useRequest(ApiSendSms, { telno: this.form.phone, type: 'login' }, true);
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
            this.countdown = 60;
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
        validateFront() {
            const { phoneInput, passwordInput, captchaInput } = this.$refs;
            const funcMap = {
                password: () => !phoneInput.updateError() && !passwordInput.updateError(),
                captcha: () => !phoneInput.updateError() && !captchaInput.updateError(),
            };
            return funcMap[this.mode]();
        },
        // 检查协议
        checkAgreement() {
            const content = `是否同意《${this.appName}用户协议》与《${this.appName}隐私政策》？`;
            const success = res => {
                if (!res.confirm) return;
                this.$emit('agreement');
                this.$nextTick(() => this.handleLogin());
            };
            uni.showModal({ title: '提示', content, success });
        },
        // 校验验证码(后端)
        async validateCaptcha() {
            const { phone, captcha } = this.form;
            const [err, res] = await useRequest(ApiCheckCaptcha, { telno: phone, captcha: captcha, type: 'login' });
            if (err) return;
            return true;
        },
        async handleLogin() {
            console.log(this.form);
            if (!this.isAgreement) {
                this.checkAgreement();
                return;
            }
            const isOkFront = this.validateFront();
            if (!isOkFront) {
                console.error('前端验证失败');
                return;
            }
            const loginFunc = {
                password: async () => this.passwordLogin(),
                captcha: async () => this.captchaLogin(),
            };
            uni.showLoading({ title: '登录中...', mask: true });
            const { Authorization, expires_in } = (await loginFunc[this.mode]()) || {};
            if (!Authorization) {
                setTimeout(() => uni.hideLoading(), 1500);
                return;
            }
            uni.hideLoading();
            this.loginSuccessed(Authorization, expires_in);
        },
        async passwordLogin() {
            const [err1, { data: publicKeyStr }] = await useRequest(ApiGetPublicKey);
            if (err1) {
                console.error('获取公钥失败');
                return;
            }
            const { phone, password } = this.form;
            const payload = { publicKeyStr, telno: phone, password: doSM2Encrypt(password, publicKeyStr) };
            const [err2, res] = await useRequest(ApiPwdLogin, payload);
            if (err2) return;
            const { access_token, expires_in } = res.data;
            return { Authorization: access_token, expires_in };
        },
        async captchaLogin() {
            const isOkCaptcha = await this.validateCaptcha();
            if (!isOkCaptcha) return;
            const { phone, captcha } = this.form;
            const [err, res] = await useRequest(ApiSmsLogin, { telno: phone, captcha, type: 'login' });
            if (err) return;
            const { access_token, expires_in } = res.data;
            return { Authorization: access_token, expires_in };
        },
        // 登录成功
        async loginSuccessed(token, expires_in) {
            uni.setStorageSync('AccountLogin', this.form.phone);
            uni.showToast({ title: '登录成功', icon: 'none' });
            // 1.存储token
            this.$store.commit('UPDATE_TOEKN', token);
            // 2. 拉取用户数据（用户信息，按钮权限等等）
            uni.showLoading({ title: '加载用户信息...', mask: true });
            const isOk = await this.$store.dispatch('GetInfo');
            if (!isOk) {
                setTimeout(() => uni.hideLoading(), 1500);
                return;
            }
            uni.hideLoading();
            uni.useJsBridge('showFloatingTip'); // 显示原生的悬浮按钮
            // 3.跳转对应页面
            this.$store.dispatch('SwitchTabbar', '/pages/home/index');
            console.log('登录成功', token, expires_in);
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

.phone-login {
    .header {
        display: flex;
        margin-bottom: 30rpx;
        &-title {
            display: flex;
            align-items: center;
            @include flex-gap(20rpx);
            &__icon {
                width: 17rpx;
                height: 29rpx;
            }
            &__text {
                font-size: 32rpx;
                font-weight: bold;
            }
        }
        &-right {
            margin-left: auto;
            &__text {
                font-size: 28rpx;
                color: $uni-color-primary;
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
