<!--
 * @by oh-my-zerone 2026-10-19
 * 常用地址新增 / 编辑页（同一页面，按 id 区分模式）
 * @by oh-my-zerone 2026-10-20 保存按钮增加 loading 态（转圈 + 「保存中」+ 拦截重复提交）
 * 表单项：地址（地图选点回填）、详细地址、地址别名、联系人、联系电话、地址类型（picker）
-->
<template>
    <SubPageLayout :title="isEdit ? '编辑地址' : '新增地址'" body-padding="24rpx 32rpx" :footer-buttons="footerButtons" @footer-click="onFooterClick">
        <view class="address-form">
            <view class="address-form__card">
                <view class="address-form__row" @click="onPickAddress">
                    <text class="address-form__label">地址</text>
                    <view class="address-form__value-wrap">
                        <text class="address-form__value" :class="{ 'address-form__value--empty': !form.addressName }">
                            {{ form.addressName || '请选择地址' }}
                        </text>
                        <text class="address-form__arrow"></text>
                    </view>
                </view>

                <view class="address-form__row">
                    <text class="address-form__label">详细地址</text>
                    <input
                        class="address-form__input"
                        type="text"
                        placeholder="请输入门牌号等详细信息"
                        placeholder-class="address-form__placeholder"
                        :value="form.detail"
                        @input="onFieldInput('detail', $event)"
                    />
                </view>

                <view class="address-form__row">
                    <text class="address-form__label">地址别名</text>
                    <input
                        class="address-form__input"
                        type="text"
                        placeholder="请输入地址别名"
                        placeholder-class="address-form__placeholder"
                        :value="form.addressAlias"
                        @input="onFieldInput('addressAlias', $event)"
                    />
                </view>

                <view class="address-form__row">
                    <text class="address-form__label">联系人</text>
                    <input
                        class="address-form__input"
                        type="text"
                        placeholder="请输入联系人"
                        placeholder-class="address-form__placeholder"
                        :value="form.contact"
                        @input="onFieldInput('contact', $event)"
                    />
                </view>

                <view class="address-form__row">
                    <text class="address-form__label">联系电话</text>
                    <input
                        class="address-form__input"
                        type="number"
                        maxlength="11"
                        placeholder="请输入联系电话"
                        placeholder-class="address-form__placeholder"
                        :value="form.contactPhone"
                        @input="onFieldInput('contactPhone', $event)"
                    />
                </view>

                <picker mode="selector" :range="addressTypeLabels" :value="addressTypeIndex" @change="onTypeChange">
                    <view class="address-form__row">
                        <text class="address-form__label">地址类型</text>
                        <view class="address-form__value-wrap">
                            <text class="address-form__value">{{ addressTypeLabel }}</text>
                            <text class="address-form__arrow"></text>
                        </view>
                    </view>
                </picker>
            </view>
        </view>
    </SubPageLayout>
</template>

<script>
// components
import SubPageLayout from '@/components/SubPageLayout/index.vue';

// hooks
import { createEmptyForm, parseCardToForm, buildCreatePayload, buildUpdatePayload, validateForm } from '../model.js';
import { takeEditingAddress } from '../cache.js';

// const
import { ADDRESS_TYPE_OPTIONS, ADDRESS_TYPE_LABELS, getAddressTypeIndex, ADDRESS_BOOK_REFRESH_EVENT } from '../constants.js';

// services
import { ApiAddAddress, ApiEditAddress } from '../service.js';

/** 地图选点页路径（pickOnly=1：只选点不写入常用地址，由本页统一提交） */
const MAP_PICKER_URL = '/pages_common/chooseLocation/mapPicker/index';

