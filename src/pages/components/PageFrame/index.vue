<template>
    <!-- 页面布局 -->
    <div class="page-frame ly-flex-v" :style="{ 'background-color': bg, 'background-image': getBgImage(bgImg) }">
        <HeaderBg>
            <slot name="headerBg"></slot>
        </HeaderBg>
        <slot name="header">
            <Header v-if="hasHeader" :title="title" :dark="isBlack" :headBackground="headBackground" :has-back="!showTabbar">
                <slot name="headerTitle"></slot>
                <template slot="extra">
                    <slot name="headerExtra"></slot>
                </template>
            </Header>
        </slot>
        <!-- 滚动容器 -->
        <div class="page-frame__body ly-flex-1">
            <view v-if="$slots.content"><slot name="content"></slot></view>
            <scroll-view
                ref="scrollViewRef"
                style="position: relative; height: 100%; width: 100%"
                scroll-y
                :refresher-background="refresherBackground"
                :scroll-top="scrollTop"
                :scroll-with-animation="scrollWithAnimation"
                :scroll-into-view="scrollIntoViewId"
                :refresher-triggered="refresherTriggered"
                :refresher-enabled="refresherEnabled"
                @refresherrefresh="onRefresh"
                @scroll="handleScroll"
                @scrolltolower="handleReachBottom"
                v-else
            >
                <slot />
                <slot v-if="!loading" name="bottomBar" />
            </scroll-view>
            <Tabbar v-if="showTabbar" />
        </div>
        <slot name="components" />
    </div>
</template>

<script>
import Header from './Header.vue';
import HeaderBg from './HeaderBg.vue';
import Tabbar from './Tabbar.vue';
export default {
    name: 'PageFrame',
    components: {
        Header,
        HeaderBg,
        Tabbar,
    },
    props: {
        // 是否有Header组件
        hasHeader: {
            type: Boolean,
            default: true,
        },
        // 页面是否加载中
        loading: {
            type: Boolean,
            default: false,
        },
        // Header标题
        title: String,
        // Header标题背景色
        headBackground: String,
        // Header模式是否深色
        isBlack: {
            type: Boolean,
            default: false,
        },
        // 页面背景色
        bg: {
            type: String,
            default: 'transparent',
        },
        bgImg: {
            type: String,
            default: '',
        },
        withTabbarBg: {
            type: Boolean,
            default: false, // 是否显示tabbar背景
        },
        refresherBackground: {
            type: String,
            default: 'transparent',
        },
        showHeaderBg: Boolean, // 是否显示默认背景图
        showTabbar: Boolean, // 是否显示tabbar
        scrollWithAnimation: Boolean,
        refresherEnabled: Boolean,
        refresherTriggered: Boolean,
    },

    data() {
        return {
            scrollTop: 0,
            old: {
                scrollTop: 0,
            },
            scrollIntoViewId: void 0,
        };
    },
    methods: {
        handleScroll(e) {
            this.old.scrollTop = e.detail.scrollTop;
            this.$emit('handleScroll', e.detail.scrollTop);
        },
        handleReachBottom() {
            this.$emit('reachBottom');
        },
        onRefresh() {
            this.$emit('refresherrefresh');
        },
        scrollIntoView(scrollTop) {
            if (scrollTop !== undefined && scrollTop !== null) {
                // 解决view层不同步的问题
                this.scrollTop = this.old.scrollTop;
                this.$nextTick(function () {
                    this.scrollTop = scrollTop;
                });
            }
        },
        scrollIntoViewById(id) {
            console.log('scrollIntoViewById', id);
            this.scrollIntoViewId = id;
            this.$nextTick(() => {
                this.scrollIntoViewId = void 0;
            });
        },
        getBgImage(bgImg) {
            if (bgImg.includes('http')) {
                return bgImg ? `url(${bgImg})` : 'none';
            }
            /*  if (this.withTabbarBg && this.showTabbar) {
                const bg = this.bg;
                return `linear-gradient( 180deg, ${bg} 0%, ${bg} 85%, #DCE1EB 90%, #E6EDFA 100%)`;
            } */
            return bgImg ? bgImg : 'none';
        },
    },
};
</script>

<style lang="scss" scoped>
.page-frame {
    position: relative;
    // #ifdef MP-WEIXIN
    height: 100vh;
    // #endif
    // #ifdef H5
    height: 100vh;
    // #endif
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: top left;

    ::v-deep .z1-nav-bar-dark {
        background: transparent;
    }

    &__body {
        overflow: hidden;
    }
    .bottom-bg {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100rpx;
        background-color: #f7f8fc;
    }
}
</style>
