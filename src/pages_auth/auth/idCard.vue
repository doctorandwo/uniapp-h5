<template>
    <PageFrame class="page-auth-idcard" bg="#F0F3FA" :hasHeader="true" headBackground="#fff" :title="pageTitle">
        <view style="overflow: hidden">
            <view style="margin: 24rpx 32rpx 160rpx">
                <view class="auth-form-card">
                    <!-- <view class="auth-section-title">身份证</view> -->

                    <view class="auth-upload-row">
                        <view class="auth-upload-item-wrapper">
                            <view class="auth-form-label"><span class="required">*</span>身份证正面</view>
                            <view class="auth-upload-item" @click="onUploadFront">
                                <image v-if="displayIdentificationImg" :src="displayIdentificationImg" class="auth-upload-item__img" mode="aspectFill" />
                                <view v-else class="auth-upload-item__placeholder">
                                    <image class="auth-upload-item__placeholder-img" :src="$global.getImageUrl('pages/auth/upload-idcard.png')" />
                                    <image class="auth-upload-item__placeholder-icon" :src="$global.getImageUrl('pages/auth/upload-icon.png')" />
                                </view>
                            </view>
                        </view>

                        <view class="auth-upload-item-wrapper">
                            <view class="auth-form-label"><span class="required">*</span>身份证国徽面</view>
                            <view class="auth-upload-item" @click="onUploadBack">
                                <image v-if="displayIdentificationBackImg" :src="displayIdentificationBackImg" class="auth-upload-item__img" mode="aspectFill" />
                                <view v-else class="auth-upload-item__placeholder">
                                    <image class="auth-upload-item__placeholder-img" :src="$global.getImageUrl('pages/auth/upload-idcard-back.png')" />
                                    <image class="auth-upload-item__placeholder-icon" :src="$global.getImageUrl('pages/auth/upload-icon.png')" />
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <z1-form :model="form" :rules="rules" :disabled="isReadonly">
                    <z1-form-group>
                        <z1-form-input v-model="form.identificationNumber" label="身份证号" prop="identificationNumber" placeholder="请输入" border-bottom :disabled="isReadonly" />
                        <z1-form-input v-model="form.adminName" label="姓名" prop="adminName" placeholder="请输入" border-bottom :disabled="isReadonly" />
                        <z1-form-datePicker
                            v-model="form.identificationBeginTime"
                            type="date"
                            label="生效日期"
                            prop="identificationBeginTime"
                            placeholder="请选择"
                            border-bottom
                            :disabled="isReadonly"
                        />
                        <z1-form-datePicker
                            v-if="!form.identificationEffective"
                            v-model="form.identificationEndTime"
                            type="date"
                            label="失效日期"
                            prop="identificationEndTime"
                            placeholder="请选择"
                            border-bottom
                            :disabled="isReadonly"
                        />
                        <z1-form-switch
                            :value.sync="form.identificationEffective"
                            label="长期有效"
                            :activeValue="1"
                            :inactiveValue="0"
                            :disabled="isReadonly"
                            @change="onEffectiveChange"
                        />
                    </z1-form-group>
                </z1-form>
            </view>
        </view>

        <view v-if="!isReadonly" class="auth-footer">
            <view class="auth-agree">
                <view class="auth-agree__checkbox">
                    <z1-checkbox :checked="agreed" @change="onAgreeChange" />
                </view>
                <view @click="agreed = !agreed">您同意我们收集身份证用于身份审核</view>
            </view>
            <z1-button type="primary" block :disabled="!agreed" @click="handleSave">同意提供上述信息进行审核</z1-button>
        </view>
    </PageFrame>
</template>

<script>
/**
 * 身份证信息（法人 / 发货人复用）
 * @by oh-my-zerone 2026-06-24
 */
// components
import PageFrame from '@/pages/components/PageFrame/index.vue';

// const
import { AUTH_STATUS, ID_CARD_ROLE, ID_CARD_ROLE_TITLE, LEADER_TYPE } from '@/common/constants/auth';

// services
import { getShipmentDetail, idCardOcrRead, postMiniAuth } from '@/api/auth';
import { resolveUploadImageDisplayUrl } from '@/common/upload/resolve';
import { buildAuthPayload, chooseImages, normalizeDate, pickEnterpriseFormFromDetail, pickIdFormFromDetail, validateAuthForm } from '@/pages_auth/utils';
import requestSubscribeMessage from '@/common/platform/subscribe';
import { BusinessOperTypeConstant } from '@/common/platform/subscribe/businessOperType';

