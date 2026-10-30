<!--
 * @by oh-my-zerone
 * 选择吊运起点/终点位置页面
 * 从 funuo/owner/src/pages_quoteCreate/chooseLocation 迁移；
 * 公共方法（adminCode / amap / throttle / geo）引用项目公共实现，页面引入统一收敛到 barrel.js；
 * 常用地址服务与辅助（service.js / commonAddressHelper.js）及 mapPicker 均收拢到本目录，保持内容自包含。
 -->
<template>
    <view class="choose-location-page">
        <z1HeaderVue :hasBack="true" backgroundColor="#EEF0F5" wxPolyfillHeight="20rpx">
            <view class="title">
                <span>选择{{ titleText }}</span>
            </view>
        </z1HeaderVue>
        <view class="choose-location-content">
            <view class="search-bar-container">
                <view class="search-bar ly-flex ly-flex-align-center">
                    <view class="dot-icon"></view>
                    <input
                        class="search-input"
                        type="text"
                        placeholder="请输入地址"
                        placeholder-class="placeholder-style"
                        v-model="searchText"
                        @input="handleInputChange"
                        :focus="true"
                    />
                </view>
            </view>

            <view class="quick-actions ly-flex">
                <view class="action-item ly-flex ly-flex-align-center ly-flex-pack-center" @click="getMyLocation">
                    <text class="action-text">我的位置</text>
                </view>
                <view class="divider"></view>
                <view class="action-item ly-flex ly-flex-align-center ly-flex-pack-center" @click="chooseOnMap">
                    <text class="action-text">地图选点</text>
                </view>
            </view>

            <view class="address-list-card" :class="{ 'empty-wrapper': displayList.length === 0 }">
                <scroll-view scroll-y class="address-list-container" v-if="displayList.length > 0" @scrolltolower="loadMore">
                    <view class="address-list">
                        <view
                            v-for="(item, index) in displayList"
                            :key="itemKey(item, index)"
                            class="address-item ly-flex"
                            :class="{ 'address-item--selected': isItemSelected(item) }"
                            @click="selectAddress"
                            :data-index="index"
                        >
                            <view class="location-icon-wrapper">
                                <image class="location-icon" :src="$global.getImageUrl('pages_quoteCreate/icon-location.png')" mode="aspectFit" />
                            </view>
                            <view class="address-info">
                                <view class="address-title">{{ item.title }}{{ getDisplayAlias(item) ? '(' + getDisplayAlias(item) + ')' : '' }}</view>
                                <view class="address-subtitle">{{ item.subtitle }}</view>
                            </view>
                            <view class="selected-check" v-if="isItemSelected(item)">
                                <image class="selected-check-icon" :src="$global.getImageUrl('pages_quoteCreate/icon-checked.png')" mode="aspectFit" />
                            </view>
                        </view>
                    </view>
                    <view class="list-status-tip" v-if="isCommonMode">
                        <text v-if="commonLoading">加载中...</text>
                        <text v-else-if="commonFinished">没有更多了</text>
                    </view>
                </scroll-view>
                <view class="empty-wrapper" v-else>
                    <text v-if="searching" class="search-loading-tip">搜索中...</text>
                    <Empty v-else></Empty>
                </view>
            </view>
        </view>

        <!-- @by oh-my-zerone 2026-10-16 withContact 开启时别名弹窗同时采集联系人 / 联系电话 -->
        <AliasPopup
            :show.sync="showAliasPopup"
            :address="pendingAddress"
            :alias="pendingAlias"
            :show-contact="withContact"
            :contact="pendingContact"
            :contact-phone="pendingContactPhone"
            @confirm="onAliasConfirm"
        />
    </view>
</template>

<script>
// components
import Empty from '@/components/Empty/index.vue';
import AliasPopup from '@/components/AliasPopup/index.vue';
import z1HeaderVue from '@/components/Header/z1Header.vue';

