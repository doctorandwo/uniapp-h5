<!--
 * @by oh-my-zerone 2026-10-19
 * 常用地址卡片：展示地址别名 / 详细地址 / 联系人 / 联系电话 / 地址类型
 * 遵循跨端约束：只接收可序列化的数据 props，操作通过 $emit 上抛纯数据
-->
<template>
    <view class="address-card">
        <view class="address-card__head">
            <text class="address-card__alias">{{ item.addressAlias || '未命名地址' }}</text>
            <text class="address-card__type" :class="typeClass">{{ item.addressTypeText || '装货' }}</text>
        </view>
        <view class="address-card__detail">{{ item.detailText || '暂无详细地址' }}</view>
        <view class="address-card__meta">
            <text class="address-card__contact">{{ item.contact || '暂无联系人' }}</text>
            <text class="address-card__phone">{{ item.contactPhone || '暂无电话' }}</text>
        </view>
        <view class="address-card__divider"></view>
        <view class="address-card__actions">
            <view class="address-card__action" hover-class="address-card__action--hover" @click="onAction('edit')">
                <text class="address-card__action-text">编辑</text>
            </view>
            <view
                class="address-card__action address-card__action--danger"
                :class="{ 'address-card__action--loading': deleting }"
                :hover-class="deleting ? 'none' : 'address-card__action--hover'"
                @click="onAction('delete')"
            >
                <!-- @by oh-my-zerone 删除中：转圈 + 文案替换，并拦截重复点击 -->
                <text v-if="deleting" class="address-card__action-spinner"></text>
                <text class="address-card__action-text">{{ deleting ? '删除中' : '删除' }}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'AddressCard',
    props: {
        /**
         * 卡片数据（纯数据对象，由父级下发）
         */
        item: {
            type: Object,
            default: () => ({}),
        },
        /**
         * 是否正在删除该卡片（纯布尔，可序列化，符合跨端约束）
         * @by oh-my-zerone
         */
        deleting: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * 地址类型标签样式类
         * @returns {string} 样式类名
         */
        typeClass() {
            return Number(this.item.addressType) === 2 ? 'address-card__type--unload' : 'address-card__type--load';
        },
    },
    methods: {
        /**
         * 卡片操作点击：上抛纯数据事件（id + action 字符串），由页面处理
         * @param {string} action 操作类型（edit / delete）
         * @returns {void}
         */
        onAction(action) {
            // 删除中拦截重复触发，交由页面侧 deleting 状态兜底
            if (action === 'delete' && this.deleting) return;
            this.$emit('action', { id: this.item.id, action });
        },
    },
};
</script>

<style lang="scss" scoped>
$primary: #3a65ff;

.address-card {
    margin-bottom: 24rpx;
    padding: 28rpx 28rpx 0;
    background-color: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 6rpx 20rpx 0 rgba(198, 203, 217, 0.18);
    box-sizing: border-box;

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__alias {
        flex: 1;
        min-width: 0;
        margin-right: 16rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__type {
        flex-shrink: 0;
        padding: 4rpx 16rpx;
        font-size: 22rpx;
        line-height: 32rpx;
        border-radius: 8rpx;

        &--load {
            color: $primary;
            background-color: rgba(58, 101, 255, 0.1);
        }

        &--unload {
            color: #ff7a1a;
            background-color: rgba(255, 122, 26, 0.1);
        }
    }

    &__detail {
        margin-top: 16rpx;
        font-size: 26rpx;
        line-height: 38rpx;
        color: #666666;
        word-break: break-all;
    }

    &__meta {
        display: flex;
        align-items: center;
        margin-top: 12rpx;
        font-size: 26rpx;
        color: #333333;
    }

    &__contact {
        max-width: 240rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__phone {
        margin-left: 24rpx;
        color: #666666;
    }

    &__divider {
        height: 2rpx;
        margin-top: 24rpx;
        background-color: #f0f0f0;
    }

    &__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 88rpx;
    }

    &__action {
        padding: 0 12rpx;
        height: 88rpx;
        display: flex;
        align-items: center;

        & + & {
            margin-left: 40rpx;
        }

        &--danger {
            .address-card__action-text {
                color: #f5544b;
            }
        }

        /* 删除中：弱化且不响应 hover，配合 loading 文案 */
        &--loading {
            opacity: 0.6;
        }

        &--hover {
            opacity: 0.6;
        }
    }

    &__action-text {
        font-size: 28rpx;
        color: #333333;
    }

    /* 删除转圈：使用危险色 #f5544b，与「删除中」文案同色 */
    &__action-spinner {
        flex-shrink: 0;
        width: 24rpx;
        height: 24rpx;
        margin-right: 10rpx;
        border: 4rpx solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        color: #f5544b;
        animation: address-card-spin 0.7s linear infinite;
    }
}

@keyframes address-card-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