export default {
    name: 'auth-idcard',
    components: { PageFrame },
    data() {
        return {
            role: ID_CARD_ROLE.OWNER,
            shipperType: LEADER_TYPE.PERSONAL,
            authStatus: AUTH_STATUS.UNREVIEWED,
            detail: {},
            form: {
                adminName: '',
                telphone: '',
                identificationNumber: '',
                identificationImg: '',
                identificationBackImg: '',
                identificationBeginTime: '',
                identificationEndTime: '',
                identificationEffective: 0,
            },
            agreed: false,
            displayIdentificationImg: '',
            displayIdentificationBackImg: '',
            rules: {
                identificationNumber: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
                adminName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
                identificationBeginTime: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
                identificationEndTime: [{ required: true, message: '请选择失效日期', trigger: 'change' }],
            },
        };
    },
    computed: {
        shipmentCode() {
            return this.$store.getters.shipmentInfo?.code;
        },
        pageTitle() {
            return ID_CARD_ROLE_TITLE[this.role] || '身份证信息';
        },
        isReadonly() {
            return this.authStatus === AUTH_STATUS.APPROVED;
        },
    },
    onLoad(options) {
        if (options.role) {
            this.role = options.role;
        }
        if (options.shipperType !== undefined) {
            this.shipperType = Number(options.shipperType);
        }
        this.loadDetail();
    },
    methods: {
        async loadDetail() {
            const userInfo = this.$store.getters.userInfo || {};
            const defaults = {
                adminName: userInfo.nickName || userInfo.userName || '',
                telphone: userInfo.phonenumber || '',
            };
            if (!this.shipmentCode) {
                this.form = { ...this.form, ...defaults };
                this.resetImageDisplays();
                return;
            }
            try {
                const res = await getShipmentDetail(this.shipmentCode);
                if (res?.code === 200 && res.data) {
                    const data = res.data;
                    this.detail = data;
                    this.authStatus = data.authStatus === undefined || data.authStatus === null ? AUTH_STATUS.UNREVIEWED : Number(data.authStatus);
                    this.form = pickIdFormFromDetail(data, defaults);
                    await this.syncImageDisplays();
                    return;
                }
            } catch (e) {
                /* 货主记录不存在时使用默认表单 */
            }
            this.form = { ...this.form, ...defaults };
            this.resetImageDisplays();
        },
        resetImageDisplays() {
            this.displayIdentificationImg = '';
            this.displayIdentificationBackImg = '';
        },
        async syncImageDisplays() {
            const [front, back] = await Promise.all([resolveUploadImageDisplayUrl(this.form.identificationImg), resolveUploadImageDisplayUrl(this.form.identificationBackImg)]);
            this.displayIdentificationImg = front;
            this.displayIdentificationBackImg = back;
        },
        onEffectiveChange(val) {
            if (val === 1) {
                this.form.identificationEndTime = '';
            }
        },
        onAgreeChange(val) {
            this.agreed = val;
        },
        async onUploadFront() {
            if (this.isReadonly) return;
            const path = await this.uploadIdCardImage();
            if (!path) return;
            this.form.identificationImg = path;
            this.displayIdentificationImg = path;
            await this.startOcrRead(path, 'front');
        },
        async onUploadBack() {
            if (this.isReadonly) return;
            const path = await this.uploadIdCardImage();
            if (!path) return;
            this.form.identificationBackImg = path;
            this.displayIdentificationBackImg = path;
            await this.startOcrRead(path, 'back');
        },
        async uploadIdCardImage() {
            const url = process.env.VUE_APP_BASE_HOST + '/assets/upload/uploadToHW';
            const res = await chooseImages(url).catch(() => null);
            if (res && res.code === 200) {
                return res.data?.path || '';
            }
            return '';
        },
        async startOcrRead(url, side) {
            uni.showLoading({ title: '正在识别' });
            try {
                const res = await idCardOcrRead({ url, side });
                uni.hideLoading();
                if (res?.code !== 200) return;
                if (res.data?.msg) {
                    uni.showToast({ title: '识别失败', icon: 'none' });
                    return;
                }
                if (side === 'front') {
                    if (res.data.name) this.form.adminName = res.data.name;
                    if (res.data.number) this.form.identificationNumber = res.data.number;
                } else if (side === 'back') {
                    if (res.data.valid_from) {
                        this.form.identificationBeginTime = normalizeDate(res.data.valid_from);
                    }
                    const validTo = res.data.valid_to;
                    if (validTo === '长期') {
                        this.form.identificationEndTime = '';
                        this.form.identificationEffective = 1;
                    } else if (/^\d{4}-\d{2}-\d{2}/.test(validTo)) {
                        this.form.identificationEndTime = validTo;
                        this.form.identificationEffective = 0;
                    }
                }
                uni.showToast({ title: '识别成功', icon: 'none' });
            } catch (e) {
                uni.hideLoading();
                uni.showToast({ title: '识别失败', icon: 'none' });
            }
        },
        async handleSave() {
            if (this.isReadonly || !this.agreed) return;
            if (!validateAuthForm(this.form)) return;
            const enterpriseForm = pickEnterpriseFormFromDetail(this.detail);
            const payload = buildAuthPayload({
                detail: this.detail,
                form: { ...enterpriseForm, ...this.form },
                shipperType: this.shipperType,
                telphone: this.form.telphone,
            });
            const res = await postMiniAuth(payload);
            if (res?.code === 200) {
                await this.$store.dispatch('GetUserStatus');
                uni.showToast({ title: '提交成功', icon: 'none' });
                await requestSubscribeMessage(['AUDIT_RESULT'], { businessOperType: BusinessOperTypeConstant.SHIPMENT_EXAMINE });
                setTimeout(() => uni.navigateBack(), 500);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.auth-section-title {
    display: flex;
    align-items: center;
    margin-left: -32rpx;
    margin-bottom: 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;

    &::before {
        content: '';
        width: 6rpx;
        height: 32rpx;
        margin-right: 20rpx;
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

.auth-form-card {
    padding: 28rpx 32rpx;
    background: #fff;
    border-radius: 20rpx;
    box-sizing: border-box;
    margin-bottom: 24rpx;
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
    height: 200rpx;
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
            width: 234rpx;
            height: 144rpx;
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
