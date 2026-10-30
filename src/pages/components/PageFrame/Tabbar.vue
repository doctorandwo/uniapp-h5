<!-- @by oh-my-zerone 2026-10-09 改版：SVG 胶囊背景 + 中间凸起 AI 入口 -->
<template>
    <view class="tab-bar" :style="[{ zIndex }]" id="tabbar">
        <view class="tab-list" :style="{ backgroundImage: `url(${tabbarBgImage})` }">
            <view
                v-for="item in tabbarList"
                :class="['tab-list-item', item.isCenter ? 'is-center' : 'item-normal', { active: currentTabbar === item.pagePath }]"
                :key="item.pagePath"
                @click="navTo(item)"
            >
                <template v-if="item.isCenter">
                    <view class="tab-center" :style="{ 'background-image': `url(${getIcon(item)})` }" />
                </template>
                <template v-else>
                    <view class="tab-list-item__icon" :style="[{ 'background-image': `url(${getIcon(item)})` }, { backgroundSize: '100% 100%' }]" />
                    <view class="tab-list-item__text">{{ item.text }}</view>
                </template>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    props: {},
    data() {
        return {
            zIndex: 2,
        };
    },
    computed: {
        ...mapGetters(['tabbarList']),
        currentTabbar() {
            return this.$store.state.tabbar.currentTabbar;
        },
        // @by oh-my-zerone 2026-10-09 设计稿 tabbar 背景 SVG（经 $global.getImageUrl 解析本地/线上地址）
        tabbarBgImage() {
            return this.$global.getImageUrl('tabbar/tabbar-bg.svg');
        },
    },
    mounted() {
        this.getTabbarHeight();
    },
    methods: {
        getTabbarHeight() {
            // 获取tabbar高度
            const query = uni.createSelectorQuery().in(this);
            query
                .select('#tabbar')
                .boundingClientRect(data => {
                    this.$store.commit('SET_TABBAR_HEIGHT', data.height);
                })
                .exec();
        },
        navTo(item) {
            const { pagePath, navMethod } = item;
            if (item.isNeedLogin && !uni.onLoginStatus()) return;
            if (navMethod) {
                uni?.[navMethod]({ url: pagePath });
                return;
            }
            if (this.currentTabbar === pagePath) return;
            // 常规
            if (pagePath) {
                this.$store.dispatch('SwitchTabbar', pagePath);
            } else {
                this.$message('正在开发中，敬请期待');
            }
        },

        getIcon(item) {
            const isAcitve = this.currentTabbar === item.pagePath;
            const { getImageUrl } = this.$global;
            return isAcitve ? getImageUrl(item.selectedIconPath) : getImageUrl(item.iconPath);
        },
    },
};
</script>

<style lang="scss" scoped>
%ly-flex-pack-justify {
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
}

// 尺寸变量（与 tabbar-bg.svg 的 viewBox 比例对齐）
$center-size: 120rpx; // 中间按钮直径
$tabbar-h: 150rpx; // 含顶部凸起的总高度
$bump-h: 30rpx; // 顶部凸起预留高度（对应 SVG 缺口区域）

.tab-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 32rpx 35rpx;
    background: linear-gradient(0deg, rgba(220, 225, 235, 0.9) 0%, rgba(230, 237, 250, 0) 100%);

    .tab-list {
        position: relative;
        width: 100%;
        height: $tabbar-h;
        // 顶部预留凸起空间，使两侧 tab 落在胶囊主体区域内
        padding: $bump-h 16rpx 0;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        // @by oh-my-zerone 2026-10-09 使用设计稿 SVG 作为胶囊 + 中间缺口背景（图源由 $global.getImageUrl 注入）
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;
        overflow: visible;
        &::before {
            content: '';
            position: absolute;
            top: calc(#{$bump-h} + 5rpx);
            left: 0;
            right: 0;
            bottom: 0;
            backdrop-filter: blur(16rpx);
            border-radius: 999rpx;
            z-index: -1;
        }

        .tab-list-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            &__icon {
                width: 42rpx;
                height: 42rpx;
                transition: all 0.3s;
                margin-bottom: 6rpx;
            }

            &__text {
                color: #999;
                text-align: center;
                white-space: nowrap;
                transition: all 0.3s;
            }

            &.item-normal {
                box-sizing: border-box;
                border-radius: 47rpx;
                font-size: 20rpx;
                padding: 9rpx 0;
            }

            &.is-center {
                .tab-center {
                    width: $center-size;
                    height: $center-size;
                    background-size: 100% 100%;
                    // 抬起嵌入顶部缺口，形成凸起悬浮效果
                    margin-top: -28rpx;
                }
            }

            &.active {
                &.item-normal {
                    box-shadow: inset 0px 3rpx 4rpx 1rpx #fff;
                    background-color: #fff;
                }
                .tab-list-item__text {
                    color: #333;
                    font-weight: bold;
                }
            }
        }
    }
}
</style>
