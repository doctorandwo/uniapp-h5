<template>
    <view class="alias-popup-mask" v-if="show">
        <view class="alias-popup" :style="{ bottom: keyboardHeight + 'px' }">
            <view class="topBg">
                <!-- <image :src="$global.getImageUrl('pages_quoteCreate/alias_bg.png')" mode="aspectFill" /> -->
                <image class="title-icon" :src="$global.getImageUrl('pages_quoteCreate/icon_titleAddress.png')" mode="aspectFit" />
                <view class="address-info">
                    <image :src="$global.getImageUrl('pages_quoteCreate/icon_address.png')" mode="aspectFit" class="address-icon" />
                    <text class="address-text">{{ address || '' }}</text>
                </view>
                <image class="close-icon" :src="$global.getImageUrl('pages_quoteCreate/icon_close.png')" @click="handleCancel" mode="aspectFit" />
                <image class="iconCoordinate" :src="$global.getImageUrl('pages_quoteCreate/icon_coordinate.png')" mode="aspectFit" />
            </view>
            <view class="popup-body">
                <view class="alias-input-box">
                    <text class="input-label">地址别名（必填）</text>
                    <input
                        class="alias-input"
                        type="text"
                        v-model="innerAlias"
                        placeholder="请输入便于识别的名称"
                        placeholder-class="placeholder-style"
                        maxlength="20"
                        :adjust-position="false"
                    />
                    <text class="word-count">{{ innerAlias.length }}/20</text>
                </view>
                <!-- @by oh-my-zerone 2026-10-16 可选联系人采集：showContact 为 true 时展示（默认关闭，不影响既有调用方） -->
                <view class="alias-input-box" v-if="showContact">
                    <text class="input-label">地址联系人（必填）</text>
                    <input
                        class="alias-input"
                        type="text"
                        v-model="innerContact"
                        placeholder="请输入联系人姓名"
                        placeholder-class="placeholder-style"
                        maxlength="20"
                        :adjust-position="false"
                    />
                </view>
                <view class="alias-input-box" v-if="showContact">
                    <text class="input-label">联系电话（必填）</text>
                    <input
                        class="alias-input"
                        type="number"
                        :value="innerPhone"
                        placeholder="请输入联系电话"
                        placeholder-class="placeholder-style"
                        maxlength="11"
                        :adjust-position="false"
                        @input="onPhoneInput"
                    />
                </view>
                <view class="save-common-row" @click="toggleSaveCommon">
                    <CCheckBox :checked="innerSaveCommon" shape="circle" @change="onSaveCommonChange" />
                    <text class="save-common-text">保存到常用地址</text>
                </view>
            </view>
            <view class="popup-footer">
                <view class="btn info" @click="handleClose">
                    <text>暂不保存</text>
                </view>
                <view class="btn" :class="[!innerAlias.trim() || submitting ? 'disabled' : 'primary', { loading: submitting }]" @click="handleSave">
                    <text>保存并完成</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import CCheckBox from '@/components/CCheckBox/index.vue';

