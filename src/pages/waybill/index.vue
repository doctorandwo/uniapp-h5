<template>
    <PageFrame class="page-waybill" bg="#f0f2f6" withTabbarBg showTabbar>
        <view slot="headerTitle" class="header-title-box">
            <view class="header-title">
                <image :src="$global.getImageUrl('pages/waybill/title-yd.png')" class="title-yd" />
            </view>
            <view class="tab-box">
                <CTab v-model="currentType" :items="tabs" @change="typeChange" />
            </view>
        </view>

        <image slot="headerBg" :src="$global.getImageUrl('pages/waybill/top-bg.png')" style="width: 100%" />
        <view class="page-waybill__body">
            <view class="input-wrap">
                <view class="input-box">
                    <CInput v-model="keyword" background="rgba(255, 255, 255, 0.42)" placeholder="请输入运单号" @search="handleSearch" />
                </view>
            </view>

            <view class="status-tab">
                <view class="tab-box">
                    <CTabSmall v-model="currentStatus" :items="tabs_status" @change="statusChange" />
                </view>
            </view>
            <view class="scroll-wrap">
                <view v-if="scrollTop > 30" class="scroll-shadow" />
                <scroll-view
                    class="scroll"
                    refresher-background="transparent"
                    :refresher-triggered="triggered"
                    scroll-y
                    refresher-enabled
                    @scroll="onScroll"
                    @scrolltolower="scrolltolower"
                    @refresherrefresh="onRefresh"
                >
                    <view v-for="item in list" :key="item.waybillCode || item.waybillNo" class="card-box">
                        <CardInfo :info="item" :list-type="currentType" />
                    </view>
                    <Empty v-if="!list.length" style="margin-top: 20%" />
                    <template v-else>
                        <uni-load-more :status="status" :icon-size="16" style="margin-bottom: 20rpx" />
                    </template>
                    <view :style="{ height: tabbarHeight + 'px' }" />
                </scroll-view>
            </view>
        </view>
    </PageFrame>
</template>

<script>
// components
import PageFrame from '@/pages/components/PageFrame/index.vue';
import CInput from '@/pages/waybill/components/CInput/index.vue';
import CTab from '@/pages/waybill/components/CTab/index.vue';
import CTabSmall from '@/pages/waybill/components/CTabSmall/index.vue';
import Empty from '@/components/Empty/index.vue';
import CardInfo from '@/pages/waybill/components/CardInfo/index.vue';

// hooks
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { Schema } from '@zerone/toolbox/src/schema';

// const
import { STATUS_ABNORMAL, STATUS_WAYBILL_TRANS, STATUS_WAYBILL_SETTLEMENT, TRANSPORT_ALL_STATUES, SETTLEMENT_ALL_STATUES } from './constants.js';
import { T_Submit_WaybillList } from './models.js';

// services
import { ApiWaybillList } from '@/pages/waybill/services.js';

// utils
import throttle from '@/common/utils/throttle.js';

/**
 * @by oh-my-zerone 2026-10-16
 * 运单页运输、结算列表改为超好运 pageTransport。
 */
