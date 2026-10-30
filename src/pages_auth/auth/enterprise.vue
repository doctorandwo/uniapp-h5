<template>
    <PageFrame class="page-auth-enterprise" bg="#F0F3FA" :hasHeader="true" headBackground="#fff" title="企业信息">
        <view style="overflow: hidden">
            <view style="margin: 24rpx 32rpx 160rpx">
                <view class="auth-form-card">
                    <!-- <view class="auth-section-title">营业执照</view> -->

                    <view class="auth-upload-row">
                        <view class="auth-upload-item-wrapper">
                            <view class="auth-form-label"><span class="required">*</span>营业执照</view>
                            <view class="auth-upload-item" @click="onUploadLicense">
                                <image v-if="displayBusinessLicenseImg" :src="displayBusinessLicenseImg" class="auth-upload-item__img" mode="aspectFill" />
                                <view v-else class="auth-upload-item__placeholder">
                                    <image class="auth-upload-item__placeholder-img" :src="$global.getImageUrl('pages/auth/upload-enterprise.png')" />
                                    <image class="auth-upload-item__placeholder-icon" :src="$global.getImageUrl('pages/auth/upload-icon.png')" />
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <z1-form :model="form" :rules="rules" :disabled="isReadonly">
                    <z1-form-group>
                        <z1-form-input v-model="form.companyName" label="公司名称" prop="companyName" placeholder="请输入" border-bottom :disabled="isReadonly" />
                        <z1-form-input v-model="form.organizationCodeNo" label="统一信用代码" prop="organizationCodeNo" placeholder="请输入" border-bottom :disabled="isReadonly" />
                        <z1-form-input v-model="form.address" label="住所" prop="address" placeholder="请输入" :disabled="isReadonly" />
                    </z1-form-group>
                </z1-form>
            </view>
        </view>

        <view v-if="!isReadonly" class="auth-footer">
            <view class="auth-agree">
                <view class="auth-agree__checkbox">
                    <z1-checkbox :checked="agreed" @change="onAgreeChange" />
                </view>
                <view @click="agreed = !agreed">您同意我们收集企业信息用于身份审核</view>
            </view>
            <z1-button type="primary" block :disabled="!agreed" @click="handleSave">同意提供上述信息进行审核</z1-button>
        </view>
    </PageFrame>
</template>

<script>
/**
 * 企业信息
 * @by oh-my-zerone 2026-06-24
 */
// components
import PageFrame from '@/pages/components/PageFrame/index.vue';

// const
import { AUTH_STATUS, LEADER_TYPE } from '@/common/constants/auth';

// services
import { getShipmentDetail, ocrRead, postMiniAuth } from '@/api/auth';
import { resolveUploadImageDisplayUrl } from '@/common/upload/resolve';
import { buildAuthPayload, chooseImages, pickEnterpriseFormFromDetail, pickIdFormFromDetail, validateEnterpriseForm } from '@/pages_auth/utils';

