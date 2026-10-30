<template>
    <view class="cu-modal" :class="visible ? 'show' : ''">
        <view class="cu-dialog">
            <view class="size32 text-bold margin-top">账号绑定</view>
            <view class="margin-top-20 text-left">
                系统检测到该微信帐号未绑定手机号信息, 为了保障您后续的功能能够正常使用，请通过手机号快捷认证方式进行绑定手机号，感谢您的配合!
            </view>
            <button class="btn-yes" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">手机号认证绑定</button>
            <view class="text-center text-bold" style="color: #596794" @click="close">使用其他方式登录</view>
        </view>
    </view>
</template>

<script>
import { authPhoneWxLogin } from '../../service.js';
import { getWxLoginCode } from '../wxLogin.js';

export default {
    props: {
        title: {
            type: String,
            default: '',
        },
        open: Boolean,
    },
    computed: {
        visible: {
            get() {
                return this.open;
            },
            set(v) {
                this.$emit('update:open', v);
            },
        },
    },
    data() {
        return {};
    },
    mounted() {},
    methods: {
        /** 关闭弹窗 */
        close() {
            this.visible = false;
        },
        // 验证手机号登陆
        async getPhoneNumber(e) {
            uni.$z1.showLoading({ title: '正在登录...', mask: true });
            // 1.微信授权登陆（微信服务器）
            const [err, wxData] = await getWxLoginCode();
            uni.$z1.closeLoading();
            if (err) return;

            console.log('授权获取手机号', e.detail);
            const { encryptedData, iv: ivStr, errno, errMsg } = e.detail;

            if (errno || (errMsg && errMsg.includes('getPhoneNumber:fail'))) return;

            const query = { encryptedData, ivStr, code: wxData.code };
            uni.$z1.showLoading({ title: '正在绑定手机号...', mask: true });
            authPhoneWxLogin(query)
                .then(res => {
                    console.log(res.data);
                    const { access_token, expires_in } = res.data;
                    if (access_token) {
                        // this.$store.commit('SET_HEADER', { Authorization: access_token, expires_in });
                        this.$emit('phoneBind', { Authorization: access_token, expires_in });
                    } else {
                        uni.showModal({ title: '提示', content: '登录失败，请稍后重试', showCancel: false });
                    }

                    this.visible = false;
                })
                .catch(err => {
                    console.log('手机号授权登陆失败==', err);
                    this.$emit('phoneBind', false);
                })
                .finally(() => {
                    uni.$z1.closeLoading();
                });
        },
    },
};
</script>

<style lang="scss" scoped>
@import './cuModal.css';
.size32 {
    font-size: 32upx;
}
.text-bold {
    font-weight: bold;
}
.text-left {
    text-align: left;
}
.margin-top {
    margin-top: 28upx;
}
.margin-top-20 {
    margin-top: 20upx;
}
.cu-dialog {
    position: relative;
    background: #f7f7f7;
    border-radius: 16upx !important;
    margin: 0 60upx;
    padding: 50upx 30upx;
    width: auto;
    .item-frame {
        margin-top: 28upx;
        padding: 24upx 32upx;
        background: #ffffff;
        border-radius: 10upx;
    }
    .btn-yes {
        margin: 100upx 0 32upx;
        height: 88upx;
        background: #3a65ff;
        border-radius: 10upx;
        font-size: 32upx;
        border: 0;
        font-family: PingFang SC;
        color: #ffffff;
        &::after {
            border: 0;
        }
    }
}
</style>
