<template>
    <!-- @by oh-my-zerone 2026-10-09 AI 中心 tabbar 页（占位骨架） -->
    <PageFrame class="page-ai" bg="#F0F2F6" showTabbar>
        <view class="page-ai__body">
            <view class="page-ai__placeholder">AI 智能助手</view>
        </view>
    </PageFrame>
</template>

<script>
// @by oh-my-zerone 2026-10-09 AI 中心 tabbar 页（占位）
import PageFrame from '@/pages/components/PageFrame/index.vue';

export default {
    name: 'PageAi',
    components: {
        PageFrame,
    },
};
</script>

<style lang="scss" scoped>
.page-ai {
    &__body {
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 28rpx;
    }
}
</style>