export default {
    name: 'AliasPopup',
    components: { CCheckBox },
    props: {
        show: { type: Boolean, default: false },
        address: { type: String, default: '' },
        alias: { type: String, default: '' },
        // @by oh-my-zerone 2026-10-16 是否同时采集地址联系人 / 联系电话（默认关闭，保持既有调用方交互不变）
        showContact: { type: Boolean, default: false },
        // 回显：地址联系人
        contact: { type: String, default: '' },
        // 回显：联系电话
        contactPhone: { type: String, default: '' },
        /**
         * 「保存到常用地址」勾选态：与调用方双向同步（.sync），调用方为唯一数据源。
         * 未绑定该 prop 的调用方保持原有表现（弹窗内部自行延续勾选态）。
         * @by oh-my-zerone 2026-10-20
         */
        saveToCommon: { type: Boolean, default: false },
    },
    data() {
        return {
            innerAlias: '',
            // @by oh-my-zerone 2026-10-16 showContact 开启时使用
            innerContact: '',
            innerPhone: '',
            // 是否保存到常用地址（默认不勾选）；与 saveToCommon prop 双向同步，内部一律读写本字段
            innerSaveCommon: false,
            // 提交中标记，防止按钮连击重复触发 confirm
            submitting: false,
            // 键盘高度，用于调整弹窗位置
            keyboardHeight: 0,
        };
    },
    watch: {
        show(val) {
            if (val) {
                this.innerAlias = this.alias || '';
                this.innerContact = this.contact || '';
                this.innerPhone = this.contactPhone || '';
                this.submitting = false;
            }
        },
        // @by oh-my-zerone 2026-10-20 调用方改值时即时同步到勾选框，保证两侧一致
        saveToCommon: {
            handler(val) {
                this.innerSaveCommon = val === true;
            },
            immediate: true,
        },
    },
    mounted() {
        // 监听键盘高度变化，弹窗跟随上移但背景不动
        uni.onKeyboardHeightChange(this.onKeyboard);
    },
    beforeDestroy() {
        uni.offKeyboardHeightChange(this.onKeyboard);
    },
    methods: {
        onKeyboard(res) {
            this.keyboardHeight = res.height || 0;
        },
        /**
         * 勾选 / 取消「保存到常用地址」：先落本地，再以纯数据事件同步给调用方
         * @by oh-my-zerone 2026-10-20
         * @param {Boolean} [val] 目标值；不传表示翻转（点击整行）
         * @returns {void}
         */
        setSaveCommon(val) {
            const next = val === undefined ? !this.innerSaveCommon : val === true;
            this.innerSaveCommon = next;
            this.$emit('update:saveToCommon', next);
        },
        toggleSaveCommon() {
            this.setSaveCommon();
        },
        onSaveCommonChange(val) {
            this.setSaveCommon(val);
        },
        handleMaskClick() {
            // 必填，点击蒙层不关闭
        },
        handleSave() {
            if (this.submitting) return;
            const value = this.innerAlias.trim();
            if (!value) {
                uni.showToast({ title: '请输入地址别名', icon: 'none' });
                return;
            }
            // @by oh-my-zerone 2026-10-16 showContact 开启时同步校验联系人 / 联系电话（规则与原地址联系人弹窗一致）
            const contact = this.innerContact.trim();
            const contactPhone = this.innerPhone.trim();
            if (this.showContact) {
                if (!contact) {
                    uni.showToast({ title: '请输入地址联系人', icon: 'none' });
                    return;
                }
                if (!contactPhone) {
                    uni.showToast({ title: '请输入联系电话', icon: 'none' });
                    return;
                }
                if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
                    uni.showToast({ title: '请输入正确的联系电话', icon: 'none' });
                    return;
                }
            }
            this.submitting = true;
            // 回传 { alias, saveToCommon, contact, contactPhone }，由调用方决定是否持久化常用地址
            this.$emit('confirm', { alias: value, saveToCommon: this.innerSaveCommon, contact, contactPhone });
            this.$emit('update:show', false);
        },
        /**
         * 联系电话输入：只保留数字并限制 11 位
         * @by oh-my-zerone 2026-10-16
         */
        onPhoneInput(e) {
            const value = String((e && e.detail && e.detail.value) || '')
                .replace(/\D/g, '')
                .slice(0, 11);
            this.innerPhone = value;
            return value;
        },
        handleClose() {
            // 暂不保存：整体取消选择，不校验别名也不回传 confirm
            this.$emit('update:show', false);
        },
        handleCancel() {
            // 点击关闭图标：纯取消，不校验别名，也不回传 confirm
            this.$emit('update:show', false);
        },
    },
};
</script>

<style lang="scss" scoped>
::v-deep.z1-button {
    height: 100rpx !important;
}

.alias-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: flex-end;
}

