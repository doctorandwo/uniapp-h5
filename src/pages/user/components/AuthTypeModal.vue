<template>
    <view v-if="visible" class="auth-type-modal" @touchmove.stop.prevent>
        <view class="auth-type-modal__mask" @click="handleCancel" />
        <view class="auth-type-modal__panel">
            <view class="auth-type-modal__title">认证类型</view>
            <view class="auth-type-modal__options">
                <view class="auth-type-modal__option" @click="selected = LEADER_TYPE.ENTERPRISE">
                    <view class="auth-type-modal__radio" :class="{ 'auth-type-modal__radio--checked': selected === LEADER_TYPE.ENTERPRISE }" />
                    <text>发货企业</text>
                </view>
                <view class="auth-type-modal__option" @click="selected = LEADER_TYPE.PERSONAL">
                    <view class="auth-type-modal__radio" :class="{ 'auth-type-modal__radio--checked': selected === LEADER_TYPE.PERSONAL }" />
                    <text>发货人</text>
                </view>
            </view>
            <view class="auth-type-modal__actions">
                <view class="auth-type-modal__btn auth-type-modal__btn--ghost" @click="handleCancel">取消</view>
                <view class="auth-type-modal__btn auth-type-modal__btn--primary" @click="handleConfirm">确认</view>
            </view>
        </view>
    </view>
</template>

<script>
/**
 * 认证类型选择弹窗
 * @by oh-my-zerone 2026-06-24
 */
// const
import { LEADER_TYPE } from '@/common/constants/auth';

export default {
    name: 'AuthTypeModal',
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        value: {
            type: Number,
            default: LEADER_TYPE.ENTERPRISE,
        },
    },
    data() {
        return {
            LEADER_TYPE,
            selected: LEADER_TYPE.ENTERPRISE,
        };
    },
    watch: {
        visible(val) {
            if (val) {
                this.selected = this.value ?? LEADER_TYPE.ENTERPRISE;
            }
        },
    },
    methods: {
        handleCancel() {
            this.$emit('cancel');
        },
        handleConfirm() {
            this.$emit('confirm', this.selected);
        },
    },
};
</script>

<style lang="scss" scoped>
.auth-type-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;

    &__mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.45);
    }

    &__panel {
        position: relative;
        z-index: 1;
        width: 560rpx;
        padding: 36rpx 40rpx;
        background: #f7f7f7;
        border-radius: 20rpx;
        box-sizing: border-box;
    }

    &__title {
        text-align: center;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 50rpx;
    }

    &__options {
        display: flex;
        justify-content: center;
        margin-bottom: 60rpx;
    }

    &__option {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #333;
        &:not(:last-child) {
            margin-right: 60rpx;
        }
    }

    &__radio {
        width: 32rpx;
        height: 32rpx;
        margin-right: 12rpx;
        border: 2rpx solid #c0c4cc;
        border-radius: 50%;
        box-sizing: border-box;
        position: relative;

        &--checked {
            border-color: #3a65ff;

            &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16rpx;
                height: 16rpx;
                transform: translate(-50%, -50%);
                background: #3a65ff;
                border-radius: 50%;
            }
        }
    }

    &__actions {
        display: flex;
        gap: 24rpx;
    }

    &__btn {
        flex: 1;
        height: 72rpx;
        line-height: 72rpx;
        text-align: center;
        border-radius: 8rpx;
        font-size: 28rpx;

        &--ghost {
            color: #333;
            background: #fff;
            border: 1rpx solid #dcdfe6;
        }

        &--primary {
            color: #fff;
            background: linear-gradient(90deg, #3a65ff 0%, #5c8bfe 100%);
        }
    }
}
</style>
