<template>
    <view class="quick-menu">
        <view class="quick-menu__item" v-for="item in processedList" :key="item.key" @click="onClickItem(item)">
            <view class="quick-menu__icon">
                <image v-if="item.icon" :src="$global.getImageUrl(item.icon)" class="icon-img" />
                <view v-else class="icon-placeholder"></view>
            </view>
            <view class="quick-menu__label">{{ item.label }}</view>
            <view class="quick-menu__sub-label">{{ item.subLabel }}</view>
        </view>
    </view>
</template>

<script>
// const（菜单 key -> 页面路径，未配置的 key 保持占位行为）
const MENU_PAGE_MAP = {
    address: '/pages_user/addressBook/list/index',
    // @by oh-my-zerone 2026-10-27 收藏运力 → 常用（收藏）司机列表
    favorite: '/pages_user/transportCapacity/collectList/index',
};

export default {
    name: 'QuickMenu',
    props: {
        /**
         * 菜单列表：[{ key, label, subLabel, icon }]
         */
        list: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        /**
         * 菜单列表处理：subLabel 中嵌入的数量超过 99 时统一显示为 99+
         * 数量格式化逻辑由页面下沉至本组件，页面只负责下发原始数据
         * @returns {Array<{key:string,label:string,subLabel:string,icon:string}>}
         */
        processedList() {
            // @by oh-my-zerone
            return this.list.map(item => ({
                ...item,
                subLabel: String(item.subLabel).replace(/\d+/, match => {
                    const num = Number(match);
                    return num > 99 ? '99+' : match;
                }),
            }));
        },
    },
    methods: {
        /**
         * 点击菜单项：命中映射则跳转对应页面，未配置的 key 保持占位
         * @param {{key:string}} item 菜单项
         */
        onClickItem(item) {
            const url = MENU_PAGE_MAP[item.key];
            if (!url) {
                // @by oh-my-zerone 未配置页面的菜单项保持占位
                console.log('quick menu click', item.key);
                return;
            }
            uni.navigateTo({ url });
        },
    },
};
</script>
<style lang="scss" scoped>
.quick-menu {
    margin: 30rpx 32rpx 0;
    padding: 28rpx 22rpx;
    display: flex;
    border-radius: 20rpx;
    background: #fff;
    box-shadow: 0px 6rpx 20rpx 0px rgba(198, 203, 217, 0.18);
    overflow-y: auto;

    &__item {
        flex-shrink: 0;
        width: 120rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        & + & {
            margin-left: 54rpx;
        }
    }
    &__icon {
        $s: 80rpx;
        width: $s;
        height: $s;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon-img {
            width: 100%;
            height: 100%;
            border-radius: 16rpx;
        }
        .icon-placeholder {
            width: 100%;
            height: 100%;
            border-radius: 16rpx;
            background: #eef1f7;
        }
    }
    &__label {
        margin-top: 4rpx;
        font-size: 24rpx;
        line-height: 32rpx;
        color: #333;
        font-weight: bold;
    }
    &__sub-label {
        margin-top: 6rpx;
        font-size: 20rpx;
        line-height: 28rpx;
        color: #808080;
    }
}
</style>
