<!--
    二级页面容器组件 SubPageLayout
    统一承载「Header + 内容区 + 底部操作栏」三段骨架，内容区通过默认 slot 暴露给页面
    @by oh-my-zerone
-->
<template>
    <view class="sub-page-layout" :style="rootStyle">
        <!-- 头部：默认使用 z1Header（自带两端占位高度），可通过 header slot 整体替换 -->
        <slot name="header">
            <Z1Header
                v-if="showHeader"
                class="sub-page-layout__header"
                :title="title"
                :hasBack="hasBack"
                :backgroundColor="headerBackground"
                :backgroundImage="headerBgImage"
                :dark="dark"
                :zIndex="headerZIndex"
                :noFixedHeight="noFixedHeight"
                :isCustomBackHome="isCustomBackHome"
                @customBackHome="onCustomBackHome"
            >
                <slot name="headerTitle"></slot>
                <template slot="extra">
                    <slot name="headerExtra"></slot>
                </template>
            </Z1Header>
        </slot>

        <!--
            内容区：占满剩余高度，内部滚动；无底部栏时额外让出安全区
            注：小程序端同一模板内不允许出现两个默认 slot，故统一使用 scroll-view，
            通过 scroll-y 控制是否由本层滚动（关闭时本层固定高度不滚动，slot 内自行滚动）
        -->
        <view class="sub-page-layout__body" :class="{ 'sub-page-layout__body--safe': safeArea && !hasFooter }">
            <scroll-view
                class="sub-page-layout__scroll"
                :class="{ 'sub-page-layout__scroll--static': !scrollable }"
                :scroll-y="scrollable"
                :scroll-top="scrollTop"
                :scroll-with-animation="scrollWithAnimation"
                :scroll-into-view="scrollIntoViewId"
                :refresher-enabled="refresherEnabled"
                :refresher-triggered="refresherTriggered"
                @scroll="onScroll"
                @scrolltolower="onScrollToLower"
                @refresherrefresh="onRefresherRefresh"
            >
                <view
                    class="sub-page-layout__content"
                    :class="{ 'sub-page-layout__content--fill': !scrollable }"
                    :style="{ padding: bodyPadding }"
                >
                    <slot></slot>
                </view>
            </scroll-view>
        </view>

        <!-- 底部操作栏：有 footer slot 或声明式按钮时才渲染，避免产生空白区 -->
        <view
            v-if="hasFooter"
            class="sub-page-layout__footer"
            :class="{ 'sub-page-layout__footer--safe': safeArea, 'sub-page-layout__footer--shadow': footerShadow }"
            :style="{ backgroundColor: footerBg }"
        >
            <slot name="footer">
                <view class="sub-page-layout__btns">
                    <view
                        v-for="btn in footerButtons"
                        :key="btn.key"
                        class="sub-page-layout__btn"
                        :class="[
                            `sub-page-layout__btn--${btn.type || 'default'}`,
                            {
                                'sub-page-layout__btn--disabled': btn.disabled,
                                'sub-page-layout__btn--loading': btn.loading,
                            },
                        ]"
                        :hover-class="btn.disabled || btn.loading ? 'none' : 'sub-page-layout__btn--hover'"
                        @click="onFooterClick(btn)"
                    >
                        <!-- @by oh-my-zerone 按钮加载态：转圈 + 可替换文案，期间拦截点击 -->
                        <text v-if="btn.loading" class="sub-page-layout__btn-spinner"></text>
                        <text class="sub-page-layout__btn-text">{{ btn.loading && btn.loadingText ? btn.loadingText : btn.text }}</text>
                    </view>
                </view>
            </slot>
        </view>
    </view>
</template>

<script>
// components
import Z1Header from '@/components/Header/z1Header.vue';