.alias-popup {
    width: 100%;
    border-radius: 32rpx 32rpx 0 0;
    padding: 32rpx 46rpx;
    padding-bottom: calc(55rpx + env(safe-area-inset-bottom));
    position: relative;
    /*
     * @by oh-my-zerone 2026-10-16 自建层叠上下文，修正装饰层与自身背景的绘制顺序：
     *   原先靠「半透明背景 + 装饰图 z-index:-1」做成顶部晕染，导致底层页面元素（地图页列表卡片、
     *   选中勾选图标等）透过弹窗显影，且新增联系人/联系电话字段后弹窗变高，
     *   30% 渐变色停会落到「地址别名」输入框上，出现横贯输入框的色带接缝。
     *   现改为不透明纯白背景：装饰图（topBg 负 z-index）在自身背景之上、表单内容之下绘制，
     *   顶部晕染完全由 alias_bg.png 自身的渐隐提供，与弹窗高度解耦。
     */
    z-index: 0;
    transition: bottom 0.3s ease;
    box-shadow: inset 0rpx 3rpx 1rpx 1rpx rgba(255, 255, 255, 0.59);
    background: #ffffff;

    .topBg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: -170rpx;
        left: 0;
        z-index: -1;
        background-color: #fff;

        image {
            width: 750rpx;
            height: 332rpx;
        }

        .title-icon {
            width: 265rpx;
            height: 44rpx;
            position: absolute;
            top: 50rpx;
            left: 46rpx;
        }

        .address-info {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 108rpx;
            left: 46rpx;
            width: 60%;

            .address-icon {
                width: 125rpx;
                height: 30rpx;
                margin-right: 8rpx;
            }

            .address-text {
                font-weight: bold;
                font-size: 24rpx;
                color: #333333;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 100%;
            }
        }

        .close-icon {
            width: 48rpx;
            height: 48rpx;
            position: absolute;
            top: -60rpx;
            right: 30rpx;
        }

        .iconCoordinate {
            width: 176rpx;
            height: 176rpx;
            position: absolute;
            top: -20rpx;
            right: 30rpx;
        }
    }
}

.popup-header {
    margin-bottom: 32rpx;

    .popup-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
    }
}

.selected-address {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    .address-label {
        font-size: 24rpx;
        color: #3a65ff;
        background: rgba(58, 101, 255, 0.12);
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        margin-right: 16rpx;
        flex-shrink: 0;
    }

    .address-text {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.alias-input-box {
    position: relative;
    margin-bottom: 30rpx;

    .input-label {
        display: block;
        margin-bottom: 20rpx;
        font-weight: bold;
        font-size: 28rpx;
        color: #333333;
    }

    .alias-input {
        height: 88rpx;
        background: #f5f6fa;
        border-radius: 16rpx;
        padding: 0 24rpx;
        font-size: 30rpx;
        color: #333333;
    }

    .placeholder-style {
        color: #bbbbbb;
    }

    .word-count {
        position: absolute;
        right: 24rpx;
        top: 85rpx;
        font-size: 28rpx;
        color: #999999;
    }
}
.save-common-row {
    display: flex;
    align-items: center;
    margin-top: 28rpx;
    margin-bottom: 28rpx;

    .save-common-text {
        font-size: 26rpx;
        color: #3a65ff;
        margin-left: 14rpx;
    }
}

/* 圆形旋转加载 */
%spinner {
    width: 30rpx;
    height: 30rpx;
    border: 4rpx solid rgba(58, 86, 255, 0.2);
    border-top: 4rpx solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
}

.popup-footer {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;

    .btn {
        height: 100rpx;
        border-radius: 16rpx;
        font-size: 34rpx;
        font-weight: bold;
        text-align: center;
        line-height: 100rpx;
        box-sizing: border-box;

        &.primary {
            background: #3a65ff;
            color: #fff;
            width: 414rpx;
        }

        &.disabled {
            background: #ccc;
            color: #fff;
            width: 414rpx;
        }

        &.info {
            background: #fff;
            color: #333;
            border: 1rpx solid #999;
            width: 221rpx;
        }

        &.loading {
            display: flex;
            align-items: center;
            justify-content: center;

            &::before {
                content: '';
                display: block;
                @extend %spinner;
                margin-right: 15rpx;
            }
        }
    }
}
</style>
