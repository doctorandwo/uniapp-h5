<!--
    SubPageLayout 容器组件联调测试页
    覆盖验收点：Header 占位、内容区滚动、触底加载、下拉刷新、底部常驻栏 + 安全区、scrollToTop
    @by oh-my-zerone
-->
<template>
    <SubPageLayout
        ref="layoutRef"
        title="二级页面容器"
        :footer-buttons="footerButtons"
        :refresher-enabled="refresherEnabled"
        :refresher-triggered="refreshing"
        @footer-click="handleFooterClick"
        @scrolltolower="handleReachBottom"
        @refresherrefresh="handleRefresh"
    >
        <template slot="headerExtra">
            <text class="extra" @click="handleToggleRefresh">下拉刷新：{{ refresherEnabled ? '开' : '关' }}</text>
        </template>

        <view class="demo">
            <view class="demo__card">
                <view class="demo__row">
                    <text class="demo__label">列表条数</text>
                    <text class="demo__value">{{ list.length }}</text>
                </view>
                <view class="demo__row">
                    <text class="demo__label">触底次数</text>
                    <text class="demo__value">{{ reachCount }}</text>
                </view>
                <view class="demo__row">
                    <text class="demo__label">最近操作</text>
                    <text class="demo__value">{{ lastAction || '无' }}</text>
                </view>
                <view class="demo__action" hover-class="demo__action--hover" @click="handleScrollTop">回到顶部</view>
            </view>

            <view class="demo__list">
                <view v-for="item in list" :id="`item-${item}`" :key="item" class="demo__item">列表项 {{ item }}</view>
            </view>
        </view>
    </SubPageLayout>
</template>

<script>
// components
import SubPageLayout from '@/components/SubPageLayout/index.vue';

/** 每页加载条数 */
const PAGE_SIZE = 30;
/** 列表上限，用于验证触底是否停止加载 */
const MAX_SIZE = 100;

export default {
    name: 'DemoSubPageLayout',
    components: { SubPageLayout },
    data() {
        return {
            list: [],
            reachCount: 0,
            refreshing: false,
            refresherEnabled: true,
            lastAction: '',
            footerButtons: [
                { key: 'reset', text: '重置', type: 'default' },
                { key: 'save', text: '保存', type: 'primary' },
            ],
        };
    },
    created() {
        this.list = this.buildList(PAGE_SIZE);
    },
    methods: {
        /**
         * 构造序号列表
         * @param {number} size - 列表长度
         * @returns {number[]} 序号数组
         */
        buildList(size) {
            return Array.from({ length: size }, (_, index) => index + 1);
        },
        /** 触底：追加一页数据，达到上限后停止（注意：方法名不能与 uni-app 生命周期同名，如 onReachBottom） */
        handleReachBottom() {
            this.reachCount += 1;
            if (this.list.length >= MAX_SIZE) return;
            const next = Math.min(this.list.length + PAGE_SIZE, MAX_SIZE);
            this.list = this.buildList(next);
        },
        /** 下拉刷新：重置列表 */
        handleRefresh() {
            this.refreshing = true;
            setTimeout(() => {
                this.list = this.buildList(PAGE_SIZE);
                this.reachCount = 0;
                this.refreshing = false;
            }, 800);
        },
        /** 切换下拉刷新开关 */
        handleToggleRefresh() {
            this.refresherEnabled = !this.refresherEnabled;
            this.lastAction = `下拉刷新：${this.refresherEnabled ? '开' : '关'}`;
        },
        /**
         * 底部按钮点击
         * @param {string} key - 按钮 key
         * @returns {void}
         */
        handleFooterClick(key) {
            this.lastAction = `底部按钮：${key}`;
            uni.showToast({ title: `点击了 ${key}`, icon: 'none' });
        },
        /** 调用容器暴露的滚动方法回到顶部 */
        handleScrollTop() {
            this.lastAction = '回到顶部';
            this.$refs.layoutRef && this.$refs.layoutRef.scrollToTop();
        },
    },
};
</script>

<style lang="scss" scoped>
.extra {
    font-size: 26rpx;
    color: #3a65ff;
}

.demo {
    padding-top: 20rpx;

    &__card {
        background-color: #ffffff;
        border-radius: 16rpx;
        padding: 0 24rpx 24rpx;
    }

    &__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 88rpx;
        border-bottom: 1rpx solid #f5f5f5;
    }

    &__label {
        font-size: 30rpx;
        font-weight: bold;
        color: #1a1a1a;
    }

    &__value {
        font-size: 28rpx;
        color: #666666;
    }

    &__action {
        margin-top: 24rpx;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        font-size: 30rpx;
        font-weight: bold;
        color: #3a65ff;
        background-color: #f2f5ff;
        border-radius: 16rpx;

        &--hover {
            background-color: #e3eaff;
        }
    }

    &__list {
        margin-top: 20rpx;
        background-color: #ffffff;
        border-radius: 16rpx;
        overflow: hidden;
    }

    &__item {
        height: 100rpx;
        line-height: 100rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333333;
        border-bottom: 1rpx solid #f5f5f5;
    }

    &__item:last-child {
        border-bottom: 0;
    }
}
</style>