export default {
    name: 'SubPageLayout',
    components: { Z1Header },
    props: {
        /** Header 标题 */
        title: {
            type: String,
            default: '',
        },
        /** Header 是否显示返回箭头 */
        hasBack: {
            type: Boolean,
            default: true,
        },
        /** Header 背景色，可传 transparent / 渐变字符串 */
        headerBackground: {
            type: String,
            default: '#ffffff',
        },
        /** Header 背景图/渐变；为空时使用 headerBackground */
        headerBgImage: {
            type: String,
            default: '',
        },
        /** Header 深色模式（标题与图标反色） */
        dark: {
            type: Boolean,
            default: false,
        },
        /** 是否渲染 Header */
        showHeader: {
            type: Boolean,
            default: true,
        },
        /** Header 层级；为空时使用 vuex 中的 header.headerZIndex */
        headerZIndex: {
            type: [Number, String],
            default: '',
        },
        noFixedHeight: {
            type: Boolean,
            default: false,
        },
        /** 是否拦截 Header 返回行为（拦截后抛出 customBackHome） */
        isCustomBackHome: {
            type: Boolean,
            default: false,
        },
        /** 页面背景色，支持渐变字符串（如 linear-gradient(...)） */
        bg: {
            type: String,
            default: '#f3f3f3',
        },
        /** 页面背景图；优先于 bg 作为 background-image */
        bgImage: {
            type: String,
            default: '',
        },
        /** 内容区内边距 */
        bodyPadding: {
            type: String,
            default: '0 32rpx',
        },
        /**
         * 内容区是否由本层 scroll-view 承载滚动
         * 关闭后本层固定高度且不滚动，内容区高度撑满，由 slot 内自行划分固定区与滚动区
         */
        scrollable: {
            type: Boolean,
            default: true,
        },
        /** scroll-view 滚动是否使用动画（影响 scrollToTop 表现） */
        scrollWithAnimation: {
            type: Boolean,
            default: false,
        },
        /** 是否开启下拉刷新 */
        refresherEnabled: {
            type: Boolean,
            default: false,
        },
        /** 下拉刷新状态（受控，需页面在刷新结束后置回 false） */
        refresherTriggered: {
            type: Boolean,
            default: false,
        },
        /**
         * 底部声明式按钮；存在 footer slot 时本配置不生效
         * 单项结构：{ key: string, text: string, type: 'primary' | 'default', disabled?: boolean,
         * loading?: boolean, loadingText?: string }
         * loading 为 true 时展示转圈并拦截点击；loadingText 存在时替换按钮文案
         */
        footerButtons: {
            type: Array,
            default: () => [],
            validator: list => list.every(item => item && typeof item.key === 'string'),
        },
        /** 底部栏背景色 */
        footerBg: {
            type: String,
            default: '#ffffff',
        },
        /** 底部栏顶部投影 */
        footerShadow: {
            type: Boolean,
            default: true,
        },
        /** 底部安全区适配（iPhone Home Indicator） */
        safeArea: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            /** scroll-view 受控滚动位置 */
            scrollTop: 0,
            /** 最近一次滚动位置，用于解决视图层与逻辑层不同步导致 scrollTop 相同值不生效 */
            oldScrollTop: 0,
            /** scroll-into-view 目标 id */
            scrollIntoViewId: void 0,
        };
    },
    computed: {
        /**
         * 根节点内联样式
         * 注意：小程序端 :style 只接收字符串（对象字面量会被编译期转义，
         * 变量对象不会），故此处必须拼接字符串而非返回对象，否则根节点渲染异常
         * @returns {string} 内联样式字符串，如 'background-color:#f3f3f3;'
         */
        rootStyle() {
            let style = '';
            const bg = (this.bg || '').trim();
            if (/gradient|url\(/.test(bg)) {
                style += `background-image:${bg};`;
            } else if (bg) {
                style += `background-color:${bg};`;
            }
            if (this.bgImage) {
                style += `background-image:url(${this.bgImage});`;
            }
            return style;
        },
        /** 是否渲染底部栏：footer slot 或声明式按钮任意存在即渲染 */
        hasFooter() {
            return !!this.$slots.footer || (this.footerButtons && this.footerButtons.length > 0);
        },
    },
    methods: {
        /**
         * 内容区滚动回调
         * @param {Object} e - scroll-view scroll 事件对象
         * @returns {void}
         */
        onScroll(e) {
            this.oldScrollTop = (e.detail && e.detail.scrollTop) || 0;
            this.$emit('scroll', this.oldScrollTop);
        },
        /** 内容区触底回调：透传 scrolltolower，与原生 scroll-view 事件同名，跨端命名零风险 */
        onScrollToLower() {
            this.$emit('scrolltolower');
        },
        /** 下拉刷新触发回调 */
        onRefresherRefresh() {
            this.$emit('refresherrefresh');
        },
        /**
         * 声明式按钮点击：只上抛可序列化的 key，遵循跨端约束（不传递函数）
         * @param {Object} btn - 按钮配置项
         * @returns {void}
         */
        onFooterClick(btn) {
            if (!btn || btn.disabled || btn.loading) return;
            this.$emit('footer-click', btn.key);
        },
        /**
         * Header 返回拦截回调
         * @param {Array} pages - 页面栈
         * @returns {void}
         */
        onCustomBackHome(pages) {
            this.$emit('customBackHome', pages);
        },
        /** 内容区滚动到顶部 */
        scrollToTop() {
            if (!this.scrollable) return;
            // 先还原为旧值，再置 0，避免值未变化导致视图层不响应
            this.scrollTop = this.oldScrollTop;
            this.$nextTick(() => {
                this.scrollTop = 0;
            });
        },
        /**
         * 内容区滚动到指定元素
         * @param {string} id - 目标元素 id（不带 #）
         * @returns {void}
         */
        scrollIntoView(id) {
            if (!this.scrollable || !id) return;
            this.scrollIntoViewId = id;
            this.$nextTick(() => {
                this.scrollIntoViewId = void 0;
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

$primary: #3a65ff; // 项目主色，与 uni.scss 的 $uni-color-primary 保持一致

.sub-page-layout {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    // 两端高度基准不同：小程序页面根节点无高度，H5 依赖 uni-page-body 的 height: 100%
    // #ifdef MP-WEIXIN
    height: 100vh;
    // #endif
    // #ifdef H5
    height: 100%;
    // #endif
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: top left;

    /* 内容区：占据剩余高度并内部滚动；min-height: 0 是 H5 下 flex 子项可滚动的关键 */
    &__body {
        flex: 1;
        min-height: 0;
        overflow: hidden;

        /* 无底部栏时让出安全区，避免内容被 Home Indicator 遮挡 */
        &--safe {
            margin-bottom: constant(safe-area-inset-bottom);
            margin-bottom: env(safe-area-inset-bottom);
        }
    }

    /* 滚动容器：两端都需要显式高度，否则高度由内容撑开不会触发滚动 */
    &__scroll {
        height: 100%;
        width: 100%;
        box-sizing: border-box;

        /* 未启用本层滚动时仍保持固定高度，超出部分裁剪，由 slot 内的滚动容器承载滚动 */
        &--static {
            overflow: hidden;
        }
    }

    /* 内容区：本层不滚动时撑满容器高度，供页面内部自行划分固定区与滚动区 */
    &__content {
        &--fill {
            height: 100%;
            box-sizing: border-box;
        }
    }

    /* 底部操作栏：作为 flex 子项常驻底部，不使用 fixed，避免两端层级与预留高度不一致 */
    &__footer {
        flex-shrink: 0;
        padding: 20rpx 32rpx;
        box-sizing: border-box;

        &--safe {
            padding-bottom: constant(safe-area-inset-bottom);
            padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
            padding-bottom: env(safe-area-inset-bottom);
            padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
        }

        &--shadow {
            box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
        }
    }

    /* 按钮组：跨端 gap 兼容（H5 用 margin，小程序用 column-gap） */
    &__btns {
        display: flex;
        align-items: center;
        @include flex-gap(20rpx);
    }

    &__btn {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        font-size: 30rpx;
        font-weight: bold;
        border-radius: 16rpx;
        box-sizing: border-box;
        transition: opacity 0.15s ease;

        &--primary {
            background-color: $primary;
            color: #ffffff;
        }

        &--default {
            background-color: #ffffff;
            color: #333333;
            border: 2rpx solid #d4d4d4;
        }

        &--disabled {
            opacity: 0.45;
        }

        /* 加载态：降低不透明度并交由 onFooterClick 拦截点击 */
        &--loading {
            opacity: 0.75;
        }

        &--hover {
            opacity: 0.85;
        }
    }

    &__btn-text {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* 按钮内转圈：颜色取 currentColor，随按钮文字色自适应；currentColor + border 动画跨端稳定 */
    &__btn-spinner {
        flex-shrink: 0;
        width: 26rpx;
        height: 26rpx;
        margin-right: 12rpx;
        border: 4rpx solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        animation: sub-page-layout-spin 0.7s linear infinite;
    }
}

@keyframes sub-page-layout-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
