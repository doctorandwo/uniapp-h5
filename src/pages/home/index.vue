<template>
    <PageFrame
        ref="PageFrameRef"
        class="page-index"
        bg="#F0F2F6"
        :hasHeader="false"
        :refresherTriggered="triggered"
        showTabbar
        scrollWithAnimation
        withTabbarBg
        refresherEnabled
        @refresherrefresh="onPageRefresh"
    >
        <image slot="headerBg" :src="$global.getImageUrl('pages/home/top-bg.png')" style="width: 100%" />

        <view class="page-index__body">
            <view class="content" :style="{ paddingBottom: tabbarHeight + 'px' }">
                <view class="top-nav">
                    <view class="top-nav-left">
                        <Location v-model="location" @location="getLocation" />
                        <view class="goods-statistics-wrap">
                            <GoodsStatistics ref="GoodsStatisticsRef" />
                        </view>
                    </view>
                    <view class="top-nav-right">
                        <Attention ref="AttentionRef" />
                    </view>
                </view>
                <view class="module-item publish-panel">
                    <PublishPanel ref="PublishPanelRef" footerMessage="你常发布的货源，近7日参考运价下降3%，目前有.." />
                </view>

                <view class="module-item list-panel">
                    <ListPanel ref="ListPanelRef" />
                </view>
            </view>
        </view>
    </PageFrame>
</template>

<script>
// components
import PageFrame from '@/pages/components/PageFrame/index.vue';
import Location from './components/Location/index.vue';
import GoodsStatistics from './components/GoodsStatistics/index.vue';
import Attention from './components/Attention/index.vue';
import ListPanel from './components/ListPanel/index.vue';
import PublishPanel from './components/PublishPanel/index.vue';

// common
import { webGetAddress } from '@/common/platform/amap';
export default {
    components: { PageFrame, Location, GoodsStatistics, Attention, ListPanel, PublishPanel },
    data() {
        return {
            location: {},
            currentNav: 'home',

            triggered: false,
            // @by oh-my-zerone 页面加载即处于顶部（scrollTop===0），初始应启用下拉刷新
            refresherEnabled: true,
        };
    },
    computed: {
        tabbarHeight() {
            return this.$store.getters.tabbarHeight;
        },
        isLogin() {
            return this.$store.getters.isLogin;
        },
    },
    watch: {
        /**
         * 监听登录态：由未登录变为已登录（重新登录）时，
         * 清空 home 发布面板的装卸货地址。
         * @by oh-my-zerone
         */
        isLogin(val, oldVal) {
            if (val && !oldVal) {
                this.$refs.PublishPanelRef?.resetAddress();
            }
        },
    },
    onLoad() {
        this.getLocation();
        // @by oh-my-zerone 订阅全局"发布成功"事件：任意层级发布页
        // uni.$emit('pages/home/index:resetAddress') 后清空装卸货地址，
        // 规避 eventChannel 仅支持单层跳转的限制。
        uni.$on('pages/home/index:resetAddress', this.onPublishSuccessReset);
        this.$nextTick(() => {
            this.updateData();
        });
    },
    onUnload() {
        // @by oh-my-zerone 解绑全局发布成功事件，避免重复注册与内存泄漏
        uni.$off('pages/home/index:resetAddress', this.onPublishSuccessReset);
    },
    onShow() {
        // 将 tabbar 选中态对齐为当前页面路由：覆盖服务号通知直达、返回等非点击 tabbar 的进入场景
        this.$store.dispatch('SyncTabbar');
    },
    methods: {
        async updateData() {
            // 下拉刷新交由 PageFrame 统一负责，此处仅驱动各模块重新拉取
            const listPanel = this.$refs.ListPanelRef;
            if (listPanel) await listPanel.init();

            // 「需关注」异常列表同步刷新（仿 ListPanel 驱动方式）
            const attention = this.$refs.AttentionRef;
            if (attention) await attention.init();

            // 货物流转统计看板：交由组件内部自治拉取（仿 Attention 驱动方式）
            const goodsStatistics = this.$refs.GoodsStatisticsRef;
            if (goodsStatistics) await goodsStatistics.init();
        },

        /**
         * 发布货源成功后清空 home 发布面板的装卸货地址。
         * @by oh-my-zerone
         * 由任意层级发布成功页 uni.$emit('pages/home/index:resetAddress') 触发，
         * 在 onLoad 中通过 uni.$on 订阅。相较原 eventChannel 方案，
         * 不受 navigateTo 通道层数限制，可支撑下下个页面等深层触发。
         */
        onPublishSuccessReset() {
            this.$refs.PublishPanelRef?.resetAddress();
        },

        async getLocation() {
            const { latitude, longitude } = await uni.getLocationPlus();

            console.log('latitude', latitude, 'longitude', longitude);
            if (!latitude || !longitude) {
                console.log('获取位置失败');
                return;
            }
            const [err, regeocode] = await webGetAddress({ latitude, longitude });
            if (err) return;
            const label = regeocode.addressComponent.city;
            this.location = { label, regeocode, longitude, latitude };
        },
        async onPageRefresh() {
            this.triggered = true;
            await this.updateData();
            this.triggered = false;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

$aside-p: 32rpx; // 侧边距
.page-index {
    &__body {
        padding-bottom: 20rpx;
        box-sizing: border-box;
        /* @by oh-my-zerone
           解除内层高度锁定：移除 height:100% 与 flex 列布局，
           让内容自然流式排列，由 PageFrame 的 scroll-view 作为唯一滚动容器，
           从而使外层 @scroll → handleScroll 能正常抛出 */

        .top-nav {
            display: flex;
            justify-content: space-between;
            @include flex-gap(24rpx);
            margin-top: 110rpx;
            padding: 0 $aside-p;
            margin-bottom: 17rpx;
            &-left {
                .goods-statistics-wrap {
                    margin-top: 20rpx;
                }
            }
            &-right {
                padding-right: 29rpx;
            }
        }

        .content {
            /* @by oh-my-zerone
               移除 overflow-y:auto / flex:1 / min-height:0 / flex 列布局，
               不再作为滚动容器；滚动上移至 PageFrame 的 scroll-view。
               内联 style 的 paddingBottom（tabbar 安全区）依旧保留 */
            .module-item {
                width: 100%;
                padding: 0 $aside-p;

                &.airplane-img-panel {
                    padding-left: 40rpx;

                    .airplane-img {
                        width: 431rpx;
                        height: 51rpx;
                    }
                }
                &.publish-panel {
                    margin-top: 20rpx;
                }
                &.list-panel {
                    padding: 0;
                    margin-top: 30rpx;
                }
            }

            /* "快速发布"按钮样式已内置到 PublishPanel 组件（非 scoped .btn-publish），
               本页不再重复定义。 */
        }
    }
}
</style>