export default {
    name: 'auth-enterprise',
    components: { PageFrame },
    data() {
        return {
            shipperType: LEADER_TYPE.ENTERPRISE,
            authStatus: AUTH_STATUS.UNREVIEWED,
            detail: {},
            form: {
                companyName: '',
                organizationCodeNo: '',
                address: '',
                businessLicenseImg: '',
            },
            agreed: false,
            displayBusinessLicenseImg: '',
            rules: {
                companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
                organizationCodeNo: [{ required: true, message: '请输入统一信用代码', trigger: 'blur' }],
                address: [{ required: true, message: '请输入住所', trigger: 'blur' }],
            },
        };
    },
    computed: {
        shipmentCode() {
            return this.$store.getters.shipmentInfo?.code;
        },
        isReadonly() {
            return this.authStatus === AUTH_STATUS.APPROVED;
        },
    },
    onLoad(options) {
        if (options.shipperType !== undefined) {
            this.shipperType = Number(options.shipperType);
        }
        this.loadDetail();
    },
    methods: {
        async loadDetail() {
            if (!this.shipmentCode) return;
            try {
                const res = await getShipmentDetail(this.shipmentCode);
                if (res?.code === 200 && res.data) {
                    this.detail = res.data;
                    this.authStatus = res.data.authStatus === undefined || res.data.authStatus === null ? AUTH_STATUS.UNREVIEWED : Number(res.data.authStatus);
                    this.form = pickEnterpriseFormFromDetail(res.data);
                    await this.syncImageDisplay();
                }
            } catch (e) {
                /* 记录不存在时使用默认表单 */
            }
        },
        async syncImageDisplay() {
            this.displayBusinessLicenseImg = await resolveUploadImageDisplayUrl(this.form.businessLicenseImg);
        },
        onAgreeChange(val) {
            this.agreed = val;
        },
        async onUploadLicense() {
            if (this.isReadonly) return;
            const path = await this.uploadLicenseImage();
            if (!path) return;
            this.form.businessLicenseImg = path;
            this.displayBusinessLicenseImg = path;
            await this.startOcrRead(path);
        },
        async uploadLicenseImage() {
            const url = process.env.VUE_APP_BASE_HOST + '/assets/upload/uploadToHW';
            const res = await chooseImages(url).catch(() => null);
            if (res && res.code === 200) {
                return res.data?.path || '';
            }
            return '';
        },
        async startOcrRead(url) {
            uni.showLoading({ title: '正在识别' });
            try {
                const res = await ocrRead({ type: 'business-license', url: url });
                uni.hideLoading();
                if (res?.code !== 200) return;
                if (res.data?.msg) {
                    uni.showToast({ title: '识别失败', icon: 'none' });
                    return;
                }
                const data = res.data || {};
                let filled = false;
                if (data.name) {
                    this.form.companyName = data.name;
                    filled = true;
                }
                if (data.registration_number) {
                    this.form.organizationCodeNo = data.registration_number;
                    filled = true;
                }
                if (data.address) {
                    this.form.address = data.address;
                    filled = true;
                }
                uni.showToast({ title: filled ? '识别成功' : '未识别到可回填信息', icon: 'none' });
            } catch (e) {
                uni.hideLoading();
                uni.showToast({ title: '识别失败', icon: 'none' });
            }
        },
        async handleSave() {
            if (this.isReadonly || !this.agreed) return;
            if (!validateEnterpriseForm(this.form)) return;
            const userInfo = this.$store.getters.userInfo || {};
            const idForm = pickIdFormFromDetail(this.detail, {
                telphone: userInfo.phonenumber || '',
            });
            const payload = buildAuthPayload({
                detail: this.detail,
                form: { ...idForm, ...this.form },
                shipperType: this.shipperType,
                telphone: userInfo.phonenumber || idForm.telphone,
            });
            const res = await postMiniAuth(payload);
            if (res?.code === 200) {
                await this.$store.dispatch('GetUserStatus');
                uni.showToast({ title: '提交成功', icon: 'none' });
                setTimeout(() => uni.navigateBack(), 1000);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.auth-form-card {
    padding: 28rpx 32rpx;
    background: #fff;
    border-radius: 20rpx;
    box-sizing: border-box;
    margin-bottom: 24rpx;
}

.auth-section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;

    &::before {
        content: '';
        width: 6rpx;
        height: 28rpx;
        margin-right: 12rpx;
        background: #3a65ff;
        border-radius: 3rpx;
    }
}

.auth-form-label {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;

    .required {
        color: #e55e50;
        margin-right: 6rpx;
    }
}

.auth-upload-row {
    display: flex;
    margin-bottom: 16rpx;
}

.auth-upload-item-wrapper {
    flex: 1;
    &:not(:last-child) {
        margin-right: 32rpx;
    }
}

.auth-upload-item {
    height: 300rpx;
    background: #f9f9f9;
    border-radius: 4rpx;
    border: 1rpx dashed #c6c6c6;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;

    &__img {
        width: 100%;
        height: 100%;
    }

    &__placeholder {
        width: 100%;
        height: 100%;
        position: relative;

        &-img {
            position: absolute;
            width: 468rpx;
            height: 288rpx;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
        }

        &-icon {
            position: absolute;
            width: 116rpx;
            height: 116rpx;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }
    }
}

::v-deep .z1-input {
    width: 100%;
}

::v-deep .z1-cell-label {
    min-width: 40%;
}

.auth-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-sizing: border-box;
    z-index: 10;
}

.auth-agree {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;

    &__checkbox {
        flex-shrink: 0;
        margin-right: 12rpx;
        transform: translateY(4rpx);
    }
}
</style>