export default {
    components: { PageFrame, CInput, CTab, CTabSmall, CardInfo, Empty },

    data() {
        return {
            keyword: '',
            tabs: [
                { label: '运输', value: 'transport' },
                { label: '结算', value: 'settlement' },
            ],
            currentType: 'transport',

            currentStatus: 'all',

            list: [],
            total: 0,
            queryPage: {
                pageNum: 1,
                pageSize: 10,
            },
            loading: false,
            triggered: false,
            scrollTop: 0,
        };
    },
    computed: {
        tabs_status() {
            const map = {
                transport: STATUS_WAYBILL_TRANS,
                settlement: STATUS_WAYBILL_SETTLEMENT,
            };
            const all = { label: '全部', value: 'all' };
            return [all, ...(map[this.currentType] || [])];
        },
        isBottom() {
            return this.list?.length >= this.total;
        },
        status() {
            if (this.loading) return 'loading';
            return this.isBottom ? 'no-more' : 'more';
        },
        tabbarHeight() {
            return this.$store.getters.tabbarHeight;
        },
    },
    onLoad(options) {
        this.refreshPage();

        uni.$on('pages/waybill/index:refresh', this.refreshPage);
    },
    onShow() {
        // 将 tabbar 选中态对齐为当前页面路由：覆盖服务号通知直达、返回等非点击 tabbar 的进入场景
        this.$store.dispatch('SyncTabbar');
    },
    onUnload() {
        uni.$off('pages/waybill/index:refresh', this.refreshPage);
    },
    methods: {
        refreshPage() {
            if (!uni.isLogin()) {
                this.reset();
                return;
            }
            this.handleSearch();
        },
        statusChange() {
            this.handleSearch();
        },
        typeChange() {
            this.currentStatus = 'all';
            this.handleSearch();
        },
        async handleSearch() {
            this.reset();
            await this.getList();
        },
        buildQuery() {
            const payload = { ...this.queryPage, waybillNo: this.keyword };
            if (this.currentStatus === STATUS_ABNORMAL) {
                payload.isAbnormal = 1;
            } else if (this.currentStatus === 'all') {
                payload.statues = this.currentType === 'transport' ? TRANSPORT_ALL_STATUES : SETTLEMENT_ALL_STATUES;
            } else {
                payload.status = this.currentStatus;
            }
            return new Schema(T_Submit_WaybillList).parse(payload);
        },
        async getList() {
            // 与个人中心 isAuth 一致
            if (!uni.isLogin() || !this.$store.getters.isAuth) return;
            this.loading = true;
            const [err, res] = await useRequest(ApiWaybillList, this.buildQuery());
            this.loading = false;
            if (err) return;
            const list = res?.data?.list || [];
            const total = res?.data?.total || 0;
            this.queryPage.pageNum == 1 ? (this.list = list) : this.list.push(...list);
            this.total = total;
        },
        scrolltolower() {
            if (this.isBottom || this.loading) return;
            this.queryPage.pageNum++;
            this.getList();
        },
        reset() {
            this.queryPage.pageNum = 1;
            this.list = [];
            this.total = 0;
        },
        async refresh() {
            this.reset();
            await this.getList();
        },
        onScroll: throttle(function (e) {
            this.scrollTop = e?.detail?.scrollTop || 0;
        }, 16),
        async onRefresh() {
            this.triggered = true;
            this.reset();
            await this.refresh();
            this.triggered = false;
        },
    },
};
</script>
<style lang="scss" scoped>
$aside-p: 32rpx; // 侧边距
.page-waybill {
    .header-title-box {
        display: flex;
        align-items: center;
        .header-title {
            color: #1d3755;
            margin-right: 8rpx;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            .title-yd {
                width: 120rpx;
                height: 48rpx;
            }
        }
        .tab-box {
            flex-shrink: 0;
            margin-left: 16rpx;
        }
    }

    .page-waybill__body {
        padding-bottom: 20rpx;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;

        .input-wrap {
            margin: 0 $aside-p 20rpx;
            display: flex;
            align-items: center;

            .input-box {
                min-width: 0;
                flex: 1;
                border-radius: 44rpx;
                border: 1rpx solid #fff;
                backdrop-filter: blur(26rpx);
            }
            .btn-account {
                padding: 16rpx 22rpx;
                background-color: rgba($color: #fff, $alpha: 0.42);
                border: 1rpx solid #fff;
                box-shadow: 0px 1rpx 12rpx #cbd3e2;
                backdrop-filter: blur(26rpx);
                font-size: 24rpx;
                font-weight: bold;
                color: #333;
                display: flex;
                align-items: center;
                border-radius: 44rpx;
                margin-left: 20rpx;
                .icon-cash {
                    $w: 32rpx;
                    width: $w;
                    height: $w;
                    margin-right: 8rpx;
                }
            }
        }

        .status-tab {
            margin: 0 $aside-p 24rpx;
            display: flex;
            align-items: center;
            .tab-box {
                min-width: 0;
                flex: 1;
            }
        }
        .scroll-wrap {
            position: relative;
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
        }
        .scroll-shadow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 24rpx;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.12), transparent);
            z-index: 10;
            pointer-events: none;
        }
        .scroll {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;

            .card-box {
                padding: 0 32rpx;
                margin-bottom: 20rpx;
                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}
</style>
