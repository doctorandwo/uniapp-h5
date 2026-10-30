<template>
    <view class="map-picker">
        <z1HeaderVue :hasBack="false" backgroundImage="linear-gradient(179deg, #EBF3FE 0%, rgba(212,222,235,0) 100%)" noFixedHeight>
            <view class="customize-back" @click="handleBack">
                <view class="back-arrow"></view>
            </view>
        </z1HeaderVue>
        <view class="map" :style="{ height: mapHeightPx + 'px' }">
            <MapView
                ref="mapView"
                :id="mapId"
                :longitude="mapCenter.longitude"
                :latitude="mapCenter.latitude"
                :scale="scale"
                show-location
                :markers="centerMarkers"
                :fit-view="false"
                @regionchange="onRegionChange"
                @tap="onMapTap"
            />
            <!-- @by oh-my-zerone 2026-10-23 地图展开 / 收起开关：点击切换地图显示尺寸 -->
            <view class="map-expand-btn" @tap.stop="toggleMapExpanded">{{ mapExpanded ? '收起' : '展开' }}</view>
        </view>
        <view class="menu" :style="{ top: mapHeightPx + 'px' }" @tap="onMenuTap">
            <view class="search-bar">
                <view class="search-input-wrapper">
                    <view class="search-icon"></view>
                    <input
                        class="search-input"
                        v-model="keyword"
                        type="text"
                        confirm-type="search"
                        placeholder="搜索地点、地址"
                        placeholder-class="search-placeholder"
                        @input="onKeywordInput"
                        @confirm="onKeywordConfirm"
                    />
                    <view class="search-loading" v-if="searchLoading"></view>
                    <view class="clear-icon" v-else-if="keyword" @click="clearKeyword"></view>
                </view>
                <view class="search-cancel" v-if="searchMode" @click="clearKeyword">取消</view>
            </view>
            <scroll-view class="list-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @scrolltolower="loadMore" @refresherrefresh="onRefresh">
                <view class="list">
                    <view class="list-item" :class="{ 'list-item-active': currentIndex === index }" v-for="(item, index) in list" :key="index" @click="handleSelect(item, index)">
                        <view class="ly-flex">
                            <view class="location-icon-wrapper">
                                <image class="location-icon" :src="$global.getImageUrl('pages_quoteCreate/icon-location.png')" mode="aspectFit" />
                            </view>
                            <view class="address-info">
                                <view class="address-title">
                                    <text v-for="(part, partIndex) in highlightParts(item.name)" :key="partIndex" :class="{ 'keyword-hit': part.hit }">{{ part.text }}</text>
                                    <!-- @by oh-my-zerone 2026-10-20 当前项额外展示其别名，与地图气泡「名称|别名」呼应 -->
                                    <text v-if="currentIndex === index && rawAlias" class="address-alias">{{ rawAlias }}</text>
                                </view>
                                <view class="address-subtitle">{{ item.address }}</view>
                            </view>
                        </view>
                        <view class="check-icon-wrapper" v-if="currentIndex === index">
                            <image class="check-icon" :src="$global.getImageUrl('pages_quoteCreate/icon-checked.png')" mode="aspectFit" />
                        </view>
                    </view>
                </view>
                <view class="list-empty" v-if="showEmpty">未找到相关地点，换个关键词试试</view>
            </scroll-view>
            <view class="bottom-bar">
                <z1-button
                    v-if="!pickOnly"
                    type="default"
                    plain
                    block
                    class="alias-btn"
                    :disabled="!canSetAlias"
                    @click="openAliasPopup"
                    width="220rpx"
                    :customStyle="{ height: '100rpx', lineHeight: '100rpx', fontSize: '34rpx', fontWeight: 'bold', borderRadius: '16rpx' }"
                    >地址别名</z1-button
                >
                <z1-button
                    :width="pickOnly ? '658rpx' : '414rpx'"
                    :type="confirmBtnType"
                    block
                    class="confirm-btn"
                    :disabled="!canConfirm"
                    @click="confirm"
                    :customStyle="confirmBtnStyle"
                    >确认地址</z1-button
                >
            </view>
        </view>
        <AliasPopup
            :show.sync="showAliasPopup"
            :address="selectedAddress"
            :alias="rawAlias"
            :show-contact="withContact"
            :contact="contact"
            :contact-phone="contactPhone"
            :save-to-common.sync="saveToCommon"
            @confirm="onAliasConfirm"
        />
    </view>
</template>

<script>
import z1HeaderVue from '@/components/Header/z1Header.vue';
import AliasPopup from '@/components/AliasPopup/index.vue';
import MapView from '@/components/MapView/index.vue';
import { searchNearbyPOI, searchPOIByKeyword, webGetAddress } from '@/common/platform/amap';
import { toShortProvinceCode, toShortCityCode, toShortDistrictCode } from '@/common/utils/adminCode.js';
import { showModal } from '@/common/platform/modal.js';

let uid = 0;

// 地图展开态下为列表区预留的高度（rpx）。
// 需覆盖「搜索栏约 112rpx + 底部按钮组约 177rpx + 少量列表」，保证底部按钮组完整可见；
// 若希望地图更大、可接受底部按钮被裁切，可下调此值。
const EXPAND_MENU_RESERVE_RPX = 340;
// 展开 / 收起过渡时长（ms），需与样式中的 transition 保持一致
const MAP_TRANSITION_MS = 300;

