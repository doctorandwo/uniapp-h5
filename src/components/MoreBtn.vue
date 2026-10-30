<template>
    <view class="more-btn">
        <image :src="$global.getImageUrl('pages/home/icon-more-point.png')" class="icon-more" @click.stop="showMore" v-show="btns.length" />
        <view class="dropdown-wrap" :style="{ '--btn-count': visible ? btns.length : 0 }">
            <slot name="dropdown">
                <view class="dropdown">
                    <view class="dropdown-item btn" v-for="(btn, i) in btns" :key="i" @click.stop="$emit('command', btn)"> {{ btn[labelKey] }}</view>
                </view>
            </slot>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        btns: {
            type: Array,
            default: () => [],
        },
        labelKey: {
            type: String,
            default: 'label',
        },
    },
    data() {
        return {
            visible: false,
        };
    },
    mounted() {
        uni.$on('close-all-more-btns', sourceId => {
            // sourceId 为 undefined 时（滚动触发），所有实例都关闭
            // sourceId 有值时（点击其他按钮触发），仅关闭非当前实例
            if (sourceId === undefined || this._uid !== sourceId) {
                this.visible = false;
            }
        });
    },
    beforeDestroy() {
        uni.$off('close-all-more-btns');
    },
    methods: {
        showMore() {
            this.visible = !this.visible;
            if (this.visible) {
                uni.$emit('close-all-more-btns', this._uid);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.more-btn {
    position: relative;
    $s: 32rpx;
    display: flex;
    align-items: center;
    .icon-more {
        width: $s;
        height: $s;
    }

    .dropdown-wrap {
        position: absolute;
        top: calc(#{$s} + 15rpx);
        right: -23rpx;
        z-index: 1;
        width: max-content;
        overflow: hidden;
        box-shadow: 0px 3rpx 20rpx 1rpx rgba(0, 0, 0, 0.16);
        border-radius: 8rpx;

        .dropdown {
            background-color: #fff;
            display: flex;
            flex-direction: column;
            @include flex-gap(10rpx, column);
            max-height: calc(90rpx * var(--btn-count));
            transition: max-height calc(0.1s * var(--btn-count)) ease-in-out;

            &-item {
                margin: 0 20rpx;
                padding: 20rpx 5rpx;
                border-bottom: 1rpx solid #d4d4d4;
                box-sizing: border-box;
                text-align: center;
                &.btn {
                    font-size: 24rpx;
                    font-weight: bold;
                    color: #333;
                }
                &:first-child {
                    padding-top: 20rpx;
                }
                &:last-child {
                    padding-bottom: 20rpx;
                    border-bottom: none;
                }
            }
        }
    }
}
</style>
