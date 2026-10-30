<template>
    <scroll-view
        class="section-tab"
        enable-flex
        :scroll-into-view="scrollIntoViewId"
        scroll-x
        scroll-with-animation
        :style="{ '--active-color': activeColor, '--inactive-color': inactiveColor, '--active-bg-color': activeBgColor, '--inactive-bg-color': inactiveBgColor }"
    >
        <view v-for="(tab, i) in tabs" :key="i" :id="`tab-${i}`" class="tab-item" :class="{ active: active == tab[valueKey] }" @click="tabChange(tab, i)">
            {{ tab[labelKey] }}
        </view>
    </scroll-view>
</template>

<script>
export default {
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        value: {
            type: [String, Number],
            default: '',
        },
        labelKey: {
            type: String,
            default: 'label',
        },
        valueKey: {
            type: String,
            default: 'value',
        },
        activeColor: {
            type: String,
            default: '#3a56ff',
        },
        activeBgColor: {
            type: String,
            default: '#fff',
        },
        inactiveColor: {
            type: String,
            default: '#333',
        },
        inactiveBgColor: {
            type: String,
            default: '#fff',
        },
    },

    data() {
        return {
            scrollIntoViewId: '', // 滚动目标 ID
        };
    },
    computed: {
        active: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    methods: {
        tabChange(tab, i) {
            this.active = tab.value;
            this.$emit('change', tab);

            // 将当前点击的项滚动到视图中间
            this.$nextTick(() => {
                const ti = i >= 1 ? i - 1 : i;
                this.scrollIntoViewId = 'tab-' + ti;
            });
        },
    },
};
</script>

<style lang="scss" scoped>
$gap: 20rpx;
.section-tab {
    height: 47rpx;
    display: flex;

    /deep/ .uni-scroll-view-content {
        display: flex;
    }

    .tab-item {
        flex-shrink: 0;
        padding: 8rpx 20rpx;
        border-radius: 4rpx;
        background-color: var(--inactive-bg-color);
        color: var(--inactive-color);
        font-size: 24rpx;
        font-weight: bold;
        margin-left: $gap;
        height: max-content;
        &:first-child {
            margin-left: 0;
        }

        &.active {
            color: var(--active-color);
            background-color: var(--active-bg-color);
        }
    }
}
</style>