export default {
    name: 'AddressBookForm',
    components: { SubPageLayout },
    data() {
        return {
            /** 表单模型（本地持有，提交时统一上抛） */
            form: createEmptyForm(),
            /** 是否编辑模式 */
            isEdit: false,
            /** 保存中状态，防重复提交 */
            saving: false,
        };
    },
    computed: {
        /**
         * picker 选项文案
         * @returns {Array<string>} 文案列表
         */
        addressTypeLabels() {
            return ADDRESS_TYPE_LABELS;
        },
        /**
         * picker 当前选中索引
         * @returns {number} 索引
         */
        addressTypeIndex() {
            return getAddressTypeIndex(this.form.addressType);
        },
        /**
         * 地址类型展示文案
         * @returns {string} 文案
         */
        addressTypeLabel() {
            const hit = ADDRESS_TYPE_OPTIONS.find(item => item.value === Number(this.form.addressType));
            return hit ? hit.label : ADDRESS_TYPE_OPTIONS[0].label;
        },
        /**
         * 底部声明式按钮
         * @returns {Array<{key:string,text:string,type:string}>} 按钮配置
         */
        footerButtons() {
            // @by oh-my-zerone 保存中：底部按钮转圈并置为「保存中」，期间拦截重复提交
            return [{ key: 'save', text: '保存', type: 'primary', loading: this.saving, loadingText: '保存中' }];
        },
    },
    onLoad(options) {
        const id = Number((options && options.id) || 0);
        this.isEdit = id > 0;
        const record = takeEditingAddress();
        this.form = record ? parseCardToForm(record) : createEmptyForm();
        if (this.isEdit) this.form.id = id;
    },
    methods: {
        /**
         * 文本字段输入：按字段名写回表单（不使用 v-model 直接绑定深层对象，保持单向清晰）
         * @param {string} field 字段名
         * @param {Object} e input 事件对象
         * @returns {void}
         */
        onFieldInput(field, e) {
            this.form[field] = (e && e.detail && e.detail.value) || '';
        },
        /**
         * 地址类型 picker 变更
         * @param {Object} e picker change 事件对象
         * @returns {void}
         */
        onTypeChange(e) {
            const index = Number((e && e.detail && e.detail.value) || 0);
            this.form.addressType = ADDRESS_TYPE_OPTIONS[index].value;
        },
        /**
         * 跳转地图选点页回填地址（pickOnly 模式，选点过程不落库）
         * 已选过地址时携带坐标与 selected，供地图选点页回显
         * @returns {void}
         */
        onPickAddress() {
            const { longitude, latitude } = this.form;
            const params = ['type=start', 'pickOnly=1'];
            if (longitude !== '' && latitude !== '') {
                params.push(`x=${longitude}`, `y=${latitude}`);
                params.push(
                    `selected=${encodeURIComponent(
                        JSON.stringify({
                            longitude,
                            latitude,
                            addressName: this.form.addressName,
                            detail: this.form.detail,
                            alias: this.form.addressAlias,
                        })
                    )}`
                );
            }
            uni.navigateTo({
                url: `${MAP_PICKER_URL}?${params.join('&')}`,
                events: {
                    success: res => {
                        this.applyPickedAddress(res);
                    },
                },
            });
        },
        /**
         * 回填选点结果：地址名称 / 省市区 / 经纬度直接覆盖；详细地址由选点返回内容覆盖；
         * 别名 / 联系人 / 联系电话仅在为空时回填，避免覆盖用户已填内容
         * @param {{poi:Object, alias:string}} res 选点页回传结果
         * @returns {void}
         */
        applyPickedAddress(res) {
            const poi = (res && res.poi) || {};
            const [longitude = '', latitude = ''] = String(poi.location || '').split(',');
            this.form.addressName = poi.name || poi.title || '';
            this.form.province = poi.province || '';
            this.form.city = poi.city || '';
            this.form.district = poi.district || '';
            this.form.provinceCode = poi.provinceCode || '';
            this.form.cityCode = poi.cityCode || '';
            this.form.districtCode = poi.districtCode || '';
            this.form.longitude = longitude;
            this.form.latitude = latitude;
            // @by oh-my-zerone 选点返回内容直接覆盖详细地址（别名 / 联系人仅在为空时回填，避免覆盖用户已填内容）
            const detail = poi.address || poi.subtitle || '';
            if (detail) this.form.detail = detail;
            if (!this.form.addressAlias) this.form.addressAlias = poi.addressAlias || (res && res.alias) || '';
            if (!this.form.contact) this.form.contact = poi.contact || '';
            if (!this.form.contactPhone) this.form.contactPhone = poi.contactPhone || '';
        },
        /**
         * 底部按钮点击：保存
         * @param {string} key 按钮 key
         * @returns {void}
         */
        onFooterClick(key) {
            if (key !== 'save') return;
            this.onSave();
        },
        /**
         * 校验并保存（新增走 POST / 编辑走 PUT）
         * @returns {Promise<void>}
         */
        async onSave() {
            if (this.saving) return;
            const { ok, message } = validateForm(this.form);
            if (!ok) {
                uni.showToast({ title: message, icon: 'none' });
                return;
            }
            this.saving = true;
            try {
                const payload = this.isEdit ? buildUpdatePayload(this.form) : buildCreatePayload(this.form);
                if (this.isEdit) {
                    await ApiEditAddress(payload);
                } else {
                    await ApiAddAddress(payload);
                }
                uni.showToast({ title: '保存成功', icon: 'none' });
                uni.$emit(ADDRESS_BOOK_REFRESH_EVENT);
                uni.navigateBack();
            } catch (error) {
                console.error('[addressBook] save error', error);
                uni.showToast({ title: '保存失败，请重试', icon: 'none' });
            } finally {
                this.saving = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
$primary: #3a65ff;

.address-form {
    &__card {
        padding: 0 28rpx;
        background-color: #ffffff;
        border-radius: 20rpx;
        box-shadow: 0 6rpx 20rpx 0 rgba(198, 203, 217, 0.18);
    }

    &__row {
        display: flex;
        align-items: center;
        min-height: 100rpx;
        border-bottom: 2rpx solid #f0f0f0;

        &:last-child {
            border-bottom: none;
        }
    }

    &__label {
        flex-shrink: 0;
        width: 160rpx;
        font-size: 28rpx;
        color: #333333;
    }

    &__input {
        flex: 1;
        min-width: 0;
        height: 100rpx;
        font-size: 28rpx;
        color: #333333;
        // 表单值统一靠右对齐
        text-align: right;
    }

    &__placeholder {
        color: #bbbbbb;
    }

    &__value-wrap {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        // 表单值统一靠右对齐（箭头紧随其后）
        justify-content: flex-end;
    }

    &__value {
        flex-shrink: 0;
        max-width: 420rpx;
        font-size: 28rpx;
        color: #333333;
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &--empty {
            color: #bbbbbb;
        }
    }

    &__arrow {
        flex-shrink: 0;
        width: 16rpx;
        height: 16rpx;
        margin-left: 16rpx;
        border-top: 4rpx solid #c8c9cc;
        border-right: 4rpx solid #c8c9cc;
        transform: rotate(45deg);
    }
}
</style>
