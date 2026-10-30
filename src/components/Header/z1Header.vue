<template>
    <!-- 二次封装z1-nav-bar，方便通用参数的统一管理 -->
    <view>
        <!-- g-z1-header: 全局样式选择器 -->
        <!-- #ifdef H5 -->
        <z1-nav-bar
            enterpriseCode="123"
            ref="z1HeaderRef"
            class="z1-header g-z1-header"
            :appIcon="appIcon"
            :appName="appName"
            :title="title || isHeaderTitle"
            :showEnterprise="showEnterprise"
            :showNetWork="showNetWork"
            :backgroundColor="backgroundColor"
            :dark="dark"
            :hasBack="hasBack"
            :showCachet="isJsBridge ? showCachet : false"
            :safeArea="false"
            :showAppInfo="false"
            :style="{ zIndex: headerZIndex, backgroundImage: backgroundImage || (bgImage ? `url(${bgImage})` : '') }"
            :statusBarHeight="statusBarHeight"
            v-bind="$attrs"
        >
            <template v-if="this.$slots.default" slot="title">
                <slot></slot>
            </template>
            <template slot="extra">
                <slot name="extra"></slot>
            </template>
        </z1-nav-bar>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="z1-header" :style="[{ height: fixedHeaderHeight }, { zIndex: headerZIndex }, { backgroundColor }]">
            <!-- 状态栏 -->
            <view :style="{ height: statusHeight + 'px' }" />

            <view class="top-title flex align-center" :style="{ width: `calc(100vw - ${menuButtonInfo.width}px)`, height: headerHight + 'px' }">
                <view v-if="hasBack" class="icon-back" @click="onBackHome">
                    <uni-icons type="left" size="40rpx" :color="dark ? '#fff' : '#000'" />
                </view>
                <view v-if="titleView" class="title ly-flex-1 g-single-row" :class="{ dark }">{{ titleView }}</view>
                <slot></slot>
                <slot name="extra"></slot>
                <slot name="action"></slot>
            </view>
        </view>
        <!-- #endif -->
        <view :style="{ height: fixedHeight }" />
        <!-- #ifdef MP-WEIXIN -->
        <view :style="{ height: _wxPolyfillHeight, backgroundColor }" />
        <!-- #endif -->
    </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
    name: 'Z1Header',
    props: {
        appIcon: {
            type: String,
            default: 'null',
        },
        appName: {
            type: String,
            default: 'null',
        },
        isHeaderTitle: { type: String, default: '' },
        title: {
            type: String,
            default: '',
        },
        showEnterprise: {
            type: Boolean,
            default: false,
        },
        showNetWork: {
            type: Boolean,
            default: false,
        },
        backgroundColor: {
            type: String,
            default: 'rgba(255, 255, 255, 0)',
        },
        hasBack: {
            type: Boolean,
            default: true,
        },
        dark: {
            type: Boolean,
            default: false,
        },
        showCachet: {
            type: Boolean,
            default: false,
        },
        isCustomBackHome: Boolean,
        zIndex: {
            type: [Number, String, Boolean],
            default: false,
        },
        bgImage: {
            type: String,
            default: '',
        },
        noFixedHeight: {
            type: Boolean,
            default: false,
        },
        backgroundImage: {
            type: String,
            default: '',
        },
        wxPolyfillHeight: {
            type: String,
            default: () => '22rpx',
        },
    },
    data() {
        return {
            headerHeight: 0,
            isJsBridge: false,
            menuButtonInfo: {},
        };
    },
    computed: {
        ...mapState({
            statusBarHeight: state => state.header.statusBarHeight,
            headerZIndex(state) {
                return this.zIndex || state.header.headerZIndex;
            },
        }),
        statusHeight() {
            let headerTop = 0;
            // #ifdef MP-WEIXIN
            headerTop = this.menuButtonInfo.top;
            // #endif
            // #ifdef H5
            headerTop = this.statusBarHeight || uni.getStorageSync('statusBarHeight') || 0;
            // #endif
            return headerTop;
        },
        fixedHeaderHeight() {
            return this.statusHeight + this.headerHight;
        },
        headerHight() {
            let height = 88;
            if (this.menuButtonInfo && this.menuButtonInfo.height) {
                height = this.menuButtonInfo.height;
            }
            return height;
        },
        fixedHeight() {
            if (this.noFixedHeight) return 0;
            const h = this.headerHeight ? this.headerHeight : this.fixedHeaderHeight;
            return h + 'px';
        },
        _wxPolyfillHeight() {
            if (this.noFixedHeight) return 0;
            return this.wxPolyfillHeight;
        },
        titleView() {
            return this.title || this.isHeaderTitle || '';
        },
    },
    async mounted() {
        this.isJsBridge = await uni.useCanIUseJsBridge();
        // #ifdef MP-WEIXIN
        // 获取胶囊按钮位置信息
        this.menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        console.log('this.menuButtonInfo:', this.menuButtonInfo);
        // #endif
        this.$nextTick(() => {
            const query = uni.createSelectorQuery().in(this);
            query
                .select('.g-z1-header')
                .boundingClientRect(rect => {
                    if (rect) {
                        this.headerHeight = rect.height;
                    }
                })
                .exec();
        });
    },
    methods: {
        ...mapMutations(['SET_ENTERPRISE_CODE', 'SET_NETWORK_CODE']),
        onBack() {
            console.log('测试');

            this.$emit('back');
        },
        replace() {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1].$page;
            let url = currentPage.fullPath;
            if (currentPage.options) {
                currentPage.options.enterpriseCode = this.enterpriseCode;
                currentPage.options.networkCode = this.networkCode;
                url = currentPage.path + '?';
                for (let key in currentPage.options) {
                    url = url + `&${key}=${currentPage.options[key]}`;
                }
            }
            console.log('url:', url);
            uni.reLaunch({ url });
        },
        /** 回到首页 */
        onBackHome(pages) {
            // 自定义方法
            if (!!this.isCustomBackHome) {
                this.$emit('customBackHome', pages);
                return;
            }
            // 通用方法
            if (uni.webView) {
                uni.webView.navigateBack({
                    delta: pages.length - 1,
                });
                return;
            }
            // 获取详情
            const pagesList = getCurrentPages();
            const currentPage = pagesList[pagesList.length - 1];
            if (pagesList.length > 1) {
                uni.navigateBack({
                    delta: (pages.length || 2) - 1,
                });
            } else {
                uni.reLaunch({
                    url: '/pages/home/index',
                });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
%bg-style {
    background-size: 100% !important;
    background-repeat: no-repeat !important;
    background-position: top left !important;
    background-attachment: fixed !important;
}
.z1-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    @extend %bg-style;
    ::v-deep .extra {
        font-size: 28upx;
    }
}

.top-title {
    // height: 78rpx;
    // width: calc(100vw - 180upx); // 不算胶囊按钮占位
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    .icon-back {
        border: 10rpx solid transparent;
        border-top-width: 5rpx;
        border-left-width: 0;
        border-bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .back {
        margin-right: 20rpx;
        &.dark {
            color: #fff;
        }
    }
    .title {
        min-width: 0;
        font-size: 36rpx;
        font-family: PingFang SC;
        font-weight: bold;
        color: #333;
        &.dark {
            color: #fff;
        }
    }
}
</style>