export default {
    name: 'MapPicker',
    components: { z1HeaderVue, AliasPopup, MapView },
    props: {
        type: { type: String, default: 'start' },
        longitude: { type: [String, Number], default: '' },
        latitude: { type: [String, Number], default: '' },
        initialAlias: { type: String, default: '' },
        // 上游已选地址回显：存在时以该坐标为中心打点，并在列表顶部注入"已选地址"默认勾选
        echo: { type: Object, default: null },
        // @by oh-my-zerone 2026-10-16 是否同时采集地址联系人 / 联系电话（默认关闭，既有调用方不受影响）
        withContact: { type: Boolean, default: false },
        // @by oh-my-zerone 2026-10-19 仅选点模式：确认时不强制别名、不回传保存到常用地址标志（地址簿表单回填场景）
        pickOnly: { type: Boolean, default: false },
    },
    data() {
        uid += 1;
        return {
            mapId: `map-picker-${uid}`,
            scale: 16,
            list: [],
            query: { pageNum: 1, pageSize: 10, radius: 5000, keywords: '', latitude: '', longitude: '' },
            mapCenter: { latitude: '', longitude: '' },
            markerCenter: { latitude: '', longitude: '' },
            name: '',
            visible: false,
            currentIndex: 0,
            isAnimating: false,
            isProgrammaticRegionChanging: false,
            rawAlias: '',
            // @by oh-my-zerone 2026-10-16 withContact 开启时由别名弹窗采集
            contact: '',
            contactPhone: '',
            // 是否保存到常用地址（由别名弹窗勾选框控制，默认 false：不勾选则不落库）
            saveToCommon: false,
            showAliasPopup: false,
            refreshing: false,
            loading: false,
            mapContext: null,
            dragging: false,
            // 搜索框输入值
            keyword: '',
            // 实际生效的搜索关键字（去空格后）
            searchKeyword: '',
            // 是否处于关键字搜索态（区别于拖动地图的周边态）
            searchMode: false,
            searchLoading: false,
            hasMore: true,
            // 自增请求 ID，用于丢弃过期（竞态）响应
            requestId: 0,
            // 当前列表是否由逆地理兜底项构成（无 POI 命中时为 true）
            usingFallback: false,
            _bounceTimeout: null,
            _selectTimeout: null,
            _searchTimer: null,
            // 地图是否处于展开态（展开时列表向下收缩，给地图腾出空间）
            mapExpanded: false,
            // 视窗尺寸（px），用于 rpx → px 换算与展开高度计算
            windowWidth: 0,
            windowHeight: 0,
            // 展开 / 收起过渡后的视野校正定时器
            _viewportTimer: null,
        };
    },
    computed: {
        selectedPoi() {
            return this.list[this.currentIndex] || null;
        },
        selectedName() {
            return this.selectedPoi?.name || this.name || '';
        },
        selectedAddress() {
            return this.selectedPoi?.address || '';
        },
        displayName() {
            return this.rawAlias ? `${this.selectedName}|${this.rawAlias}` : this.name;
        },
        canSetAlias() {
            return !!this.selectedPoi;
        },
        canConfirm() {
            return !!this.selectedPoi;
        },
        /**
         * 是否还需弹窗补齐联系人
         * @by oh-my-zerone 2026-10-16 withContact 开启时联系人 / 联系电话为必采集项
         */
        needContactInput() {
            if (!this.withContact) return false;
            return !String(this.contact || '').trim() || !String(this.contactPhone || '').trim();
        },
        confirmBtnType() {
            return this.canConfirm ? 'primary' : 'default';
        },
        /**
         * rpx → px 换算系数（以 750 设计宽为基准）。
         * @returns {number}
         */
        rpxRatio() {
            return (this.windowWidth || 375) / 750;
        },
        /**
         * 地图区高度（px）：折叠 600rpx；展开 = 视窗高度 − 列表区预留高度。
         * 预留高度需覆盖「搜索栏(约112rpx) + 底部按钮组(约177rpx) + 少量列表」，
         * 保证展开态下底部「地址别名 / 确认地址」仍完整可见。
         * @returns {number}
         */
        mapHeightPx() {
            const collapsed = 600 * this.rpxRatio;
            if (!this.mapExpanded) return collapsed;
            const expanded = this.windowHeight - EXPAND_MENU_RESERVE_RPX * this.rpxRatio;
            // 小屏兜底：展开高度不得小于折叠高度
            return Math.max(expanded, collapsed);
        },
        /**
         * 确认按钮内联样式：仅选点模式（无别名按钮）取消左侧间距，视觉上占满整行
         * @returns {Object} 内联样式对象
         */
        confirmBtnStyle() {
            return {
                height: '100rpx',
                lineHeight: '100rpx',
                fontSize: '34rpx',
                fontWeight: 'bold',
                borderRadius: '16rpx',
                marginLeft: this.pickOnly ? '0' : '24rpx',
            };
        },
        // 搜索态未命中任何 POI 时展示空态（含已用兜底项兜底的情况）
        showEmpty() {
            return this.searchMode && !this.searchLoading && (this.list.length === 0 || this.usingFallback);
        },
        centerMarkers() {
            if (this.dragging) return [];
            if (!this.markerCenter.latitude || !this.markerCenter.longitude) return [];
            return [
                {
                    id: 1,
                    latitude: Number(this.markerCenter.latitude),
                    longitude: Number(this.markerCenter.longitude),
                    iconPath: this.$global.getImageUrl('pages_quoteCreate/icon-location-select.png'),
                    width: 24,
                    height: 34,
                    anchor: { x: 0, y: 0 },
                    callout: {
                        content: this.formatCalloutContent(this.displayName),
                        color: '#333333',
                        fontSize: 12,
                        borderRadius: 6,
                        bgColor: '#ffffff',
                        padding: 8,
                        display: 'ALWAYS',
                        textAlign: 'center',
                    },
                },
            ];
        },
    },
    mounted() {
        // 视窗尺寸：用于 rpx → px 换算与展开高度计算
        try {
            const info = uni.getSystemInfoSync();
            this.windowWidth = info.windowWidth || 0;
            this.windowHeight = info.windowHeight || 0;
        } catch (e) {
            this.windowWidth = 0;
            this.windowHeight = 0;
        }
        this.rawAlias = this.initialAlias || '';
        // @by oh-my-zerone 2026-10-20 回显先于周边 POI 请求灌入，避免网络返回前打开弹窗取到空值
        this.applyEcho();
        this.setCurrentLocationMarkers({ latitude: this.latitude, longitude: this.longitude });
    },
    beforeDestroy() {
        if (this._bounceTimeout) clearTimeout(this._bounceTimeout);
        if (this._selectTimeout) clearTimeout(this._selectTimeout);
        if (this._dragWatchdog) clearTimeout(this._dragWatchdog);
        if (this._searchTimer) clearTimeout(this._searchTimer);
        if (this._viewportTimer) clearTimeout(this._viewportTimer);
    },
    methods: {
        handleBack() {
            uni.navigateBack();
        },
        /**
         * 切换地图展开 / 收起，并刷新地图视野。
         * @returns {void}
         */
        toggleMapExpanded() {
            this.mapExpanded = !this.mapExpanded;
            this.syncMapViewport();
        },
        /**
         * 点击地图空白：展开态下收起（折叠态点击地图不放大，避免误触）。
         * @returns {void}
         */
        onMapTap() {
            if (this.mapExpanded) this.toggleMapExpanded();
        },
        /**
         * 点击列表区域（搜索栏 / 列表）：展开态下收起，把空间还给列表。
         * @returns {void}
         */
        onMenuTap() {
            if (this.mapExpanded) this.toggleMapExpanded();
        },
        /**
         * 地图尺寸变化后的视野校正：
         * 1) 立即 + 过渡结束后各刷新一次地图尺寸（H5 高德不会自动感知容器高度变化）；
         * 2) 过渡结束后把中心校正回选点坐标，避免容器高度变化导致可视中心漂移。
         * @returns {void}
         */
        syncMapViewport() {
            const mapView = this.$refs.mapView;
            if (!mapView) return;
            if (this._viewportTimer) clearTimeout(this._viewportTimer);
            this.$nextTick(() => mapView.resize());
            this._viewportTimer = setTimeout(() => {
                this._viewportTimer = null;
                mapView.resize();
                // #ifdef H5
                // 仅 H5 需要校正中心：高德容器高度变化后可视中心会漂移，需拉回选点坐标；
                // 小程序原生 <map> 随布局自适应并保持中心，多余的一次移动反而可能造成跳动。
                if (this.markerCenter && this.markerCenter.latitude && this.markerCenter.longitude) {
                    mapView.setCenter(this.markerCenter.longitude, this.markerCenter.latitude);
                }
                // #endif
            }, MAP_TRANSITION_MS + 50);
        },
        /**
         * 用上游已选地址（echo）初始化别名与联系人，供别名弹窗回显。
         * 幂等：字段为空时不覆盖已有值，可在 mounted（同步）与回显条目注入后各调用一次。
         * @by oh-my-zerone 2026-10-20
         * @returns {void}
         */
        applyEcho() {
            const echo = this.echo;
            if (!echo) return;
            if (echo.alias) this.rawAlias = echo.alias;
            // 联系人仅在开启采集时有意义，未开启时保持空值，避免污染下游 payload
            if (!this.withContact) return;
            if (echo.contact) this.contact = String(echo.contact);
            if (echo.contactPhone) this.contactPhone = String(echo.contactPhone);
        },
        /**
         * 按选中项重置别名与联系人采集值。
         * 仅「已选地址」回显条目自带别名 / 联系人，其余 POI 一律清空，
         * 保证切换到无联系人的地点后，别名弹窗里的联系人 / 联系电话是空的。
         * @by oh-my-zerone 2026-10-20
         * @param {Object} [item] 选中的列表项；不传（换址、拖动、刷新）表示全部清空
         * @returns {void}
         */
        resetCollected(item) {
            const isEcho = !!(item && item.isEcho);
            this.rawAlias = isEcho ? item.alias || '' : '';
            if (!this.withContact) return;
            this.contact = isEcho ? item.contact || '' : '';
            this.contactPhone = isEcho ? item.contactPhone || '' : '';
        },
        /**
         * 搜索框输入事件：防抖 300ms 后自动搜索
         * @param {Object} e - input 事件对象
         * @returns {void}
         */
        onKeywordInput(e) {
            this.keyword = e.detail.value || '';
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => {
                this.startSearch();
            }, 300);
        },
        /**
         * 软键盘「搜索」键：立即执行搜索
         * @returns {void}
         */
        onKeywordConfirm() {
            this.startSearch();
        },
        /**
         * 根据当前输入关键字发起搜索；关键字为空则退出搜索态回到周边态
         * @returns {Promise<void>}
         */
        async startSearch() {
            clearTimeout(this._searchTimer);
            const kw = (this.keyword || '').trim();
            if (!kw) {
                this.exitSearchMode();
                return;
            }
            this.searchMode = true;
            this.searchKeyword = kw;
            this.query.keywords = kw;
            await this.resetAndSearch();
        },
        /**
         * 清空关键字并恢复周边 POI 列表
         * @returns {Promise<void>}
         */
        async clearKeyword() {
            this.keyword = '';
            this.exitSearchMode();
        },
        /**
         * 清空关键字相关状态并回到周边态（不重新请求）
         * @returns {void}
         */
        clearSearchState() {
            clearTimeout(this._searchTimer);
            this.keyword = '';
            this.searchKeyword = '';
            this.searchMode = false;
            this.query.keywords = '';
        },
        /**
         * 退出搜索态，按当前地图中心重新拉取周边列表
         * @returns {Promise<void>}
         */
        async exitSearchMode() {
            this.clearSearchState();
            await this.resetAndSearch();
        },
        /**
         * 重置分页并重新拉取列表，成功后默认选中第一条
         * @returns {Promise<void>}
         */
        async resetAndSearch() {
            this.query.pageNum = 1;
            this.list = [];
            this.currentIndex = 0;
            // @by oh-my-zerone 2026-10-20 重新搜索即换址，清空别名与联系人采集值
            this.resetCollected(null);
            this.hasMore = true;
            await this.getSearchList();
            await this.ensureSelectable();
            if (this.list.length > 0) {
                this.handleSelect(this.list[0], 0);
            }
        },
        /**
         * 把文本按关键字切分为高亮片段，用于搜索结果关键字高亮
         * @param {String} text - 待处理的文本
         * @returns {Array<{text: String, hit: Boolean}>} 片段数组，hit 为 true 表示命中关键字
         */
        highlightParts(text) {
            const str = String(text || '');
            const kw = String(this.searchKeyword || '').trim();
            if (!kw) return [{ text: str, hit: false }];
            const lowerStr = str.toLowerCase();
            const lowerKw = kw.toLowerCase();
            const parts = [];
            let start = 0;
            let index = lowerStr.indexOf(lowerKw);
            while (index !== -1) {
                if (index > start) parts.push({ text: str.slice(start, index), hit: false });
                parts.push({ text: str.slice(index, index + lowerKw.length), hit: true });
                start = index + lowerKw.length;
                index = lowerStr.indexOf(lowerKw, start);
            }
            if (start < str.length) parts.push({ text: str.slice(start), hit: false });
            return parts.length ? parts : [{ text: str, hit: false }];
        },
        formatCalloutContent(text) {
            if (!text) return '';
            const maxLen = 15;
            return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
        },
        _lockRegionChange() {
            this.isProgrammaticRegionChanging = true;
            clearTimeout(this._selectTimeout);
            this._selectTimeout = setTimeout(() => {
                this.isProgrammaticRegionChanging = false;
                console.log('[MapPicker] regionchange lock released by timeout');
            }, 800);
            console.log('[MapPicker] regionchange lock set');
        },
        async setCurrentLocationMarkers(options) {
            this._lockRegionChange();
            let lat = '';
            let lng = '';
            // 回显优先：echo 携带有效坐标时以已选坐标为中心，否则用入参坐标，最后降级 GPS
            const centerLat = (this.echo && this.echo.latitude) || options.latitude;
            const centerLng = (this.echo && this.echo.longitude) || options.longitude;
            if (centerLat && centerLng) {
                this.query.latitude = centerLat;
                this.query.longitude = centerLng;
                this.mapCenter = { latitude: centerLat, longitude: centerLng };
                this.markerCenter = { latitude: centerLat, longitude: centerLng };
                lat = centerLat;
                lng = centerLng;
                console.log('[MapPicker] init from echo/options', { lat, lng, mapCenter: this.mapCenter });
            } else {
                try {
                    const { latitude, longitude } = await uni.getLocationPlus();
                    this.query.latitude = latitude;
                    this.query.longitude = longitude;
                    this.mapCenter = { latitude, longitude };
                    this.markerCenter = { latitude, longitude };
                    lat = latitude;
                    lng = longitude;
                    console.log('[MapPicker] init from locationPlus', { lat, lng, mapCenter: this.mapCenter });
                } catch (error) {
                    this.isProgrammaticRegionChanging = false;
                    clearTimeout(this._selectTimeout);
                    uni.showToast({ title: '获取位置失败', icon: 'none' });
                    return;
                }
            }
            this.query.pageNum = 1;
            this.list = [];
            this.hasMore = true;
            await this.getSearchList();
            await this.ensureSelectable();
            // 完整回显：注入"已选地址"条目并默认勾选，可直接确认
            if (this.echo && this.echo.latitude && this.echo.longitude) {
                const echoEntry = this.buildEchoEntry(this.echo);
                this.list = [echoEntry, ...this.list];
                this.currentIndex = 0;
                this.name = echoEntry.name;
                // @by oh-my-zerone 2026-10-20 注入回显条目的同时补齐别名 / 联系人，打开别名弹窗即可带出
                this.applyEcho();
                this.query = { ...this.query, ...echoEntry, latitude: lat, longitude: lng };
                this.visible = true;
            } else if (this.list.length > 0) {
                this.currentIndex = 0;
                this.name = this.list[0].name;
                this.query = { ...this.query, ...this.list[0], latitude: lat, longitude: lng };
                this.visible = true;
            }
        },
        /**
         * 构造回显用的"已选地址"列表项（与归一化 POI 结构对齐，confirm 时可直接回传）。
         * @param {Object} echo 回显对象 { longitude, latitude, name, address, alias, provinceCode... }
         * @returns {Object} 列表项
         */
        buildEchoEntry(echo) {
            const location = `${echo.longitude},${echo.latitude}`;
            return {
                id: 'echo-selected',
                name: echo.name,
                address: echo.address,
                location,
                // @by oh-my-zerone 2026-10-20 复用上游别名 / 联系人，重新点回该项时可原样带出
                alias: echo.alias || '',
                contact: echo.contact || '',
                contactPhone: echo.contactPhone || '',
                provinceCode: echo.provinceCode,
                cityCode: echo.cityCode,
                districtCode: echo.districtCode,
                province: echo.province,
                city: echo.city,
                district: echo.district,
                isEcho: true,
            };
        },
        async getSearchList() {
            // 自增请求 ID，响应用于丢弃过期结果，避免快速输入导致乱序覆盖
            const requestId = this.requestId + 1;
            this.requestId = requestId;
            const isSearchMode = this.searchMode;
            if (isSearchMode) this.searchLoading = true;
            try {
                const location = `${this.query.longitude},${this.query.latitude}`;
                const res = isSearchMode
                    ? await searchPOIByKeyword(this.searchKeyword, location, {
                          pageNum: this.query.pageNum,
                          pageSize: this.query.pageSize,
                          radius: this.query.radius,
                      })
                    : await searchNearbyPOI(location, this.query.keywords, this.query.radius, this.query.pageNum, this.query.pageSize);
                if (requestId !== this.requestId) return;
                if (!Array.isArray(res) || res[0]) {
                    console.error('getSearchList error:', Array.isArray(res) ? res[0] : res);
                    uni.showToast({ title: isSearchMode ? '搜索地点失败' : '搜索附近地点失败', icon: 'none' });
                    return;
                }
                const pois = Array.isArray(res[1]) ? res[1] : [];
                this.hasMore = pois.length >= this.query.pageSize;
                if (pois.length === 0) return;
                const existingKeys = new Set(this.list.map(i => i.location));
                const newItems = pois.map(item => this.normalizePOI(item)).filter(item => !existingKeys.has(item.location));
                this.list = [...this.list, ...newItems];
            } catch (error) {
                if (requestId !== this.requestId) return;
                console.error('getSearchList error:', error);
                uni.showToast({ title: isSearchMode ? '搜索地点失败' : '搜索附近地点失败', icon: 'none' });
                return;
            } finally {
                if (requestId === this.requestId) this.searchLoading = false;
            }
        },
        /**
         * 列表为空时，用逆地理编码生成一条占位 POI，保证任意位置都能确认地址
         * @returns {Promise<void>}
         */
        async ensureSelectable() {
            if (this.list.length > 0) {
                this.usingFallback = false;
                return;
            }
            if (!this.query.latitude || !this.query.longitude) return;
            const poi = await this.buildFallbackPoi(this.query.longitude, this.query.latitude);
            this.usingFallback = !!poi;
            if (poi) this.list = [poi];
        },
        /**
         * 逆地理编码构造兜底 POI（周边 / 搜索均无结果时使用）
         * @param {String|Number} longitude - 经度
         * @param {String|Number} latitude - 纬度
         * @returns {Promise<Object|null>} 归一化后的 POI，失败返回 null
         */
        async buildFallbackPoi(longitude, latitude) {
            const [err, regeocode] = await webGetAddress({ longitude, latitude });
            if (err || !regeocode) return null;
            const component = regeocode.addressComponent || {};
            // extensions=all 下省市区可能返回数组，统一取第一项
            const pick = val => (Array.isArray(val) ? val[0] : val) || '';
            const adcode = pick(component.adcode);
            const formatted = pick(regeocode.formatted_address);
            const nearest = (regeocode.pois || [])[0] || {};
            return this.normalizePOI({
                name: pick(nearest.name) || formatted || '当前位置',
                address: pick(nearest.address) || formatted,
                location: `${longitude},${latitude}`,
                // 省码取 adcode 前 2 位，与 normalizePOI 的短码规则一致
                pcode: adcode,
                adcode,
                pname: pick(component.province),
                cityname: pick(component.city) || pick(component.province),
                adname: pick(component.district),
            });
        },
        async onRegionChange(e) {
            const detail = e.detail || e;
            const causedBy = detail.causedBy || '';
            const type = detail.type || '';
            console.log('[MapPicker] regionchange', {
                type,
                causedBy,
                isProgrammaticRegionChanging: this.isProgrammaticRegionChanging,
                query: { lat: this.query.latitude, lng: this.query.longitude },
                mapCenter: this.mapCenter,
            });
            // @by oh-my-zerone 2026-10-22 缩放（scale）不作为选点手势：缩放不改变选点意图，
            // 中心标点应保持原位——不隐藏、不重定位、不触发回弹，也不刷新周边列表
            // （周边搜索半径为固定值，缩放后刷新结果不变，无意义）
            // @by oh-my-zerone 2026-10-23 但必须先复位 dragging：H5 上 movestart 可能先于
            // zoomstart 到达（begin/drag 已抛出，end 却以 scale 收尾），若直接 return，
            // dragging 会永远停在 true，中心标点被 centerMarkers 过滤掉 → 真机偶现「mark 消失」
            if (causedBy === 'scale') {
                this.finishDragging();
                return;
            }
            if (causedBy && !['drag', 'scale', 'update'].includes(causedBy)) {
                return;
            }
            if (this.isProgrammaticRegionChanging) {
                console.log('[MapPicker] regionchange ignored by lock');
                // 同理：被锁吞掉的 end 也必须复位 dragging，否则标点永久隐藏
                this.finishDragging();
                return;
            }
            if (type === 'begin') {
                this.dragging = true;
                this.visible = false;
                this.armDragWatchdog();
            }
            if (type === 'end') {
                // @by oh-my-zerone 2026-10-22 改用 MapView.getCenterLocation（跨端：MP 走原生 context，H5 走高德 center）
                const res = await this.$refs.mapView.getCenterLocation();
                // 取中心失败同样要复位 dragging，避免标点卡在隐藏态
                if (!res) {
                    this.finishDragging();
                    return;
                }
                console.log('[MapPicker] getCenterLocation', res);
                this.query.longitude = res.longitude;
                this.query.latitude = res.latitude;
                // 拖动地图后清空关键字，回到周边态，按新中心拉取周边 POI
                this.clearSearchState();
                this.query.pageNum = 1;
                this.list = [];
                // @by oh-my-zerone 2026-10-20 拖动地图即换址，清空别名与联系人采集值
                this.resetCollected(null);
                this.hasMore = true;
                await this.getSearchList();
                await this.ensureSelectable();
                this.currentIndex = 0;
                if (this.list.length > 0) {
                    this.name = this.list[0].name;
                    this.query = { ...this.query, ...this.list[0], latitude: res.latitude, longitude: res.longitude };
                    // @by oh-my-zerone 2026-10-22 mapCenter 需与拖动后的实际中心同步：
                    // MapView 的 latitude/longitude 绑定的是 mapCenter，不同步的话
                    // 后续任何 props 驱动的视野同步都会把地图拽回拖动前的旧中心
                    // this.mapCenter = { latitude: res.latitude, longitude: res.longitude };
                    this.markerCenter = { latitude: res.latitude, longitude: res.longitude };
                    this.finishDragging();
                    this.triggerBounce();
                } else {
                    // this.mapCenter = { latitude: res.latitude, longitude: res.longitude };
                    this.markerCenter = { latitude: res.latitude, longitude: res.longitude };
                    this.finishDragging();
                }
            }
        },
        /**
         * 结束「拖动隐藏中心标点」状态：复位 dragging 并撤掉看门狗。
         * 所有可能的收尾分支（正常 end、缩放、程序化锁、取中心失败）都走这里，
         * 保证 dragging 不会卡在 true 导致 centerMarkers 被清空（mark 消失）。
         * @returns {void}
         */
        finishDragging() {
            if (this._dragWatchdog) {
                clearTimeout(this._dragWatchdog);
                this._dragWatchdog = null;
            }
            this.dragging = false;
        },
        /**
         * 拖动看门狗：begin 后若 1.5s 内未收到配对的 end（手势中断 / 事件被吞），
         * 自动复位 dragging，兜底避免中心标点永久隐藏。
         * @returns {void}
         */
        armDragWatchdog() {
            if (this._dragWatchdog) clearTimeout(this._dragWatchdog);
            this._dragWatchdog = setTimeout(() => {
                this._dragWatchdog = null;
                if (this.dragging) {
                    console.log('[MapPicker] drag watchdog reset dragging');
                    this.dragging = false;
                }
            }, 1500);
        },
        triggerBounce() {
            this.isAnimating = false;
            this.$nextTick(() => {
                this._bounceTimeout = setTimeout(() => {
                    this.isAnimating = true;
                    this._bounceTimeout = setTimeout(() => {
                        this.isAnimating = false;
                        this.visible = true;
                    }, 200);
                }, 10);
            });
        },
        handleSelect(val, index) {
            clearTimeout(this._selectTimeout);
            this.currentIndex = index;
            const location = val.location.split(',');
            this._lockRegionChange();
            this.mapCenter = { latitude: location[1], longitude: location[0] };
            this.markerCenter = { latitude: location[1], longitude: location[0] };
            // #ifdef H5
            // @by oh-my-zerone 2026-10-23 命令式把地图中心移到该 POI，确保「点击即以此点为中心」。
            // 仅靠 mapCenter props 差分驱动时，若目标值与当前 props 相同（拖动后 mapCenter 未同步、
            // 或重复点击同一项），watcher 不触发，H5 地图就不会移动。
            if (this.$refs.mapView) {
                this.$refs.mapView.setCenter(location[0], location[1]);
            }
            // #endif
            this.query = {
                ...this.query,
                ...val,
                longitude: location[0],
                latitude: location[1],
            };
            this.name = val.name;
            // @by oh-my-zerone 2026-10-20 仅回显条目保留别名 / 联系人，其余项清空，避免沿用上一个地址的采集值
            this.resetCollected(val);
            console.log('[MapPicker] handleSelect moved mapCenter and updated query', {
                query: { lat: this.query.latitude, lng: this.query.longitude },
                mapCenter: this.mapCenter,
            });
        },
        loadMore() {
            if (this.refreshing) return;
            if (this.loading) return;
            if (!this.hasMore) return;
            this.loading = true;
            this.query.pageNum++;
            this.getSearchList().finally(() => {
                this.loading = false;
            });
        },
        async onRefresh() {
            if (this.loading) return;
            this.loading = true;
            this.refreshing = true;
            try {
                this.query.pageNum = 1;
                this.list = [];
                // @by oh-my-zerone 2026-10-20 下拉刷新即换址，清空别名与联系人采集值
                this.resetCollected(null);
                this.hasMore = true;
                await this.getSearchList();
                await this.ensureSelectable();
                this.currentIndex = 0;
                if (this.list.length > 0) {
                    this.name = this.list[0].name;
                    this.query = { ...this.query, ...this.list[0], latitude: this.query.latitude, longitude: this.query.longitude };
                }
            } finally {
                this.refreshing = false;
                this.loading = false;
            }
        },
        openAliasPopup() {
            if (!this.canSetAlias) return;
            this.showAliasPopup = true;
        },
        normalizePOI(item) {
            const adcode = item.adcode || '';
            return {
                ...item,
                provinceCode: toShortProvinceCode(item.pcode),
                cityCode: toShortCityCode(adcode),
                districtCode: toShortDistrictCode(adcode),
                province: item.pname || item.province || '',
                city: item.cityname || item.city || '',
                district: item.adname || item.district || '',
            };
        },
        onAliasConfirm(result) {
            // result: { alias, saveToCommon, contact, contactPhone }
            // @by oh-my-zerone 2026-10-20 缺省与判定统一为 false：未明确勾选即不落库
            const { alias = '', saveToCommon = false, contact = '', contactPhone = '' } = result || {};
            this.rawAlias = alias;
            this.saveToCommon = saveToCommon === true;
            // @by oh-my-zerone 2026-10-16 withContact 开启时同步接收联系人 / 联系电话
            this.contact = contact;
            this.contactPhone = contactPhone;
        },
        /**
         * 获取地图打点（marker）所在位置的坐标，格式 "经度,纬度"
         * @returns {String} 打点坐标；打点缺失时回退到当前查询坐标
         */
        getMarkerLocation() {
            const { longitude, latitude } = this.markerCenter || {};
            const hasMarker = longitude !== '' && latitude !== '' && longitude != null && latitude != null;
            return hasMarker ? `${longitude},${latitude}` : `${this.query.longitude},${this.query.latitude}`;
        },
        confirm() {
            if (!this.canConfirm) return;
            const alias = String(this.rawAlias || '').trim();
            // @by oh-my-zerone 2026-10-16 别名 / 联系人缺失时直接调起弹窗收集（原为 modal 提示，需用户自行寻找「地址别名」按钮）
            // @by oh-my-zerone 2026-10-19 仅选点模式跳过别名/联系人强制采集，交由下游表单页收集
            if (!this.pickOnly && (!alias || this.needContactInput)) {
                if (this.canSetAlias) {
                    this.openAliasPopup();
                    return;
                }
                // 兜底：无选中点位（弹窗无法调起）时仍用 modal 提示
                showModal({
                    title: '提示',
                    content: '请先设置别名',
                    showCancel: false,
                    confirmText: '我知道了',
                });
                return;
            }
            // 以地图打点位置的经纬度为准，保证与用户看到的位置一致
            const markerLocation = this.getMarkerLocation();
            const poi = { ...this.selectedPoi, location: markerLocation };
            // @by oh-my-zerone 2026-10-16 withContact 开启时把弹窗采集的联系人随点位回传
            if (this.withContact) {
                poi.contact = this.contact;
                poi.contactPhone = this.contactPhone;
            }
            const [x, y] = markerLocation.split(',');
            this.$emit('confirm', {
                type: this.type,
                alias,
                poi,
                location: { x, y },
                // @by oh-my-zerone 2026-10-19 仅选点模式不落库，由下游表单页统一提交
                saveToCommon: this.pickOnly ? false : this.saveToCommon,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.map-picker {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #f8f8f8;

    .customize-back {
        width: 60rpx;
        height: 60rpx;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0rpx 3rpx 6rpx 1rpx rgba(0, 0, 0, 0.16);

        .back-arrow {
            width: 18rpx;
            height: 18rpx;
            border-left: 4rpx solid #333333;
            border-bottom: 4rpx solid #333333;
            transform: rotate(45deg);
            margin-left: 6rpx;
        }
    }

    /deep/.z1-header {
        background-attachment: initial !important;
    }

    .map {
        // 高度由 mapHeightPx 动态绑定（折叠 600rpx / 展开视窗高度 − 预留）
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        // @by oh-my-zerone 2026-10-23 展开 / 收起过渡：与 MAP_TRANSITION_MS 保持一致
        transition: height 0.3s ease;
    }

    /**
     * @by oh-my-zerone 2026-10-23 地图展开 / 收起开关
     * 位于地图右上角、避开顶部导航（状态栏 + 导航栏）区域
     */
    .map-expand-btn {
        position: absolute;
        top: 180rpx;
        right: 24rpx;
        z-index: 20;
        padding: 12rpx 24rpx;
        font-size: 24rpx;
        line-height: 32rpx;
        color: #1f2430;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 32rpx;
        box-shadow: 0rpx 3rpx 10rpx rgba(0, 0, 0, 0.16);
    }

    .menu {
        position: absolute;
        // top 由 mapHeightPx 动态绑定，与地图高度联动
        left: 0;
        width: 100%;
        bottom: 0;
        background-color: #fff;
        border-radius: 32rpx 32rpx 0 0;
        display: flex;
        flex-direction: column;
        transition: top 0.3s ease;
    }

    .search-bar {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding: 24rpx 32rpx 16rpx;
        background-color: #fff;
        border-radius: 32rpx 32rpx 0 0;

        .search-input-wrapper {
            flex: 1;
            min-width: 0;
            height: 72rpx;
            display: flex;
            align-items: center;
            padding: 0 24rpx;
            background-color: #f5f6fa;
            border-radius: 36rpx;

            .search-icon {
                position: relative;
                flex-shrink: 0;
                width: 26rpx;
                height: 26rpx;
                margin-right: 14rpx;
                border: 3rpx solid #999999;
                border-radius: 50%;
                box-sizing: border-box;

                &::after {
                    content: '';
                    position: absolute;
                    right: -8rpx;
                    bottom: -4rpx;
                    width: 12rpx;
                    height: 3rpx;
                    background: #999999;
                    border-radius: 2rpx;
                    transform: rotate(45deg);
                }
            }

            .search-input {
                flex: 1;
                min-width: 0;
                height: 72rpx;
                font-size: 28rpx;
                color: #333333;
            }

            .search-placeholder {
                font-size: 28rpx;
                color: #999999;
            }

            .clear-icon {
                position: relative;
                flex-shrink: 0;
                width: 32rpx;
                height: 32rpx;
                margin-left: 12rpx;
                background: #c8c9cc;
                border-radius: 50%;

                &::before,
                &::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 16rpx;
                    height: 2rpx;
                    background: #ffffff;
                }

                &::before {
                    transform: translate(-50%, -50%) rotate(45deg);
                }

                &::after {
                    transform: translate(-50%, -50%) rotate(-45deg);
                }
            }

            .search-loading {
                flex-shrink: 0;
                width: 28rpx;
                height: 28rpx;
                margin-left: 16rpx;
                border: 3rpx solid #e5e5e5;
                border-top-color: #999999;
                border-radius: 50%;
                animation: searchSpin 0.8s linear infinite;
            }
        }

        .search-cancel {
            flex-shrink: 0;
            padding-left: 24rpx;
            font-size: 28rpx;
            color: #333333;
        }
    }

    .list-scroll {
        flex: 1;
        min-height: 0;
        width: 100%;
        overflow: hidden;
    }

    .list {
        border-radius: 32rpx 32rpx 0 0;
    }

    .list-empty {
        padding: 120rpx 0;
        text-align: center;
        font-size: 26rpx;
        color: #999999;
    }

    .keyword-hit {
        color: #2b6cff;
    }

    .list-item {
        display: flex;
        align-items: flex-start;
        margin: 0 29rpx 0 21rpx;
        padding: 25rpx 41rpx 21rpx 29rpx;
        background-color: #fff;

        .location-icon-wrapper {
            flex-shrink: 0;

            .location-icon {
                width: 19rpx;
                height: 22rpx;
                margin-right: 13rpx;
            }
        }

        .check-icon-wrapper {
            flex-shrink: 0;

            .check-icon {
                width: 36rpx;
                height: 36rpx;
            }
        }

        .address-info {
            flex: 1;
            min-width: 0;
            margin-right: 16rpx;
            font-family: PingFang SC, PingFang SC;

            .address-title {
                font-family: PingFang SC-Bold, PingFang SC;
                font-weight: bold;
                font-size: 30rpx;
                color: #333333;

                /* @by oh-my-zerone 2026-10-20 选中项别名标签 */
                .address-alias {
                    display: inline-block;
                    margin-left: 12rpx;
                    padding: 2rpx 12rpx;
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 20rpx;
                    color: #3a65ff;
                    background: rgba(58, 101, 255, 0.12);
                    border-radius: 6rpx;
                    vertical-align: middle;
                    max-width: 220rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            .address-subtitle {
                font-size: 20rpx;
                font-weight: 400;
                color: #999;
            }
        }
    }

    .list-item:last-of-type {
        margin-bottom: 0;
    }

    .list-item-active {
        background: #f5f6fa;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .bottom-bar {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 46rpx 57rpx;
        background-color: #fff;
        box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
        z-index: 100;

        .alias-btn,
        .confirm-btn {
            width: 100%;
            height: 100rpx;
            line-height: 100rpx;
            font-size: 34rpx;
            font-weight: bold;
            border-radius: 16rpx;
        }

        .alias-btn {
            width: 220rpx;
        }

        .confirm-btn {
            margin-left: 24rpx;
        }
    }

    .marker-container {
        position: absolute;
        top: 300rpx;
        left: 50%;
        width: 520rpx;
        height: 260rpx;
        margin-left: -260rpx;
        margin-top: -130rpx;
        pointer-events: none;
    }

    .map-location-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -130%) scale(0);
        pointer-events: none;
        z-index: 200;
        background: #ffffff;
        padding: 16rpx 24rpx;
        box-shadow: 0 3rpx 20rpx 1rpx rgba(0, 0, 0, 0.2);
        border-radius: 13rpx;
        transition: all 0.3s ease-out;
        transition-delay: 0.3s;
        opacity: 0;
        max-width: 368rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 24rpx;
    }

    .label-pop {
        opacity: 1;
        transform: translate(-50%, -130%) scale(1);
    }

    .map-location {
        width: 48rpx;
        height: 68rpx;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -100%);
        z-index: 100;
        pointer-events: none;
    }

    @keyframes searchSpin {
        0% {
            transform: rotate(0);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    /* 动画类 */
    .drop-anim {
        animation: simpleDrop 0.6s linear;
    }

    @keyframes simpleDrop {
        0% {
            transform: translate(-50%, -50%) translateY(-50px);
            opacity: 0;
        }

        25% {
            transform: translate(-50%, -50%) translateY(-30px);
            opacity: 1;
        }

        50% {
            transform: translate(-50%, -50%) translateY(-15px);
            opacity: 1;
        }

        100% {
            transform: translate(-50%, -50%) translateY(0);
            opacity: 1;
        }
    }
}
</style>
