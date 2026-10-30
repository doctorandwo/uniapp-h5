<template>
    <view class="tab-scroll-panel">
        <!-- 主签：选中为蓝色渐变块 + 底部缺口指针 -->
        <view class="main-tabs">
            <view v-for="item in tabs" :key="item.value" class="tab" :class="{ active: current === item.value }" @click.stop="tabClick(item)">
                <text class="tab__label">{{ item.label }}</text>
                <view v-if="current === item.value" class="tab__pointer" />
            </view>
        </view>

        <view class="content-panel" :style="{ paddingTop: subTabs.length ? '0rpx' : '40rpx' }">
            <!-- 顶部磨砂条（固定高度独立层，不随列表滚动） -->
            <view class="frost-strip" />
            <!-- 子签（白色胶囊按钮），传空数组则不显示 -->
            <view v-if="subTabs.length" class="sub-tabs">
                <text v-for="item in subTabs" :key="item.value" class="sub-tab" :class="{ active: subCurrent === item.value }" @click.stop="subTabClick(item)">
                    {{ item.label }}
                </text>
            </view>

            <scroll-view
                class="scroll"
                refresher-background="transparent"
                :refresher-triggered="refresherTriggered"
                scroll-y
                refresher-enabled
                @scrolltolower="$emit('scrolltolower')"
                @refresherrefresh="$emit('refresherrefresh')"
            >
                <slot />
            </scroll-view>
        </view>
    </view>
</template>

<script>
/**
 * 渐变页签 + 磨砂面板滚动容器
 * 用法：<TabScrollPanel v-model="tab" :tabs="tabs" :subTabs="[]" :subValue.sync="sub" :refresherTriggered="triggered"
 *          @change="onTab" @subChange="onSub" @scrolltolower="loadMore" @refresherrefresh="refresh">列表内容放默认插槽</TabScrollPanel>
 * 注意：组件需撑满父容器剩余高度，父容器需为 flex 纵向布局并提供高度（如 PageFrame 默认插槽内 height:100% 的容器）。
 * mp-weixin 下组件宿主节点默认不参与父级 flex 布局，组件内已用 :host 兜底；若个别基础库不生效，
 * 使用方给组件加一个类名并设置 flex:1; min-height:0; display:flex; flex-direction:column 即可（参考 pages_waybill/accountBill/index.vue 的 .panel-fill）
 */
export default {
    name: 'TabScrollPanel',
    props: {
        /* 主签 [{ label, value }]，label 由父级拼装（可含数量） */
        tabs: { type: Array, default: () => [] },
        value: { type: [String, Number], default: '' },
        /* 子签 [{ label, value }]，空数组不渲染 */
        subTabs: { type: Array, default: () => [] },
        subValue: { type: [String, Number], default: '' },
        refresherTriggered: { type: Boolean, default: false },
    },
    computed: {
        current: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
        subCurrent: {
            get() {
                return this.subValue;
            },
            set(val) {
                this.$emit('update:subValue', val);
            },
        },
    },
    methods: {
        tabClick(item) {
            this.current = item.value;
            this.$emit('change', item.value, item);
        },
        subTabClick(item) {
            this.subCurrent = item.value;
            this.$emit('subChange', item.value, item);
        },
    },
};
</script>

<style lang="scss" scoped>
/* mp-weixin 组件宿主节点默认不参与父级 flex 布局（类内联元素），用 :host 让宿主撑满父容器剩余高度 */
:host {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.tab-scroll-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.main-tabs {
    display: flex;
    align-items: flex-end;
    padding: 0 24rpx;
    position: relative;
    z-index: 2;
    .tab {
        flex: 1;
        height: 62rpx;
        margin-right: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: 24rpx 24rpx 0 0;
        background: rgba(255, 255, 255, 0.55);
        &:last-child {
            margin-right: 0;
        }
        .tab__label {
            font-size: 24rpx;
            color: #333;
            font-weight: 700;
        }
        &.active {
            height: 82rpx;
            z-index: 3;
            background: linear-gradient(180deg, rgba(102, 166, 255, 1) 0%, rgba(64, 118, 255, 1) 100%);
            .tab__label {
                color: #fff;
                font-size: 28rpx;
                font-weight: bold;
            }
        }
        /* 选中签底部缺口：SVG 曲线（viewBox 100×20：顶部平直，中部下探至20，两侧平滑回升），顶部 2rpx 藏进签底 */
        .tab__pointer {
            position: absolute;
            left: 50%;
            bottom: -18rpx;
            width: 100rpx;
            height: 20rpx;
            margin-left: -50rpx;
            background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAxMDAgMjAiPjxwYXRoIGQ9Ik0wLDAgTDIwLDAgQzM1LDAgNDIsMjAgNTAsMjAgQzU4LDIwIDY1LDAgODAsMCBMMTAwLDAgTDEwMCwwIFoiIGZpbGw9IiM0MDc2ZmYiLz48L3N2Zz4=')
                no-repeat center / 100% 100%;
            z-index: -1;
        }
    }
}
/* 内容面板：透明容器，选中页签的缺口指针压在其顶边上 */
.content-panel {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    /* 顶部磨砂条：半透明白渐变 + 顶部内高光（设计稿 191px ≈ 382rpx）；不用 backdrop-filter，小程序端渲染不稳定 */
    .frost-strip {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 382rpx;
        border-radius: 24rpx 24rpx 0 0;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
        box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 1);
        pointer-events: none;
    }
    .sub-tabs {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding: 24rpx 32rpx 8rpx;
        position: relative;
        z-index: 1; /* 压在半透明磨砂条之上，避免按钮被覆盖发虚 */
        /* 子签为白色胶囊按钮（设计稿 136×48，圆角 18rpx），选中蓝字 */
        .sub-tab {
            min-width: 136rpx;
            height: 48rpx;
            padding: 0 20rpx;
            margin-right: 20rpx;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            color: #333;
            background-color: #fff;
            border-radius: 10rpx;
            font-weight: 700;
            &.active {
                color: #4063ff;
                font-weight: bold;
            }
        }
    }
    .scroll {
        flex: 1;
        min-height: 0;
    }
}
</style>
