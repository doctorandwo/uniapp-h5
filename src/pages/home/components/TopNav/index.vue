<template>
    <view class="top-nav-wrap">
        <view class="top-nav">
            <view v-for="(item, index) in list" :key="index" class="top-nav__item" :class="{ active: item.value == active }" @click="tabChange(item)">
                <text class="top-nav__text">{{ item.label }}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => {
                return [
                    { label: '首页', value: 'home' },
                    // { label: '市场', value: 'market' },
                    { label: '资讯', value: 'news' },
                ];
            },
        },
        value: {
            type: String,
            default: '',
        },
    },
    data() {
        return {};
    },
    computed: {
        active: {
            get() {
                return this.value;
            },
            set(v) {
                this.$emit('input', v);
            },
        },
    },
    methods: {
        tabChange(item) {
            console.log(item);
            this.active = item.value;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.top-nav-wrap {
    .top-nav {
        line-height: 63rpx;
        display: flex;
        align-items: center;
        @include flex-gap(44rpx);
        &__item {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32rpx;
            color: #999;
            font-weight: bold;

            &.active {
                color: #333;
                font-weight: bold;
                font-size: 36rpx;
                animation: active-animation 0.3s;
            }
            // 加个过渡效果
            @keyframes active-animation {
                from {
                    color: #999;
                }
                to {
                    color: #333;
                    font-weight: bold;
                    font-size: 36rpx;
                }
            }
        }
    }
}
</style>