// modules
import {
    calcDistanceM,
    debounce,
    webSearchNearby,
    webGetAddress,
    ApiGetCommonAddressList,
    ensureCommonAddress,
    parseCommonAddress,
    parsePoiToAddress,
    buildPendingPoi,
    POINT_TYPE_TO_ADDRESS_TYPE,
} from './barrel.js';

// platform（跨端 Modal 兼容层）
import { showModal } from '@/common/platform/modal.js';

// 模块级常量（就地维护，避免散落魔法值）
const SEARCH_PAGE_SIZE = 11;
const SEARCH_DEBOUNCE_MS = 500;
const MATCH_THRESHOLD_METERS = 50;

export default {
    name: 'ChooseLocation',
    components: {
        Empty,
        AliasPopup,
        z1HeaderVue,
    },
    data() {
        return {
            searchText: '',
            addressList: [],
            commonList: [],
            commonPageNum: 1,
            commonLoading: false,
            commonFinished: false,
            selectPointType: 'start',
            showAliasPopup: false,
            pendingPoi: null,
            pendingAddress: '',
            // @by oh-my-zerone 2026-10-16 弹窗回显：地址别名（常用地址项带入 addressAlias）
            pendingAlias: '',
            // @by oh-my-zerone 2026-10-16 withContact 开启时由别名弹窗采集
            pendingContact: '',
            pendingContactPhone: '',
            eventChannel: null,
            matchedCommon: null,
            searching: false,
            searchSeq: 0,
            // 上游（如首页 PublishPanel）带入的已选地址，用于列表高亮与地图选点回显
            incomingPoint: null,
            // @by oh-my-zerone 2026-10-16 是否采集地址联系人 / 联系电话（默认关闭，首页等既有调用方交互不变）
            withContact: false,
            // @by oh-my-zerone 2026-10-19 仅选点模式：选中即回传，不弹别名弹窗、不写常用地址（地址簿表单页回填场景）
            pickOnly: false,
        };
    },
    onLoad(options) {
        this.selectPointType = options?.type || 'start';
        this.eventChannel = this.getOpenerEventChannel();
        this.incomingPoint = this.parseIncomingPoint(options?.selected);
        // 兼容 query 字符串与布尔两种传参
        this.withContact = options?.withContact === '1' || options?.withContact === 'true' || options?.withContact === true;
        // @by oh-my-zerone 2026-10-19 仅选点模式（地址簿表单回填），默认关闭，既有调用方交互不变
        this.pickOnly = options?.pickOnly === '1' || options?.pickOnly === 'true' || options?.pickOnly === true;
        this.fetchCommonAddressList(true);
    },
    created() {
        // 防抖：用户输入停顿后再发起搜索，避免连续输入频繁请求
        this.debouncedSearch = debounce(this.searchAddress, SEARCH_DEBOUNCE_MS, false);
    },
    computed: {
        /**
         * 标题后缀：仅选点模式统一展示「地址」，否则按选点类型展示起点/终点
         * @returns {string} 标题文案
         */
        titleText() {
            if (this.pickOnly) return '地址';
            return this.selectPointType === 'start' ? '起点' : '终点';
        },
        /** 是否处于常用地址模式（无搜索词时展示常用地址） */
        isCommonMode() {
            return !this.searchText;
        },
        /** 当前展示列表：搜索模式取搜索结果，否则取常用地址 */
        displayList() {
            return this.isCommonMode ? this.commonList : this.addressList;
        },
        /**
         * 命中已选地址的唯一列表项引用（保证整张列表至多一项高亮）。
         * @by oh-my-zerone
         * 判定为「同时命中」：坐标邻近(< 50m) 且 名称一致 且 别名一致，三者同时成立才算匹配；
         * 别名维度降级：已选地址与列表项任一方别名为空时视为该维度不冲突（放行），
         * 仅当双方均非空时才要求别名相等，避免「无别名」常见场景下的高亮回归。
         * 依赖当前 displayList 与 incomingPoint，随二者变化重新计算。
         * @returns {Object|null} 命中的列表项引用；无命中返回 null
         */
        matchedItem() {
            const p = this.incomingPoint;
            if (!p) return null;
            const list = this.displayList;
            const incomingLoc = `${p.longitude},${p.latitude}`;
            const sameLoc = item => item.location && this.isSameLocation(item.location, incomingLoc);
            const sameName = item => p.addressName && (item.title === p.addressName || item.name === p.addressName);
            // 别名维度：双方都非空时要求相等；任一方为空则放行（视为不冲突）
            const sameAliasSafe = item => (!p.alias && !item.addressAlias ? true : p.alias && item.addressAlias && p.alias === item.addressAlias);
            // 同时命中：坐标邻近 且 名称一致 且 别名一致（别名空时放行）
            return list.find(item => sameLoc(item) && sameName(item) && sameAliasSafe(item)) || null;
        },
    },
    methods: {
        /** 列表项稳定唯一键，避免筛选切换时 DOM 复用错位 */
        itemKey(item, index) {
            return `${item.title || ''}-${item.location || ''}-${index}`;
        },
        /**
         * 解析上游传入的已选地址（URL query 序列化的 JSON 串）。
         * @param {string} [raw] encodeURIComponent 后的 JSON 字符串
         * @returns {Object|null} 归一化后的已选点，缺坐标则视为无效返回 null
         */
        parseIncomingPoint(raw) {
            if (!raw) return null;
            let str = raw;
            try {
                // uni onLoad 已对 query 解码一次；若仍含编码字符再解一次，保证健壮
                if (str.indexOf('%') !== -1) str = decodeURIComponent(str);
                const p = JSON.parse(str);
                if (p && p.longitude != null && p.latitude != null) return p;
            } catch (e) {
                console.warn('parseIncomingPoint failed', e);
            }
            return null;
        },
        /**
         * 判断列表项是否为当前唯一命中的已选地址（勾选高亮）。
         * @by oh-my-zerone
         * 通过引用比较 matchedItem，保证整张列表至多一项高亮；
         * 别名命中逻辑已下沉至 matchedItem 的优先级 3，无需在此重复判定。
         * @param {Object} item 列表项
         * @returns {boolean} 是否唯一命中
         */
        isItemSelected(item) {
            return item != null && item === this.matchedItem;
        },
        /**
         * 列表项展示用的别名：直接取列表项自身存储的别名，不再优先使用上游传下来的别名。
         * @by oh-my-zerone
         * @param {Object} item 列表项（含 addressAlias）
         * @returns {string} 展示别名（可能为空串）
         */
        getDisplayAlias(item) {
            return item.addressAlias || '';
        },
        async fetchCommonAddressList(isReset = false) {
            if (this.commonLoading) return;
            if (!isReset && this.commonFinished) return;

            const addressType = POINT_TYPE_TO_ADDRESS_TYPE[this.selectPointType];
            if (!addressType) return;

            const pageNum = isReset ? 1 : this.commonPageNum;
            this.commonLoading = true;

            try {
                const res = await ApiGetCommonAddressList({
                    addressType,
                    pageSize: SEARCH_PAGE_SIZE,
                    pageNum,
                    isAsc: 'desc',
                    orderByColumn: 'createTime',
                });
                const rows = res?.rows || res?.data?.rows || [];
                const mapped = rows.map(parseCommonAddress);

                if (isReset) {
                    this.commonList = mapped;
                    this.commonPageNum = 1;
                } else {
                    this.commonList = this.commonList.concat(mapped);
                }

                this.commonFinished = rows.length < 10;
                if (!this.commonFinished) {
                    this.commonPageNum = pageNum + 1;
                }
            } catch (error) {
                console.error('fetchCommonAddressList error', error);
                uni.showToast({ title: '获取常用地址失败', icon: 'none' });
            } finally {
                this.commonLoading = false;
            }
        },
        loadMore() {
            if (this.isCommonMode) {
                this.fetchCommonAddressList(false);
            }
        },
        isSameLocation(loc1, loc2, thresholdMeters = MATCH_THRESHOLD_METERS) {
            const [x1, y1] = String(loc1 || '')
                .split(',')
                .map(Number);
            const [x2, y2] = String(loc2 || '')
                .split(',')
                .map(Number);
            if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) return false;
            return calcDistanceM(x1, y1, x2, y2) < thresholdMeters;
        },
        findMatchedCommonAddress(poi) {
            if (!this.commonList.length) return null;

            const name = (poi?.name || '').trim();
            const address = (poi?.address || poi?.subtitle || '').trim();
            const location = poi?.location || '';

            // 单次遍历完成「名称 / 详情 / 坐标」三种匹配，避免重复 find
            return this.commonList.find(item => {
                if (name && item.addressName && item.addressName.trim() === name) return true;
                if (address && item.detail && item.detail.trim() === address) return true;
                if (location && item.location && this.isSameLocation(location, item.location)) return true;
                return false;
            });
        },
        handleInputChange() {
            if (!this.searchText) {
                this.addressList = [];
                this.fetchCommonAddressList(true);
                return;
            }
            this.debouncedSearch();
        },
        async searchAddress() {
            if (!this.searchText) {
                this.addressList = [];
                return;
            }
            this.searching = true;
            // GPS 可能在 H5 等平台失败，失败时降级为纯关键词搜索
            let coordinate = null;
            try {
                const { latitude, longitude } = await uni.getLocationPlus();
                coordinate = { latitude, longitude };
            } catch (locErr) {
                console.warn('getLocationPlus failed, search without coordinate:', locErr);
            }
            // 请求序列号：仅采纳最新一次响应，丢弃过期回包（P0-2 竞态防护）
            const seq = ++this.searchSeq;
            try {
                const [err, data] = await webSearchNearby(this.searchText, coordinate);
                if (seq !== this.searchSeq) return;
                if (err) {
                    this.addressList = [];
                    return;
                }
                const poisList = data?.pois || [];
                this.addressList = poisList.map(item => parsePoiToAddress(item, item.adcode || ''));
            } catch (error) {
                if (seq !== this.searchSeq) return;
                console.error('searchAddress error', error);
                this.addressList = [];
            } finally {
                if (seq === this.searchSeq) this.searching = false;
            }
        },
        async getMyLocation() {
            try {
                uni.$z1.showLoading({ title: '获取中...' });
                const { latitude, longitude } = await uni.getLocationPlus();
                const [err, regeocode] = await webGetAddress({ latitude, longitude });
                uni.$z1.closeLoading();
                if (err) {
                    uni.showToast({ title: '获取位置失败', icon: 'none' });
                    return;
                }
                const pois = regeocode?.pois || [];
                if (!pois.length) {
                    uni.showToast({ title: '未找到附近位置', icon: 'none' });
                    return;
                }
                const poi = pois[0];
                const { addressComponent } = regeocode || {};
                const adcode = addressComponent?.adcode || poi?.adcode || '';
                // AMap location field format: longitude,latitude
                this.pendingPoi = buildPendingPoi(poi, adcode, { longitude, latitude });
                const matched = this.findMatchedCommonAddress(this.pendingPoi);
                this.matchedCommon = matched || null;
                // @by oh-my-zerone 2026-10-19 仅选点模式：直接回传，不弹别名弹窗、不保存常用地址
                if (this.pickOnly) {
                    this.emitToCallerAndBack('', this.pendingPoi);
                    return;
                }
                // @by oh-my-zerone 2026-10-16 withContact（选点链路）恒走弹窗，保证别名/联系人每次都经用户确认；
                // 非 withContact（首页链路）命中常用地址且带别名时直回
                if (matched?.addressAlias && !this.withContact) {
                    this.emitToCallerAndBack(matched.addressAlias, this.pendingPoi);
                    return;
                }
                this.pendingAddress = poi.address || '';
                // @by oh-my-zerone 2026-10-16 命中常用地址时回显其别名与联系人，减少重复填写
                this.pendingAlias = this.withContact ? matched?.addressAlias || '' : '';
                this.pendingContact = this.withContact ? matched?.contact || '' : '';
                this.pendingContactPhone = this.withContact ? matched?.contactPhone || '' : '';
                this.showAliasPopup = true;
            } catch (error) {
                uni.$z1.closeLoading();
                uni.showToast({ title: '获取位置失败', icon: 'none' });
            }
        },
        chooseOnMap() {
            // 已选坐标优先：存在已选地址坐标则直接用于回显，否则降级获取 GPS
            const p = this.incomingPoint;
            const useSelected = p && p.longitude != null && p.latitude != null;
            const goMapPicker = (longitude, latitude) => {
                let url = `/pages_common/chooseLocation/mapPicker/index?type=${this.selectPointType}&x=${longitude}&y=${latitude}&returnDelta=2`;
                if (this.incomingPoint) {
                    url += `&selected=${encodeURIComponent(JSON.stringify(this.incomingPoint))}`;
                }
                // @by oh-my-zerone 2026-10-16 采集联系人开关透传到地图选点链路，保证两条入口行为一致
                if (this.withContact) {
                    url += '&withContact=1';
                }
                // @by oh-my-zerone 2026-10-19 仅选点开关透传，保证地图选点同样不落库
                if (this.pickOnly) {
                    url += '&pickOnly=1';
                }
                uni.navigateTo({
                    url,
                    events: {
                        success: res => {
                            this.emitToCaller(res);
                        },
                    },
                });
            };
            if (useSelected) {
                goMapPicker(Number(p.longitude), Number(p.latitude));
                return;
            }
            uni.getLocationPlus()
                .then(({ latitude, longitude }) => {
                    goMapPicker(longitude, latitude);
                })
                .catch(() => {
                    uni.showToast({ title: '获取位置失败', icon: 'none' });
                });
        },
        /**
         * 点击列表项选择地址（跨端安全：通过 data-index 取回索引，避免小程序端 v-for 循环变量作为事件参数为 undefined）
         * @by oh-my-zerone
         * @param {Object} e 点击事件对象（H5 为 DOM Event，小程序为 MP Event）
         */
        selectAddress(e) {
            // 小程序端 e.currentTarget.dataset.index / H5 端 e.currentTarget.dataset.index 均可用
            const index = e?.currentTarget?.dataset?.index;
            const item = this.displayList[index];
            if (!item) return;
            // @by oh-my-zerone 2026-10-19 仅选点模式：选中即回传，不弹别名弹窗、不保存常用地址
            if (this.pickOnly) {
                this.emitToCallerAndBack(item.addressAlias || '', item);
                return;
            }
            // @by oh-my-zerone 2026-10-16 withContact（选点链路）恒走弹窗：别名/联系人/联系电话由用户确认后回传，
            // 与旧选点页行为一致；非 withContact（首页链路）常用地址仍直回
            if (item.isCommon && !this.withContact) {
                this.emitToCallerAndBack(item.addressAlias || '', item);
                return;
            }
            this.matchedCommon = null;
            this.pendingPoi = item;
            this.pendingAddress = item.subtitle || '';
            // @by oh-my-zerone 2026-10-16 withContact 开启时回显列表项自带的别名 / 联系人（搜索 POI 为空）
            this.pendingAlias = this.withContact ? item.addressAlias || '' : '';
            this.pendingContact = this.withContact ? item.contact || '' : '';
            this.pendingContactPhone = this.withContact ? item.contactPhone || '' : '';
            this.showAliasPopup = true;
        },
        async onAliasConfirm(result) {
            // result: { alias, saveToCommon, contact, contactPhone }，别名已必填；withContact 开启时联系人 / 电话也已必填
            const { alias = '', saveToCommon = true, contact = '', contactPhone = '' } = result || {};
            this.pendingContact = contact;
            this.pendingContactPhone = contactPhone;
            // 仅勾选"保存到常用地址"时才调用保存接口
            if (saveToCommon && alias) {
                try {
                    await ensureCommonAddress(alias, this.pendingPoi, POINT_TYPE_TO_ADDRESS_TYPE[this.selectPointType]);
                } catch (error) {
                    console.error('saveCommonAddress error', error);
                    // 保存失败用 modal 提示，并按 B 方案阻断回传、停留重试
                    showModal({
                        title: '常用地址保存失败',
                        content: error || '保存失败，请重试',
                        showCancel: false,
                        confirmText: '我知道了',
                    });
                    return;
                }
            }
            // @by oh-my-zerone 2026-10-16 withContact 开启时把采集到的联系人随点位一并回传
            const poi = this.withContact ? { ...this.pendingPoi, contact, contactPhone } : this.pendingPoi;
            this.emitToCallerAndBack(alias, poi);
        },
        emitToCallerAndBack(alias, poi) {
            const location = poi?.location || '';
            const [x = '', y = ''] = String(location).split(',');
            this.emitToCaller({
                type: this.selectPointType,
                alias,
                poi,
                location: { x, y },
            });
            uni.navigateBack();
        },
        emitToCaller(res) {
            if (this.eventChannel) {
                this.eventChannel.emit('success', res);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.choose-location-page {
    min-height: 100vh;
    background-color: #eef0f5;
    display: flex;
    flex-direction: column;

    .title {
        text-align: center;
        margin-left: 130rpx;
        font-size: 32rpx;
        color: #333333;
        width: 100%;
        font-weight: bold;
    }

    .choose-location-content {
        flex: 1;
        padding: 20rpx 32rpx 24rpx;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-top: 0;
    }

    .search-bar-container {
        margin-bottom: 16rpx;
        padding: 12rpx 30rpx 12rpx 20rpx;
        background: #ffffff;
        box-sizing: border-box;
        border-radius: 20rpx;

        .search-bar {
            height: 80rpx;
            background: #f5f6fa;
            border-radius: 9rpx;
            padding: 0 32rpx;

            .dot-icon {
                width: 16rpx;
                height: 16rpx;
                background: #3a65ff;
                border-radius: 50%;
                margin-right: 24rpx;
                flex-shrink: 0;
            }

            .search-input {
                flex: 1;
                font-size: 32rpx;
                color: #333333;
            }

            .placeholder-style {
                color: #bbbbbb;
            }
        }
    }

    .quick-actions {
        height: 100rpx;
        background: #ffffff;
        border-radius: 20rpx;
        margin-bottom: 20rpx;

        .action-item {
            flex: 1;

            .action-text {
                font-family: PingFang SC, PingFang SC;
                font-weight: bold;
                font-size: 28rpx;
                color: #333333;
            }
        }

        .divider {
            width: 2rpx;
            height: 40rpx;
            background-color: #eeeeee;
            margin-top: 30rpx;
        }
    }

    .address-list-card {
        flex: 1;
        background: #ffffff;
        border-radius: 24rpx;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;

        .address-list-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            height: auto;

            .empty-wrapper {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .address-list {
                padding-top: 4rpx;
                padding-bottom: 16rpx;

                .address-item {
                    padding: 40rpx 34rpx 0 34rpx;

                    &:last-child {
                        border-bottom: none;
                    }

                    .location-icon-wrapper {
                        margin-right: 13rpx;
                        margin-top: 2rpx;

                        .location-icon {
                            width: 19rpx;
                            height: 22rpx;
                            display: flex;
                            margin-top: 8rpx;
                        }
                    }

                    .address-info {
                        flex: 1;
                        font-family: PingFang SC, PingFang SC;
                        color: #333333;

                        .address-title {
                            font-size: 28rpx;
                            font-family: PingFang SC-Bold, PingFang SC;
                            font-weight: bold;
                        }

                        .address-subtitle {
                            font-size: 20rpx;
                            font-weight: 400;
                        }
                    }

                    &.address-item--selected {
                        .address-title {
                            color: #3a65ff;
                        }
                    }

                    .selected-check {
                        flex-shrink: 0;
                        margin-left: 12rpx;

                        .selected-check-icon {
                            width: 36rpx;
                            height: 36rpx;
                            display: block;
                        }
                    }
                }
            }
        }

        .list-status-tip {
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            color: #999999;
        }

        .search-loading-tip {
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            color: #999999;
        }
    }

    .empty-wrapper {
        justify-content: center;
        align-items: center;
    }
}
</style>
