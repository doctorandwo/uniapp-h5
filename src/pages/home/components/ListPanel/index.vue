<template>
    <view class="list-panel">
        <view class="header">
            <slot name="headerTitle">
                <view class="header-title">
                    <image :src="$global.getImageUrl('pages/home/title-tjyl-group.png')" class="title-tjyl" />
                </view>
            </slot>
        </view>

        <!-- @by oh-my-zerone 2026-10-22 吸顶侦测哨兵：宿主页面按需调用 initStickyObserver -->
        <view id="pages_home_sentinel-search" style="height: 0.1rpx" />

        <view class="search" v-if="withSearch">
            <view class="search-item" v-for="item in searchOptions" :class="{ active: item.active }" :key="item.key" @click="onFilterClick(item.key)">
                <view class="g-single-row filter-arrow">{{ item.name }}</view>
                <view class="triangle" />
            </view>
        </view>
        <view class="scroll">
            <view v-for="item in list" :key="item.driverCode || item.code" class="card-box">
                <ServiceCard :item="item" :vehicle-dict="vehicleDictState" @detail="toDetail" />
            </view>
            <Empty v-if="!list.length" style="margin-top: 20%" />
            <template v-else>
                <uni-load-more id="pages_home_loadMore" :status="status" :icon-size="16" style="margin-bottom: 20rpx" />
            </template>
        </view>
    </view>
</template>

<script>
/**
 * @by oh-my-zerone 2026-10-12
 * 首页推荐列表筛选项调整为：综合推荐 / 距离最近 / 车型
 * @by oh-my-zerone 2026-10-22 支持被其他页面复用：新增 searchParams / totalChange / stickyChange / initStickyObserver，
 * 观察器改为实例级持有，避免多页面实例互相覆盖
 */
import Empty from '@/components/Empty/index.vue';
import ServiceCard from '../ServiceCard/index.vue';

import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiPageRecommendedDispatcherList, ApiGetCommonRoute } from '@/pages/home/services.js';
import { createVisibilityObserver } from '@/pages/home/utils.js';
import { useVehicleDict } from '@/pages/home/hooks.js';

