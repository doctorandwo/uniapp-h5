<template>
    <view class="password-set">
        <view class="header">
            <view class="header-title">
                <text class="header-title__text">{{ title }}</text>
            </view>
        </view>

        <view class="form">
            <CInput placeholder="请输入用户名" v-model="form.userName" @validate="cb => cb(rules.userName(form.userName))" ref="userNameInput">
                <image slot="prefix" :src="IMAGES.userName" class="icon-prefix" />
            </CInput>
            <CInput placeholder="请输入密码" :type="passwordOpt.type" v-model="form.password" @validate="cb => cb(rules.password(form.password))" ref="passwordInput">
                <image slot="prefix" :src="IMAGES.password" class="icon-prefix" />
                <image slot="suffix" :src="passwordOpt.icon" class="icon-suffix" @click="visiblePassword = !visiblePassword" />
            </CInput>
            <CInput
                placeholder="请再次输入密码"
                :type="passwordAgainOpt.type"
                v-model="form.passwordAgain"
                @validate="cb => cb(rules.passwordAgain(form.passwordAgain))"
                ref="passwordAgainInput"
            >
                <image slot="prefix" :src="IMAGES.password" class="icon-prefix" />
                <image slot="suffix" :src="passwordAgainOpt.icon" class="icon-suffix" @click="visiblePasswordAgain = !visiblePasswordAgain" />
            </CInput>

            <z1-button style="margin-top: 40rpx" type="primary" @click="submit">确认</z1-button>
        </view>
    </view>
</template>

<script>
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { IMAGES } from '../../constants';
import CInput from '../../components/CInput.vue';
import { ApiGetPublicKey, ApiRegister } from '@/pages_login/service';

import { T_RegisterForm } from './model.js';
import { Schema } from '@zerone/toolbox/src/schema';

export default {
    components: { CInput },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            IMAGES,
            form: {},

            visiblePassword: false,
            visiblePasswordAgain: false,

            rules: {
                userName: value => {
                    if (!value) return '请输入用户名';
                    // if (value.length < 6 || value.length > 20) return '用户名必须是6到20位';
                    /* const regex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
                    if (!regex.test(value)) return '必须以字母开头,且包含字母、数字和下划线'; */
                },
                password: value => {
                    if (!value) return '请输入密码';
                    if (value.length < 6 || value.length > 20) return '登录密码必须是6到20位';
                    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).*/;
                    if (!regex.test(value)) return '密码必须包含字母、数字和特殊字符';
                },
                passwordAgain: value => {
                    if (!value) return '请输入密码';
                    if (value !== this.form.password) return '两次输入的密码不一致';
                },
            },
        };
    },
    computed: {
        passwordOpt() {
            return this.visiblePassword ? { type: 'text', icon: IMAGES.show } : { type: 'password', icon: IMAGES.hide };
        },
        passwordAgainOpt() {
            return this.visiblePasswordAgain ? { type: 'text', icon: IMAGES.show } : { type: 'password', icon: IMAGES.hide };
        },
        title() {
            const map = {
                register: '设置密码',
                reset: '修改密码',
            };
            return map[this.options?.type] || '';
        },
    },

    methods: {
        // 前端验证
        validateFront(mode) {
            const { passwordInput, passwordAgainInput, userNameInput } = this.$refs;
            const funcMap = {
                setPassword: () => !userNameInput.updateError() && !passwordInput.updateError() && !passwordAgainInput.updateError(),
            };
            return funcMap[mode]();
        },
        async submit() {
            const isOkFront = this.validateFront('setPassword');
            if (!isOkFront) {
                console.error('前端验证失败');
                return;
            }
            console.log('提交表单');
            const isOk = await this.registryForm();
            if (!isOk) return;
            this.registerSuccessed();
        },
        async registryForm() {
            const [err1, { data: publicKeyStr }] = await useRequest(ApiGetPublicKey);
            if (err1) {
                console.error('获取公钥失败');
                return;
            }
            const { password, userName } = this.form;
            const { phone, captcha } = this.options;

            const payload = new Schema(T_RegisterForm).parse({ userName, publicKeyStr, password, phone, captcha });

            console.log('payload', payload);
            const [err, res] = await useRequest(ApiRegister, payload);
            if (err) {
                uni.showModal({ title: '提示', content: res.data.msg, showCancel: false });
                return;
            }
            return true;
        },
        registerSuccessed() {
            uni.showModal({
                title: '注册成功',
                content: '恭喜注册成功！立即登录？',
                showCancel: true,
                cancelText: '返回首页',
                confirmText: '立即登录',
                success: res => {
                    res.confirm && this.$emit('toLogin');
                    res.cancel && this.$store.dispatch('BackHome');
                },
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

.password-set {
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
