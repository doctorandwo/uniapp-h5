<template>
    <view class="c-check-box" :class="['c-check-box--' + shape]" :style="{ width: size, height: size }" @click.stop="toggleCheck">
        <view class="checked" v-show="checked">
            <image class="checked-image" :src="checkedImage" />
        </view>
        <view class="empty" :class="{ 'is-disabled': disabled }" :style="{ borderColor: inactiveColor }" v-show="!checked"></view>
    </view>
</template>

<script>
export default {
    props: {
        checked: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: '32rpx',
        },
        shape: {
            type: String,
            default: 'circle',
            validator: value => ['circle', 'rect'].includes(value),
        },
        activeColor: {
            type: String,
            default: '#3a65ff',
        },
        inactiveColor: {
            type: String,
            default: '#ddd',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        checkedImage() {
            const iconName = this.shape === 'rect' ? 'icon-checked-rect' : 'icon-checked';
            return this.$global.getImageUrl(`common/${iconName}.png`);
        },
    },
    methods: {
        toggleCheck() {
            if (this.disabled) {
                return;
            }
            this.$emit('change', !this.checked);
        },
    },
};
</script>

<style lang="scss" scoped>
.c-check-box {
    .empty {
        box-sizing: border-box;
        border: 3rpx solid #dddddd;
        width: 100%;
        height: 100%;
        &.is-disabled {
            background-color: rgba($color: #ddd, $alpha: 0.5);
        }
    }
    .checked {
        width: 100%;
        height: 100%;
        &-image {
            width: 100%;
            height: 100%;
        }
    }
    &--circle {
        .empty,
        .checked {
            border-radius: 50%;
        }
    }
    &--rect {
        .empty,
        .checked {
            border-radius: 6rpx;
        }
    }
}
</style>