export default {
    components: { Empty, ServiceCard },
    props: {
        withSearch: {
            type: Boolean,
            default: false,
        },
        /**
         * 额外检索条件（并入请求载荷）
         * @by oh-my-zerone 2026-10-22
         */
        searchParams: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            searchOptions: [
                { key: 'recommend', name: '综合推荐', active: false },
                { key: 'distance', name: '距离最近', active: false },
                { key: 'carType', name: '车型', active: false },
            ],

            list: [] || Array.from({ length: 11 }, () => ({})),
            total: 0,
            queryForm: {
                authStatus: 3, // 司机审核状态固定为 3（审核通过）
                loadCityCode: '', // 常用路线装货城市编码（来自 commonRoute 第一条）
                unloadCityCode: '', // 常用路线卸货城市编码（来自 commonRoute 第一条）
            },
            queryPage: {
                pageNum: 1,
                pageSize: 10,
            },
            // 车长/车型字典映射 hook 的响应式 state，loaded 后下发给卡片
            vehicleDictState: null,
            loading: false,
            isStickySearch: false,
        };
    },
    created() {
        const { state, loadVehicleDict } = useVehicleDict();
        this.vehicleDictState = state;
        this.loadVehicleDict = loadVehicleDict;
    },
    computed: {
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

    beforeDestroy() {
        this.disconnectStickyObserver();
        this.disconnectBottomObserver();
    },
    methods: {
        /**
         * 筛选项点击事件
         * @param {string} key 筛选项标识：recommend=综合推荐, distance=距离最近, carType=车型
         * @returns {void}
         */
        onFilterClick(key) {
            if (key === 'recommend') {
                // 综合推荐：默认综合排序
                this.applySort(1, '');
            } else if (key === 'distance') {
                // 距离最近：按距离由近到远
                this.applySort(2, 'asc');
            } else if (key === 'carType') {
                // 车型：按机型种类排序，支持升序/降序
                this.searchOptions = this.searchOptions.map(item => ({ ...item, active: item.key === key }));
                uni.showActionSheet({
                    itemList: ['升序', '降序'],
                    success: res => {
                        const isAsc = res.tapIndex === 0 ? 'asc' : 'desc';
                        this.applySort(3, isAsc);
                    },
                    complete: () => {
                        this.syncOptionActive();
                    },
                });
            }
        },
        /**
         * 应用排序条件并重新查询列表
         * @param {number} sortType 排序类型：1=综合推荐, 2=距离最近, 3=车型
         * @param {string} isAsc 排序方向：asc=升序, desc=降序, ''=后端默认
         * @returns {void}
         */
        applySort(sortType, isAsc) {
            this.queryForm.sortType = sortType;
            this.queryForm.isAsc = isAsc;
            this.syncOptionActive();
            this.handleQuery();
        },
        /**
         * 根据当前排序类型同步筛选项高亮状态
         * @returns {void}
         */
        syncOptionActive() {
            const activeKeyMap = { 1: 'recommend', 2: 'distance', 3: 'carType' };
            const activeKey = activeKeyMap[this.queryForm.sortType];
            this.searchOptions = this.searchOptions.map(item => ({ ...item, active: item.key === activeKey }));
        },
        /* 更新面板数据 */
        async init() {
            if (!uni.isLogin()) {
                this.list = [];
                return;
            }
            this.queryPage.pageNum = 1;
            this.list = [];
            await this.loadRouteAndDict();
            await this.getList();
            this.initBottomObserver();
            return { list: this.list, total: this.total };
        },
        /**
         * 加载货主常用路线（取第一条装卸货城市编码）与车长/车型字典映射
         * @returns {Promise<void>}
         */
        async loadRouteAndDict() {
            // 车长/车型字典映射（hook 内部缓存），loaded 后通过 vehicleDictState 下发给卡片
            try {
                await this.loadVehicleDict();
            } catch (e) {
                // 字典加载失败不阻断列表请求
            }
            const shipmentCode = this.$store.getters.shipmentInfo?.code;
            if (!shipmentCode) return;
            const [err, res] = await useRequest(ApiGetCommonRoute, shipmentCode);
            if (err) return;
            const routes = res?.data || [];
            const first = Array.isArray(routes) ? routes[0] : null;
            if (first) {
                this.queryForm.loadCityCode = first.loadCityCode || '';
                this.queryForm.unloadCityCode = first.unloadCityCode || '';
            }
        },
        /**
         * 卡片点击：内置跳转至运力详情页
         * @by oh-my-zerone 2026-10-27
         * @param {Object} item 司机行数据（含 driverCode）
         * @returns {void}
         */
        toDetail(item) {
            if (!item || !item.driverCode) return;
            const shipmentCode = this.$store.getters.shipmentInfo?.code || '';
            uni.navigateTo({
                url: `/pages_user/transportCapacity/detail/index?driverCode=${item.driverCode}&shipmentCode=${shipmentCode}`,
            });
        },
        handleQuery() {
            this.list = [];
            this.getList();
        },

        async getList() {
            this.loading = true;
            const payload = {
                pageNum: this.queryPage.pageNum,
                pageSize: this.queryPage.pageSize,
                authStatus: this.queryForm.authStatus,
                loadCityCode: this.queryForm.loadCityCode,
                unloadCityCode: this.queryForm.unloadCityCode,
                // @by oh-my-zerone 2026-10-22 searchParams 供宿主页面补充附近检索等条件
                ...(this.searchParams || {}),
            };
            const [err, res] = await useRequest(ApiPageRecommendedDispatcherList, payload);
            this.loading = false;

            if (err) return;
            const { rows = [], total = 0 } = res;

            this.list.push(...rows);
            this.total = total;
            this.$emit('totalChange', total);
        },
        scrolltolower() {
            if (this.isBottom || this.loading) return;
            this.queryPage.pageNum++;
            this.getList();
        },

        initBottomObserver() {
            this.disconnectBottomObserver();
            this._bottomObserver = createVisibilityObserver(this, '#pages_home_loadMore', ({ intersectionRatio }) => {
                if (intersectionRatio > 0) this.scrolltolower();
            });
        },
        disconnectBottomObserver() {
            this.safeDisconnect(this._bottomObserver);
            this._bottomObserver = null;
        },
        /**
         * 初始化吸顶侦测：哨兵滚出头部高度后视为已吸顶
         * @by oh-my-zerone 2026-10-22
         * @param {number} top 头部元素高度（px）
         * @returns {void}
         */
        initStickyObserver(top) {
            this.disconnectStickyObserver();
            this._stickyObserver = createVisibilityObserver(
                this,
                '#pages_home_sentinel-search',
                ({ intersectionRatio }) => {
                    if (this._isDestroyed || this._isBeingDestroyed) return;
                    this.isStickySearch = intersectionRatio <= 0;
                    this.$emit('stickyChange', this.isStickySearch);
                },
                { top: -top },
            );
        },
        disconnectStickyObserver() {
            this.safeDisconnect(this._stickyObserver);
            this._stickyObserver = null;
        },
        /** 观察器释放：热更/销毁后底层 vm 失效，disconnect 可能抛错 */
        safeDisconnect(observer) {
            if (!observer) return;
            try {
                observer.disconnect();
            } catch (e) {
                console.warn('[ListPanel] observer disconnect failed', e);
            }
        },
        showSearchPanel(key) {},
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
@import '@/common/css/icon.scss';

.triangle {
    width: 17rpx;
    height: 17rpx;
    @include triangle(#333);
}

.list-panel {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.37) 0%, rgba(255, 255, 255, 0.02) 100%, rgba(255, 255, 255, 0) 100%);
    box-shadow: inset 0px 2rpx 0px 1rpx #fff;
    border-radius: 34rpx 34rpx 0px 0px;
    padding: 17rpx 32rpx 21rpx;
    display: flex;
    flex-direction: column;

    .header {
        margin-left: -10rpx;
        margin-bottom: 11rpx;

        &-title {
            width: 486rpx;
            height: 77rpx;

            .title-tjyl {
                width: 100%;
                height: 100%;
            }
        }
    }

    .search {
        display: flex;
        padding-left: 12rpx;

        &-item {
            width: 33%;
            padding-right: 30rpx;
            display: flex;
            align-items: center;
            @include flex-gap(6rpx);
            font-size: 26rpx;
            font-weight: bold;

            &.active {
                .filter-arrow {
                    color: #3a65ff;
                }
                .triangle {
                    background-color: #3a65ff;
                }
            }
        }
    }

    .scroll {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        @include flex-gap(20rpx, column);

        margin-top: 15rpx;
        padding-bottom: 100rpx;

        box-sizing: border-box;
    }
}
</style>
