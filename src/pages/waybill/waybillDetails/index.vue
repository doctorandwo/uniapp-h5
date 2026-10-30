<template>
    <!--
      地图 + 列表同在 SubPageLayout scroll-view 内；list 上叠 208rpx；
      地图拖拽/缩放开启。勿再外置地图 / 模式切换 / pointer-events 透传。
    -->
    <view class="page-waybill-details-root">
    <SubPageLayout
        class="page-waybill-details"
        title="运单详情"
        bg="#dce5fa"
        body-padding="0"
        :header-background="headerBg"
        :no-fixed-height="true"
        :header-z-index="10"
        :dark="false"
        :footer-buttons="footerPlaceholder"
        @scroll="onScroll"
        @scrolltolower="scrolltolower"
    >
        <view class="header-bg1"></view>
        <view class="content-wrapper">
            <!-- 地图：与列表同在滚动流内 -->
            <view class="map-wrap">
                <!-- #ifdef H5 -->
                <view id="waybill-detail-amap" class="map"></view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <map
                    v-if="latitude !== null && longitude !== null"
                    id="waybillDetailMap"
                    class="map"
                    :latitude="latitude"
                    :longitude="longitude"
                    :scale="scale"
                    :markers="mapMarkers"
                    :polyline="mapPolyline"
                    :show-location="false"
                    :enable-scroll="true"
                    :enable-zoom="true"
                    @regionchange="onRegionChange"
                >
                    <!-- @by oh-my-zerone 2026-10-29 起终点气泡样式对齐 QuoteMap/MapView：角标+白底地址卡+箭头+引导线 -->
                    <cover-view slot="callout">
                        <cover-view v-if="startPoint" marker-id="1" class="mp-callout">
                            <cover-view class="mp-callout__stack">
                                <cover-view class="mp-callout__tag mp-callout__tag--start">起点</cover-view>
                                <cover-view class="mp-callout__bubble mp-callout__bubble--tagged">
                                    <cover-view class="mp-callout__text">{{ startMarkerText }}</cover-view>
                                    <cover-view class="mp-callout__arrow">›</cover-view>
                                </cover-view>
                            </cover-view>
                            <cover-view class="mp-callout__line"></cover-view>
                        </cover-view>
                        <cover-view v-if="endPoint" marker-id="2" class="mp-callout">
                            <cover-view class="mp-callout__stack">
                                <cover-view class="mp-callout__tag mp-callout__tag--end">终点</cover-view>
                                <cover-view class="mp-callout__bubble mp-callout__bubble--tagged">
                                    <cover-view class="mp-callout__text">{{ endMarkerText }}</cover-view>
                                    <cover-view class="mp-callout__arrow">›</cover-view>
                                </cover-view>
                            </cover-view>
                            <cover-view class="mp-callout__line"></cover-view>
                        </cover-view>
                    </cover-view>
                </map>
                <!-- #endif -->
            </view>
            <!-- 列表：上叠地图 208rpx -->
            <view class="list" :style="listMaskVarStyle" v-if="detailsInfo.summary">
                <!-- 运单概要 -->
                <view class="details-item summary-card">
                    <view class="summary-card__header">
                        <view class="summary-card__title">{{ detailsInfo.summary.goods || '-' }} {{ formatWeight(detailsInfo.summary.weight) }}</view>
                        <view class="summary-card__price">¥ {{ formatAmount(detailsInfo.summary.price) }}</view>
                    </view>
                    <view class="summary-card__body">
                        <view class="summary-card__time">
                            <view class="summary-card__time-main">{{ formatTime(detailsInfo.summary.fillTime, '待装货').time }}</view>
                            <view class="summary-card__time-sub">{{ formatTime(detailsInfo.summary.fillTime, '待装货').date }}</view>
                        </view>
                        <!-- @by oh-my-zerone 2026-10-27 渐变线夹胶囊，右侧共X天，对齐设计稿 -->
                        <view class="summary-card__duration" v-if="durationDaysText">
                            <view class="summary-card__duration-deco summary-card__duration-deco--left"></view>
                            <view class="summary-card__duration-badge">{{ durationDaysText }}</view>
                            <view class="summary-card__duration-deco summary-card__duration-deco--right"></view>
                            <!-- <view class="summary-card__duration-text">共{{ durationDaysText }}</view> -->
                        </view>
                        <view class="summary-card__time summary-card__time--end">
                            <view class="summary-card__time-main">{{ formatTime(detailsInfo.summary.signTime, '待卸货').time }}</view>
                            <view class="summary-card__time-sub">{{ formatTime(detailsInfo.summary.signTime, '待卸货').date }}</view>
                        </view>
                    </view>
                    <view class="summary-card__tags">
                        <!-- @by oh-my-zerone 2026-10-29 状态色挂在 tag 修饰类上；小程序 :class 不用模板字符串 -->
                        <view
                            class="summary-card__tag"
                            :class="detailsInfo.statusName ? 'summary-card__tag--' + detailsInfo.statusColorMode : ''"
                        >{{ detailsInfo.statusName || '-' }}</view>
                        <view class="summary-card__tag" v-if="detailsInfo.orderSource.platformName">{{ detailsInfo.orderSource.platformName }}</view>
                    </view>
                </view>
                <!-- 关联货源 -->
                <view class="details-item related-source">
                    <view class="related-source__header">
                        <view class="details-item-title">关联货源</view>
                        <view class="related-source__link" @click="goRelatedSource">
                            <text>{{ relatedSourceNo }}</text>
                            <!-- <text class="related-source__arrow">></text> -->
                        </view>
                    </view>
                    <view class="related-source__desc">{{ relatedSourceDesc }}</view>
                </view>
                <!-- 路程信息 -->
                <view class="details-item route-card">
                    <view class="route-item">
                        <view class="route-item__badge route-item__badge--start">起</view>
                        <view class="route-item__content">
                            <view class="route-item__title">{{ detailsInfo.myRoute.start.name || '-' }}</view>
                            <view class="route-item__address">{{ detailsInfo.myRoute.start.address || '-' }}</view>
                        </view>
                        <view class="route-item__location">
                            <image class="route-item__location-img" :src="$global.getImageUrl('pages_waybill/waybillDetails/icon_location_gray.png')" mode="aspectFit"> </image>
                        </view>
                    </view>
                    <view class="route-item">
                        <view class="route-item__badge route-item__badge--end">终</view>
                        <view class="route-item__content">
                            <view class="route-item__title">{{ detailsInfo.myRoute.end.name || '-' }}</view>
                            <view class="route-item__address">{{ detailsInfo.myRoute.end.address || '-' }}</view>
                        </view>
                        <view class="route-item__location">
                            <image class="route-item__location-img" :src="$global.getImageUrl('pages_waybill/waybillDetails/icon_location_gray.png')" mode="aspectFit"> </image>
                        </view>
                    </view>
                </view>
                <!-- 运输进度 -->
                <transport-progress :waybill-code="detailsInfo.code" ref="transportProgress" :waybill-status="detailsInfo.status" />
                <!-- 司机名片 -->
                <view class="details-item profile-card" v-if="detailsInfo.driver">
                    <view class="profile-card__info">
                       
                        <view class="details-item-title">{{ detailsInfo.driver.licenseNumber }}</view>
                        <view class="profile-card__row">
                            <text class="profile-card__row-label">车型</text>
                            <text class="profile-card__row-value">{{ detailsInfo.driver.vehicleTypeName || '-' }}</text>
                        </view>
                        <view class="profile-card__row">
                            <text class="profile-card__row-label">司机</text>
                            <text class="profile-card__row-value">{{ detailsInfo.driver.name }}</text>
                            <text class="profile-card__row-value">({{ detailsInfo.driver.phone }})</text>
                        </view>
                        <view class="profile-card__row">
                            <text class="profile-card__row-label">所属企业</text>
                            <text class="profile-card__row-value">{{ detailsInfo.driver.company || '-' }}</text>
                        </view>
                        <view class="profile-card__row">
                            <text class="profile-card__row-label">承接平台</text>
                            <text class="profile-card__row-value">{{  '-' }}</text>
                        </view>
                    </view>
                    <view class="profile-card__avatar">
                        <image
                            class="profile-card__avatar-img"
                            :src="detailsInfo.driver.avatar || $global.getImageUrl('pages/home/cover-service.png')"
                            mode="aspectFill"
                            @click="detailsInfo.driver.avatar && onPreview([detailsInfo.driver.avatar], 0)"
                        />
                        <view class="profile-card__avatar-tag">{{ detailsInfo.driver.vehicleTypeName || '-' }}</view>
                    </view>
                </view>
                <!-- 运输单详情 -->
                <view class="details-item">
                    <!-- <view class="details-item-title">运输单详情</view> -->
                    <view class="details-info-row">
                        <view class="details-info-label">运单号</view>
                        <view class="details-info-value details-info-copy">
                            <text class="details-info-copy-text">{{ detailsInfo.waybillInfo.waybillNo || '-' }}</text>
                            <image
                                class="details-info-copy-icon"
                                :src="$global.getImageUrl('pages_waybill/waybillDetails/icon_copy.png')"
                                mode="aspectFit"
                                @click="onCopy(detailsInfo.waybillInfo.waybillNo)"
                            ></image>
                        </view>
                    </view>
                    <view class="details-info-row">
                        <view class="details-info-label">接单时间</view>
                        <view class="details-info-value">{{ detailsInfo.waybillInfo.receiveTime || '-' }}</view>
                    </view>
                    <!-- @by oh-my-zerone 2026-10-29 凭证字段用 load/unloadAttachmentCodes；有图可预览，无则「未上传」 -->
                    <view class="details-info-row">
                        <view class="details-info-label">装货凭证</view>
                        <view
                            class="details-info-value details-info-images"
                            v-if="detailsInfo.waybillInfo.loadAttachmentCodes && detailsInfo.waybillInfo.loadAttachmentCodes.length"
                        >
                            <image
                                class="details-info-thumb"
                                v-for="(img, i) in detailsInfo.waybillInfo.loadAttachmentCodes"
                                :key="'load-' + i"
                                :src="img"
                                mode="aspectFill"
                                @click="onPreview(detailsInfo.waybillInfo.loadAttachmentCodes, i)"
                            />
                        </view>
                        <view class="details-info-value" v-else>未上传</view>
                    </view>
                    <view class="details-info-row">
                        <view class="details-info-label">卸货凭证</view>
                        <view
                            class="details-info-value details-info-images"
                            v-if="detailsInfo.waybillInfo.unloadAttachmentCodes && detailsInfo.waybillInfo.unloadAttachmentCodes.length"
                        >
                            <image
                                class="details-info-thumb"
                                v-for="(img, i) in detailsInfo.waybillInfo.unloadAttachmentCodes"
                                :key="'unload-' + i"
                                :src="img"
                                mode="aspectFill"
                                @click="onPreview(detailsInfo.waybillInfo.unloadAttachmentCodes, i)"
                            />
                        </view>
                        <view class="details-info-value" v-else>未上传</view>
                    </view>
                    <view class="details-info-row">
                        <view class="details-info-label">结算状态</view>
                        <view class="details-info-value">{{ detailsInfo.waybillInfo.status > 5 ? '已结算' : '未结算' || '-' }}</view>
                    </view>
                    
                </view>
            </view>
        </view>

        <!-- 底部操作栏：由 SubPageLayout footer 常驻；栏位显隐靠 footerPlaceholder，slot 只负责 UI -->
        <view v-if="hasBottomActions" slot="footer" class="bottom-actions">
            <view class="bottom-actions__inner">
                <Popups v-if="popupButtons.length > 0" :options="popupButtons" :optionProps="{ label: 'label' }" placement="top-start" @select="tapPopup">
                    <view class="bottom-actions__more">
                        <image class="bottom-actions__more-icon" :src="$global.getImageUrl('pages_waybill/waybillDetails/icon_more.png')" mode="aspectFit" />
                        <text class="bottom-actions__more-text">更多</text>
                    </view>
                </Popups>
                <view class="bottom-actions__btn-group" :class="{ 'is-single': visibleButtons.length === 1 }">
                    <z1-button
                        v-for="(item, idx) in visibleButtons"
                        :key="item.event"
                        :type="item.type || 'default'"
                        :customStyle="btnCustomStyle(idx)"
                        @click="eventCall(item.event)"
                    >
                        {{ item.label }}
                    </z1-button>
                </view>
            </view>
        </view>

    </SubPageLayout>

        <cancel-modal :visible.sync="showCancelModal" :way-bill-code="detailsInfo.code" @success="onCancelSuccess" />
    </view>
</template>

<script>
// components
import SubPageLayout from '@/components/SubPageLayout/index.vue';
import Popups from '@/components/Popups/Popups.vue';
import Z1Button from 'zjz1-h5-ui/packages/z1-button/z1-button.vue';
import CancelModal from '@/pages/waybill/components/CancelModal/index.vue';
import TransportProgress from './components/TransportProgress/index.vue';

// hooks
import { mapState } from 'vuex';
import { waybillDetailView } from './model';

// const
import { MOCK_PRICE_MODEL_MAP } from './mock';
import { stowageStatusList } from '@/pages/waybill/constants.js';
import { ApiGetWaybillDetail } from '../services';
// utils
import { fixNum } from '@/common/utils/format.js';

// platform
import { webDrivingRoute } from '@/common/platform/amap.js';


/** 起点标签色（与 QuoteMap 一致） */
const START_COLOR = '#3A65FF';
/** 终点标签色（与 QuoteMap 一致） */
const END_COLOR = '#26B899';
/** H5 setFitView 避让边距（px）：[上, 右, 下, 左] */
const FIT_VIEW_AVOID = [120, 48, 200, 48];
/** 小程序折线点数上限，超出则等距抽样 */
const ROUTE_MAX_POINTS = 600;
/** 标记点尺寸（px，与 QuoteMap 一致） */
const MARKER_SIZE = 24;
/**
 * 气泡文案最大字符数（与 QuoteMap 一致：约两行）
 * @by oh-my-zerone 2026-10-29
 */
const CALLOUT_MAX_CHARS = 28;

/**
 * 路线点集抽样，避免小程序 polyline 点数过多
 * @param {Array} points
 * @param {number} max
 * @returns {Array}
 * @by oh-my-zerone 2026-10-27
 */
function downsamplePoints(points, max) {
    const list = Array.isArray(points) ? points : [];
    if (list.length <= max || max < 2) return list;
    const step = Math.ceil(list.length / max);
    const result = [];
    for (let i = 0; i < list.length; i += step) {
        result.push(list[i]);
    }
    const last = list[list.length - 1];
    if (result[result.length - 1] !== last) result.push(last);
    return result;
}

/**
 * 气泡文案截断（与 QuoteMap 一致）
 * @param {string} text
 * @param {number} max
 * @returns {string}
 * @by oh-my-zerone 2026-10-29
 */
function truncateText(text, max = CALLOUT_MAX_CHARS) {
    const str = String(text || '');
    if (str.length <= max) return str;
    return `${str.slice(0, max)}…`;
}

export default {
    name: 'waybillDetails',
    components: { SubPageLayout, Popups, Z1Button, CancelModal, TransportProgress },
    data() {
        return {
            scrollTop: 0,
            // 地图视野（由 setFitView 计算 & 应用，小程序）
            latitude: null,
            longitude: null,
            scale: 14,
            detailsInfo: {},
            // 导航栏内容高度（不含状态栏），MP-WEIXIN 端 mounted 后按胶囊按钮实测覆写
            navBarHeight: 44,
            showCancelModal: false,
            // 高德驾车规划路线点集；失败时为空，地图退回起终点直线
            routePoints: [],
            // #ifdef H5
            amapKey: 'c4b8d90867505fbe8d50b4d95675ca53',
            amapInstance: null,
            markerInstances: [],
            // @by oh-my-zerone 2026-10-27 对齐 QuoteMap：白描边 + 蓝主线，需多实例
            polylineInstances: [],
            // #endif
        };
    },
    computed: {
        ...mapState({ statusBarHeight: state => state.header.statusBarHeight }),
        // 头部总高度（px）= 状态栏高度 + 导航栏内容高度
        headerHeight() {
            return (this.statusBarHeight || 0) + this.navBarHeight;
        },
        // 滚动阈值：列表向上覆盖地图后，地图剩余可见高度 - 头部高度
        // @by oh-my-zerone 2026-10-27 对齐货主端：750rpx 可视基准，208rpx 为列表上叠
        threshold() {
            const MAP_HEIGHT = 750;
            const LIST_OVERLAP = 208;
            return uni.upx2px(MAP_HEIGHT - LIST_OVERLAP) - this.headerHeight || 1;
        },
        // 标题栏背景：透明 -> 白色
        headerBg() {
            const progress = Math.min(this.scrollTop / this.threshold, 1);
            const alpha = Math.max(0, progress).toFixed(3);
            return `rgba(255, 255, 255, ${alpha})`;
        },
        // 列表顶部遮罩：顶部透明度随滑动 0 -> 1，底部固定 1（对齐货主端）
        maskTop() {
            const progress = Math.min(this.scrollTop / this.threshold, 1);
            return Math.max(0, progress).toFixed(3);
        },
        // @by oh-my-zerone 2026-10-27 货主端同款 CSS 变量；字符串写法避免小程序对象 style 丢自定义属性
        listMaskVarStyle() {
            return `--mask-top:${this.maskTop};`;
        },
        // 是否展示底部操作栏
        hasBottomActions() {
            return this.visibleButtons.length > 0 || this.popupButtons.length > 0;
        },
        // @by oh-my-zerone 2026-10-27
        // SubPageLayout 用非响应式 $slots 判断底栏；用声明式按钮把栏位撑开，实际按钮仍走 footer slot
        footerPlaceholder() {
            return this.hasBottomActions ? [{ key: '_slot', text: '' }] : [];
        },
        // 运单状态（转数字，避免接口字符串导致按钮 map 取不到）
        waybillStatus() {
            return Number(this.detailsInfo.status) || 0;
        },
        // 底部操作按钮（最多展示2个，primary 在右侧）
        // 状态：0待接单/1已接单/2已装货/3已签收(已卸货)/4已回单/5已结算/6已申请打款/7已打款/8已申请开票/9已开票
        visibleButtons() {
            const btn = (label, event, type = 'default') => ({ label, event, type });
            // @by oh-my-zerone 2026-10-21 status5/6 露出申请打款、打款，与列表 CardInfo 对齐
            const map = {
                2: [btn('补凭证', 'SUPPLEMENTARY'), btn('联系司机', 'CONTACT', 'primary')],
                3: [btn('补凭证', 'SUPPLEMENTARY'), btn('联系司机', 'CONTACT', 'primary')],
                4: [btn('联系司机', 'CONTACT'), btn('核算', 'ACCOUNT', 'primary')],
                5: [btn('联系司机', 'CONTACT'), btn('申请打款', 'APPLY_PAY', 'primary')],
                6: [btn('联系司机', 'CONTACT'), btn('去付款', 'PAY', 'primary')],
                7: [btn('联系司机', 'CONTACT'), btn('评价', 'EVALUATE', 'primary')],
                8: [btn('联系司机', 'CONTACT')],
                9: [btn('联系司机', 'CONTACT')],
            };
            return map[this.waybillStatus] || [];
        },
        // "更多"弹窗按钮：作废放入"更多"
        popupButtons() {
            const map = {
                2: [{ label: '作废', event: 'CANCEL' }],
                3: [{ label: '作废', event: 'CANCEL' }],
                4: [{ label: '作废', event: 'CANCEL' }],
            };
            return map[this.waybillStatus] || [];
        },
        /**
         * 装卸货间隔天数：signTime - fillTime，两端齐全且 signTime >= fillTime 才返回，否则空串
         * @by oh-my-zerone 2026-10-27 概要中间展示「2天 / 共2天」
         */
        durationDaysText() {
            const { fillTime, signTime } = this.detailsInfo.summary || {};
            if (!fillTime || !signTime) return '';
            const start = new Date(String(fillTime).replace(/-/g, '/')).getTime();
            const end = new Date(String(signTime).replace(/-/g, '/')).getTime();
            if (!start || !end || end < start) return '';
            const days = Math.max(1, Math.ceil((end - start) / 86400000));
            return `${days}天`;
        },
        // 起点坐标（仅当存在有效经纬度时返回）
        startPoint() {
            const loc = this.detailsInfo.myRoute && this.detailsInfo.myRoute.start && this.detailsInfo.myRoute.start.location;
            if (!loc || !loc.longitude || !loc.latitude) return null;
            return { longitude: Number(loc.longitude), latitude: Number(loc.latitude) };
        },
        // 终点坐标（仅当存在有效经纬度时返回）
        endPoint() {
            const loc = this.detailsInfo.myRoute && this.detailsInfo.myRoute.end && this.detailsInfo.myRoute.end.location;
            if (!loc || !loc.longitude || !loc.latitude) return null;
            return { longitude: Number(loc.longitude), latitude: Number(loc.latitude) };
        },
        // 地图锚点图标（与 QuoteMap 一致：起终点统一圆点）
        mapDotIconPath() {
            return this.$global.getImageUrl('pages_quoteCreate/icon-end.png');
        },
        // 起点气泡文案：优先名称，其次地址（截断对齐 QuoteMap）
        startMarkerText() {
            const start = this.detailsInfo.myRoute && this.detailsInfo.myRoute.start;
            return truncateText((start && (start.name || start.address)) || '起点');
        },
        // 终点气泡文案：优先名称，其次地址（截断对齐 QuoteMap）
        endMarkerText() {
            const end = this.detailsInfo.myRoute && this.detailsInfo.myRoute.end;
            return truncateText((end && (end.name || end.address)) || '终点');
        },
        // 地图 markers：起点/终点（小程序 + customCallout）
        mapMarkers() {
            const markers = [];
            const customCallout = {
                anchorX: 0.5,
                anchorY: 8,
                display: 'ALWAYS',
            };
            if (this.startPoint) {
                markers.push({
                    id: 1,
                    longitude: this.startPoint.longitude,
                    latitude: this.startPoint.latitude,
                    iconPath: this.mapDotIconPath,
                    width: MARKER_SIZE,
                    height: MARKER_SIZE,
                    anchor: { x: 0.5, y: 0.5 },
                    customCallout,
                });
            }
            if (this.endPoint) {
                markers.push({
                    id: 2,
                    longitude: this.endPoint.longitude,
                    latitude: this.endPoint.latitude,
                    iconPath: this.mapDotIconPath,
                    width: MARKER_SIZE,
                    height: MARKER_SIZE,
                    anchor: { x: 0.5, y: 0.5 },
                    customCallout,
                });
            }
            return markers;
        },
        /**
         * 路线折线点集：仅在高德公路规划返回后绘制，规划前不画起终点直线
         * @by oh-my-zerone 2026-10-27
         */
        routeLinePoints() {
            if (!this.startPoint || !this.endPoint) return [];
            const real = downsamplePoints(this.routePoints, ROUTE_MAX_POINTS);
            if (real.length > 1) return [this.startPoint, ...real, this.endPoint];
            return [];
        },
        /**
         * 地图折线：白色描边 + 蓝色主线 + 方向箭头（对齐货源详情 QuoteMap）
         * @by oh-my-zerone 2026-10-27
         */
        mapPolyline() {
            const points = this.routeLinePoints;
            if (!points.length) return [];
            return [
                {
                    points,
                    color: '#FFFFFF',
                    width: 7,
                    dottedLine: false,
                },
                {
                    points,
                    color: '#3A65FF',
                    width: 5,
                    dottedLine: false,
                    arrowLine: true,
                },
            ];
        },
        // 价格模型描述（mock 字典）
        priceModelDesc() {
            if (!this.detailsInfo.priceModel) return '';
            return MOCK_PRICE_MODEL_MAP[this.detailsInfo.priceModel] || '';
        },
        relatedSourceNo() {
            const source = this.detailsInfo.orderSource || {};
            return source.orderId ||  '-';
        },
        relatedSourceDesc() {
            const goods = this.detailsInfo.summary?.goods || '-';
            const weight = this.formatRelatedWeight(this.detailsInfo.summary?.weight);
            const start = this.formatCityDistrict(this.detailsInfo.myRoute?.start);
            const end = this.formatCityDistrict(this.detailsInfo.myRoute?.end);
            return `${goods} · 本单 ${weight} · ${start} -> ${end}`;
        },
    },
    onLoad(options) {
        this.detailsInfo = { code: options.code || '' };
        this.getDetailsInfo();
    },
    mounted() {
        // #ifdef MP-WEIXIN
        // 按胶囊按钮实测导航栏内容高度，算法与 Z1Header.headerHight 一致
        const menu = uni.getMenuButtonBoundingClientRect();
        if (menu && menu.height) {
            const rpx = (menu.top - this.statusBarHeight) * 2 + menu.height * 2 + 20;
            this.navBarHeight = uni.upx2px(rpx);
        }
        // #endif
        // #ifdef H5
        this.initAMap();
        // #endif
    },
    beforeDestroy() {
        // #ifdef H5
        this.clearAMapOverlays();
        if (this.amapInstance) {
            this.amapInstance.destroy();
            this.amapInstance = null;
        }
        // #endif
    },
    methods: {
        // 刷新数据
        refresh() {
            this.getDetailsInfo();
        },
        async getDetailsInfo() {
            // TODO: 对接真实详情接口后替换 mock
            const {data} = await ApiGetWaybillDetail(this.detailsInfo.code);
            console.log('data', data);
            this.detailsInfo = waybillDetailView(data);
            console.log('this.detailsInfo', this.detailsInfo);
            this.$nextTick(() => {
                this.loadDrivingRoute();
            });
        },
        /**
         * 调用高德驾车路径规划，有结果后再画轨迹（规划前不画线）
         * @by oh-my-zerone 2026-10-27
         */
        async loadDrivingRoute() {
            const origin = this.startPoint;
            const destination = this.endPoint;
            this.routePoints = [];
            this.refreshMapView();
            if (!origin || !destination) return;
            const seq = (this._drivingSeq = (this._drivingSeq || 0) + 1);
            const [err, path] = await webDrivingRoute(origin, destination, { withPolyline: true });
            if (seq !== this._drivingSeq) return;
            if (err || !path || !Array.isArray(path.points) || path.points.length < 2) {
                return;
            }
            this.routePoints = path.points;
            this.refreshMapView();
        },
        refreshMapView() {
            this.$nextTick(() => {
                // #ifdef H5
                this.renderAMap();
                // #endif
                // #ifdef MP-WEIXIN
                this.setFitView();
                // #endif
            });
        },
        // 汇总当前地图上所有覆盖物的点位（marker / 规划路线），参考高德 setFitView 对全部覆盖物自适应
        collectOverlayPoints() {
            const line = this.routeLinePoints;
            if (line.length) return line;
            const list = [];
            if (this.startPoint) list.push(this.startPoint);
            if (this.endPoint) list.push(this.endPoint);
            return list;
        },
        /**
         * H5：动态加载高德地图 SDK
         */
        initAMap() {
            // #ifdef H5
            if (window && window.AMap) {
                this.renderAMap();
                return;
            }
            if (document.querySelector('script[src*="webapi.amap.com/maps"]')) {
                const check = setInterval(() => {
                    if (window.AMap) {
                        clearInterval(check);
                        this.renderAMap();
                    }
                }, 100);
                setTimeout(() => clearInterval(check), 8000);
                return;
            }
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${this.amapKey}`;
            script.onload = () => this.renderAMap();
            script.onerror = () => {
                uni.showToast({ title: '地图加载失败，请检查网络', icon: 'none' });
            };
            document.head.appendChild(script);
            // #endif
        },
        /** H5：清理标记与折线 */
        clearAMapOverlays() {
            // #ifdef H5
            if (this.markerInstances && this.markerInstances.length) {
                this.markerInstances.forEach(m => m.setMap(null));
                this.markerInstances = [];
            }
            if (this.polylineInstances && this.polylineInstances.length && this.amapInstance) {
                this.polylineInstances.forEach(line => this.amapInstance.remove(line));
                this.polylineInstances = [];
            }
            // #endif
        },
        /**
         * H5：渲染高德标记与公路规划折线
         */
        renderAMap() {
            // #ifdef H5
            if (!window.AMap) return;
            this.$nextTick(() => {
                const center =
                    this.startPoint ||
                    this.endPoint ||
                    this.detailsInfo.center ||
                    { longitude: 116.481488, latitude: 39.990464 };
                if (!this.amapInstance) {
                    const el = document.getElementById('waybill-detail-amap');
                    if (!el) return;
                    // @by oh-my-zerone 2026-10-29 方案 A：打开拖拽/缩放（对齐货主端可拖）
                    this.amapInstance = new window.AMap.Map('waybill-detail-amap', {
                        zoom: this.scale || 14,
                        center: [Number(center.longitude), Number(center.latitude)],
                        resizeEnable: true,
                        dragEnable: true,
                        zoomEnable: true,
                    });
                } else if (typeof this.amapInstance.setStatus === 'function') {
                    this.amapInstance.setStatus({ dragEnable: true, zoomEnable: true });
                }

                this.clearAMapOverlays();

                if (this.startPoint) {
                    this.addAMapMarker(this.startPoint, '起点', this.startMarkerText, 'start');
                }
                if (this.endPoint) {
                    this.addAMapMarker(this.endPoint, '终点', this.endMarkerText, 'end');
                }

                // @by oh-my-zerone 2026-10-27 对齐 QuoteMap：白描边 + 蓝主线(带方向箭头)
                const routePath = this.routeLinePoints.map(point => [point.longitude, point.latitude]);
                if (routePath.length > 1) {
                    const outline = new window.AMap.Polyline({
                        path: routePath,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 7,
                        map: this.amapInstance,
                        zIndex: 49,
                    });
                    const mainLine = new window.AMap.Polyline({
                        path: routePath,
                        strokeColor: '#3A65FF',
                        strokeWeight: 5,
                        showDir: true,
                        map: this.amapInstance,
                        zIndex: 50,
                    });
                    this.polylineInstances = [outline, mainLine];
                }

                if (this.markerInstances.length > 0) {
                    const fitTargets = [...this.markerInstances, ...this.polylineInstances];
                    this.amapInstance.setFitView(fitTargets, false, FIT_VIEW_AVOID);
                    setTimeout(() => {
                        if (this.amapInstance && this.markerInstances.length) {
                            this.amapInstance.setFitView(fitTargets, false, FIT_VIEW_AVOID);
                        }
                    }, 200);
                }
            });
            // #endif
        },
        /**
         * H5：添加自定义标记（样式对齐 MapView.buildBubbleContent：角标+地址卡+箭头+引导线+圆点）
         * @param {Object} point
         * @param {string} label
         * @param {string} address
         * @param {'start'|'end'} type
         * @by oh-my-zerone 2026-10-29
         */
        addAMapMarker(point, label, address, type) {
            // #ifdef H5
            const tagColor = type === 'start' ? START_COLOR : END_COLOR;
            const iconUrl = this.mapDotIconPath;
            const width = MARKER_SIZE;
            const height = MARKER_SIZE;
            const anchorX = 0.5;
            const anchorY = 0.5;

            const markerContent = document.createElement('div');
            markerContent.style.width = '0px';
            markerContent.style.height = '0px';
            markerContent.style.position = 'relative';

            markerContent.innerHTML = `
                <div style="position:absolute;left:${(0.5 - anchorX) * width}px;bottom:${anchorY * height}px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;width:max-content;">
                    <div style="display:flex;flex-direction:column;align-items:flex-start;">
                        <div style="background:${tagColor};color:#FFFFFF;font-size:11px;line-height:15px;padding:2px 8px;border-radius:6px 6px 0 0;box-sizing:border-box;white-space:nowrap;">${label}</div>
                        <div style="display:flex;align-items:center;gap:6px;background:#FFFFFF;padding:10px;border-radius:0 10px 10px 10px;box-shadow:0 2px 10px rgba(0,0,0,.1);border:1px solid #e3e6ee;max-width:200px;box-sizing:border-box;">
                            <div style="flex:1;min-width:0;color:#1F2430;font-size:12px;line-height:16px;white-space:normal;word-break:break-all;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;">${address}</div>
                            <div style="flex-shrink:0;color:#B0B5C0;font-size:16px;line-height:1;">›</div>
                        </div>
                    </div>
                    <div style="width:1px;height:10px;background:#333;flex-shrink:0;"></div>
                </div>
                <img src="${iconUrl}" style="position:absolute;left:${-anchorX * width}px;top:${-anchorY * height}px;width:${width}px;height:${height}px;display:block;" />
            `;

            const marker = new window.AMap.Marker({
                position: [point.longitude, point.latitude],
                content: markerContent,
                offset: new window.AMap.Pixel(0, 0),
                map: this.amapInstance,
                zIndex: 200,
            });
            this.markerInstances.push(marker);
            // #endif
        },
        // 两点间距离（米）：haversine
        getDistance(p1, p2) {
            const R = 6371000;
            const toRad = d => (d * Math.PI) / 180;
            const dLat = toRad(p2.latitude - p1.latitude);
            const dLng = toRad(p2.longitude - p1.longitude);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(a));
        },
        // 计算扣除 padding 后的有效可视屏幕像素（取水平和垂直中较大的有效尺寸确保覆盖物不被裁切）
        getEffectivePx(padding = [0, 0, 0, 0]) {
            const padH = (padding[1] || 0) + (padding[3] || 0);
            const padV = (padding[0] || 0) + (padding[2] || 0);
            let screenPx = 375;
            try {
                const info = uni.getSystemInfoSync();
                if (info && info.windowWidth) screenPx = info.windowWidth;
            } catch (e) {}
            return Math.max(screenPx - padH, screenPx - padV, 1);
        },
        // 根据跨度（米）和纬度估算 scale，padding 为 [top, right, bottom, left] 边距(px)，留出约 20% 边距
        // 微信地图 scale S 时视野宽度 ≈ 地球周长·cos(lat) / 2^S · 屏宽px/256
        distanceToScale(meters, lat, padding = [0, 0, 0, 0]) {
            const span = meters / 0.8;
            const EARTH = 40075000;
            const cosLat = Math.cos((lat * Math.PI) / 180) || 1;
            const effectivePx = this.getEffectivePx(padding);
            const numerator = EARTH * cosLat * effectivePx;
            let scale = Math.log2(numerator / (256 * span));
            scale = Math.round(scale);
            if (scale < 3) scale = 3;
            if (scale > 20) scale = 20;
            return scale;
        },
        // 应用地图视野：先置空强制刷新，再设值，期间锁定 regionchange
        applyView(longitude, latitude, scale) {
            this._lockRegionChange = true;
            this.longitude = null;
            this.latitude = null;
            this.scale = null;
            this.$nextTick(() => {
                this.longitude = longitude;
                this.latitude = latitude;
                this.scale = scale;
                // 延迟解锁，确保 regionchange end 事件先被拦截
                setTimeout(() => {
                    this._lockRegionChange = false;
                }, 300);
            });
        },
        // 自适应视野：coverPoints 覆盖物点位 → 包围盒中心 + scale → 应用；padding 为 [top, right, bottom, left] 边距(px)
        setFitView(coverPoints, padding = [120, 120, 180, 120]) {
            const points = coverPoints && coverPoints.length ? coverPoints : this.collectOverlayPoints();
            // 无覆盖物时回退到模型中心
            if (!points.length) {
                const c = this.detailsInfo.center || {};
                if (c.longitude || c.latitude) {
                    this.applyView(c.longitude, c.latitude, this.scale || 14);
                }
                return;
            }
            // 单点：居中 + 固定较近视野
            if (points.length === 1) {
                this.applyView(points[0].longitude, points[0].latitude, 16);
                return;
            }
            // 多点：包围盒中心
            const lats = points.map(p => p.latitude);
            const lngs = points.map(p => p.longitude);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            const center = {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
            };
            const latSpan = this.getDistance({ latitude: minLat, longitude: center.longitude }, { latitude: maxLat, longitude: center.longitude });
            const lngSpan = this.getDistance({ latitude: center.latitude, longitude: minLng }, { latitude: center.latitude, longitude: maxLng });
            const span = Math.max(latSpan, lngSpan);
            // padding 偏移：有效可视区域中心相对屏幕中心的像素偏移 → 地理偏移
            // 水平：可视中心偏移 = (padLeft - padRight)/2 px，补偿方向取负 → dx = (padRight - padLeft)/2 px 向东
            // 垂直：可视中心偏移 = (padTop - padBottom)/2 px（y轴向下），补偿方向为北 → dy = (padTop - padBottom)/2 px 向北
            const meterPerPx = span / this.getEffectivePx(padding);
            const dxM = (((padding[1] || 0) - (padding[3] || 0)) / 2) * meterPerPx;
            const dyM = (((padding[0] || 0) - (padding[2] || 0)) / 2) * meterPerPx;
            const adjustedLat = center.latitude + dyM / 111320;
            const adjustedLng = center.longitude + dxM / (111320 * Math.cos((center.latitude * Math.PI) / 180) || 1);
            this.applyView(adjustedLng, adjustedLat, this.distanceToScale(span, center.latitude, padding));
        },
        // 地图视野变化：锁定期间拦截，避免 applyView 触发的反馈循环
        onRegionChange() {
            if (this._lockRegionChange) return;
            // 预留：用户手势改变视野后的处理
        },
        onScroll(scrollTop) {
            this.scrollTop = scrollTop || 0;
        },
        scrolltolower() {},
        // "更多"弹窗选项点击
        tapPopup({ event }) {
            this.eventCall(event);
        },
        // 底部按钮事件分发（补凭证/核算/申请打款/打款已接子页）
        eventCall(event) {
            const that = this;
            const code = this.detailsInfo.code;
            const onBack = () => {
                that.refresh();
                uni.$emit('pages/waybill/index:refresh');
            };
            const todo = title => {
                uni.showToast({ title: `${title}功能开发中`, icon: 'none' });
            };
            const map = {
                SUPPLEMENTARY: () => {
                    if (!code) {
                        uni.showToast({ title: '运单编号缺失', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: '/pages_runGoods/load/index',
                        events: { acceptDataFromOpenerPageBack: onBack },
                        success: res => {
                            res.eventChannel.emit('acceptDataFromOpenerPage', {
                                wayInfo: { wayBillCode: code },
                                type: Number(this.detailsInfo.status) === 2 ? 'load' : 'supplementaryUnloading',
                                stowageStatusList: stowageStatusList.map(item => ({
                                    dictValue: item.value,
                                    dictLabel: item.label,
                                })),
                            });
                        },
                    });
                },
                CONTACT: () => {
                    this.handleContact();
                },
                ACCOUNT: () => {
                    if (!code) {
                        uni.showToast({ title: '运单编号缺失', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: `/pages_waybill/expenseAccounting/index?waybillCode=${code}`,
                        events: { acceptDataFromOpenerPageBack: onBack },
                    });
                },
                APPLY_PAY: () => {
                    if (!code) {
                        uni.showToast({ title: '运单编号缺失', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: `/pages_waybill/applyPayment/index?waybillCode=${code}`,
                        events: { acceptDataFromOpenerPageBack: onBack },
                    });
                },
                PAY: () => {
                    if (!code) {
                        uni.showToast({ title: '运单编号缺失', icon: 'none' });
                        return;
                    }
                    uni.navigateTo({
                        url: `/pages_waybill/payment/index?waybillCode=${code}`,
                        events: { acceptDataFromOpenerPageBack: onBack },
                    });
                },
                EVALUATE: () => todo('评价'),
                CANCEL: () => {
                    this.showCancelModal = true;
                },
            };
            map[event]?.();
        },
        // 作废成功后刷新：先等详情落地，再拉运输进度（避免 status 未变时 watch 不触发）
        // @by oh-my-zerone 2026-10-29
        async onCancelSuccess() {
            uni.$emit('pages/waybill/index:refresh');
            await this.getDetailsInfo();
            this.$nextTick(() => {
                const progress = this.$refs.transportProgress;
                if (progress && typeof progress.loadTrace === 'function') {
                    progress.loadTrace();
                }
            });
        },
        // 底部按钮样式：2个按钮时左窄右宽，1个按钮时全宽
        btnCustomStyle(idx) {
            const len = this.visibleButtons.length;
            if (len === 2) {
                return { width: 'auto', flex: idx === 0 ? '1 1 0' : '2 1 0' };
            }
            return { width: '100%' };
        },
        // 联系司机：拨打电话
        handleContact() {
            const phone = this.detailsInfo.driver && this.detailsInfo.driver.phone;
            if (!phone) {
                uni.showToast({ title: '暂无司机电话', icon: 'none' });
                return;
            }
            uni.makePhoneCall({ phoneNumber: phone });
        },
        onCopy(text) {
            uni.setClipboardData({
                data: text,
                success: () => {
                    uni.showToast({ title: '已复制', icon: 'success' });
                },
            });
        },
        onPreview(urls, index) {
            uni.previewImage({
                urls,
                current: urls[index],
            });
        },
        // "YYYY-MM-DD HH:mm:ss" -> { time: 'HH:mm', date: 'MM月DD日 周X' }
        // 为空或格式不匹配时按 fallback 占位返回
        formatTime(raw, emptyDateText) {
            if (!raw) return { time: '--', date: emptyDateText };
            const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
            if (!m) return { time: '--', date: emptyDateText };
            const weekList = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            // 用本地时区构造，避免 UTC 偏移导致星期错位
            const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
            const week = weekList[date.getDay()];
            return { time: `${m[4]}:${m[5]}`, date: `${Number(m[2])}月${Number(m[3])}日 ${week}` };
        },
        formatCityDistrict(point) {
            if (!point) return '-';
            const city = point.city || '';
            const district = point.district || '';
            if (city && district) return `${city}·${district}`;
            return city || district || point.name || '-';
        },
        // 关联货源重量：按设计展示「32 吨」，重量单位不再折算成 kg
        formatRelatedWeight(num) {
            const val = Number(num || 0);
            const status = this.detailsInfo.summary && this.detailsInfo.summary.stowageStatus;
            if (status === 0 || status === '0' || status == null) {
                const text = Number.isInteger(val) ? String(val) : fixNum(val, 1);
                return `${text} 吨`;
            }
            return this.formatWeight(val);
        },
        goRelatedSource() {
            // uni.showToast({ title: '货源详情功能开发中', icon: 'none' });
            uni.navigateTo({
                url: `/pages_goodsSource/sourceDetail/index?code=${this.detailsInfo.orderSource.orderCode}`,
            });
        },
        // 重量展示：根据 stowageStatus 展示单位，保留 1 位小数，避免浮点数精度问题
        // 0->吨 1->方 2->数量 3->箱 4->包，载重始终为 kg
        formatWeight(num) {
            const val = Number(num || 0);
            const units = { 0: '吨', 1: '方', 2: '个', 3: '箱', 4: '包' };
            const unit = this.detailsInfo.summary.stowageStatus != null ? units[this.detailsInfo.summary.stowageStatus] || '吨' : '吨';
            // 吨 → kg：*1000
            // const display = this.detailsInfo.summary.stowageStatus === 0 || this.detailsInfo.summary.stowageStatus === '0' ? val * 1000 : val;
            const display = val;
            return `${fixNum(display, 3)} ${unit}`;
        },
        // 金额展示：保留 2 位小数
        formatAmount(num) {
            return Number(num || 0).toFixed(2);
        },
        // 距离/落差展示：m，无值时不拼单位
        formatMeter(num) {
            if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}km`;
            }
            return `${num}m`;
        },
        // 认证状态展示：0未认证 1认证中 2未通过 3已认证；只有已认证才展示状态标签
        // null/undefined 视为未认证；返回 { text, color, approved }
        recordStatus(status) {
            const map = {
                0: { text: '未认证', color: '#999999', approved: false },
                1: { text: '认证中', color: '#FF8C1A', approved: false },
                2: { text: '未通过', color: '#F54646', approved: false },
                3: { text: '已认证', color: '#00B578', approved: true },
            };
            if (status === undefined || status === null || status === '') return map[0];
            return map[Number(status)] || map[0];
        },
    },
};
</script>

<style lang="scss" scoped>
::v-deep .z1-button {
    border-radius: 16rpx;
}

.page-waybill-details-root {
    // #ifdef MP-WEIXIN
    height: 100vh;
    // #endif
    // #ifdef H5
    height: 100%;
    // #endif
}

.page-waybill-details {
    ::v-deep .sub-page-layout__footer {
        position: relative;
        z-index: 10;
        padding-top: 28rpx;
        padding-left: 32rpx;
        padding-right: 32rpx;
    }
}

/* @by oh-my-zerone 2026-10-27 对齐货主端 header-bg1（随内容流，盖在地图上、标题栏下） */
.header-bg1 {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 209rpx;
    background: linear-gradient(360deg, rgba(235, 237, 236, 0) 0%, #dce5fa 100%);
    width: 100vw;
    z-index: 9;
    pointer-events: none;
}

.content-wrapper {
    position: relative;
    padding: 0;
}

/* @by oh-my-zerone 2026-10-29 方案 A：地图在滚动流内，与货主端一致 */
.map-wrap {
    width: 100%;
    height: 716rpx;
    position: relative;
    z-index: 0;

    .map {
        width: 100%;
        height: 100%;
    }
}

.list {
    /* @by oh-my-zerone 2026-10-27 对齐货主端 list：上叠 208rpx + ::before 淡蓝，白卡压住 */
    margin-top: -208rpx;
    padding: 0 32rpx;
    padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
    position: relative;
    z-index: 2;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 208rpx;
        background: linear-gradient(180deg, rgba(220, 229, 250, var(--mask-top, 0)) 0%, rgba(220, 229, 250, 1) 100%);
        pointer-events: none;
        z-index: -1;
    }
}

.list-item {
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

    &__title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 12rpx;
    }

    &__desc {
        font-size: 26rpx;
        color: #999;
    }
}

.details-item {
    padding: 28rpx 32rpx;
    background: #fff;
    border-radius: 20rpx;
    margin: 20rpx 0;
}

.details-item-title {
    height: 52rpx;
    font-family: PingFang SC, PingFang SC;
    font-weight: 700;
    font-size: 32rpx;
    color: #333333;
}

.related-source {
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__link {
        display: flex;
        align-items: center;
        color: #3a65ff;
        font-size: 28rpx;
        font-weight: bold;
        line-height: 52rpx;
    }

    &__arrow {
        margin-left: 8rpx;
    }

    &__desc {
        margin-top: 8rpx;
        font-size: 26rpx;
        color: #666666;
        line-height: 40rpx;
    }
}

.details-info-row {
    display: flex;
    align-items: center;
    height: 64rpx;
}

.details-info-label {
    font-size: 28rpx;
    color: #999;
    text-align: left;
}

.details-info-value {
    color: #333;
    text-align: right;
    margin-left: auto;
    font-size: 28rpx;
    font-weight: bold;
}

.details-info-images {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.details-info-thumb {
    width: 48rpx;
    height: 48rpx;
    border-radius: 8rpx;
    background: #f5f5f5;
    margin-left: 12rpx;
}

.details-info-copy {
    display: flex;
    align-items: center;
}

.details-info-copy-icon {
    width: 28rpx;
    height: 28rpx;
    margin-left: 4rpx;
}

.details-divider {
    height: 1rpx;
    background: #e2e2e2;
    margin: 12rpx 0;
}

.details-info-amount {
    color: #3a65ff;
    font-weight: bold;
}

/* 名片卡 */
.profile-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    &__info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-right: 24rpx;
    }

    &__name {
        display: flex;
        align-items: baseline;
        margin-bottom: 9rpx;
    }

    &__name-text {
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 28rpx;
        color: #333333;
    }

    &__name-phone {
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 28rpx;
        color: #333333;
        margin-left: 12rpx;
    }

    &__row {
        display: flex;
        align-items: center;
        height: 39rpx;
    }

    &__row-label {
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 24rpx;
        color: #999999;
        flex-shrink: 0;
    }

    &__row-value {
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 24rpx;
        color: #333333;
        margin-left: 18rpx;
    }

    &__row-status {
        display: flex;
        align-items: center;
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 24rpx;
        color: #09b288;
        margin-left: 12rpx;
    }

    &__row-status-icon {
        width: 24rpx;
        height: 24rpx;
    }

    &__row-status-text {
        font-size: 24rpx;
        margin-left: 6rpx;
    }

    &__avatar {
        position: relative;
        width: 120rpx;
        height: 160rpx;
        border-radius: 12rpx;
        overflow: hidden;
        flex-shrink: 0;
    }

    &__avatar-img {
        width: 100%;
        height: 100%;
    }

    &__avatar-tag {
        height: 40rpx;
        line-height: 40rpx;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 20rpx;
        text-align: center;
    }
}

/* 运单概要卡 */
.summary-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx 32rpx 24rpx 32rpx;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 1;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8rpx;
    }

    &__title {
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 32rpx;
        color: #333333;
    }

    &__price {
        font-family: Douyin Sans, Douyin Sans;
        font-weight: bold;
        font-size: 32rpx;
        color: #3a65ff;
    }

    &__body {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 12rpx 0 20rpx;
    }

    &__time {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;


        &--end {
            align-items: flex-end;
        }
    }

    &__time-main {
        font-family: Douyin Sans, Douyin Sans;
        font-weight: 700;
        font-size: 52rpx;
        color: #333333;
        line-height: 1.2;
    }

    &__time-sub {
        font-size: 24rpx;
        color:  rgba(102, 102, 102, 1);
        font-weight: 400;
        margin-top: 8rpx;
    }

    &__duration {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        /* @by oh-my-zerone 2026-10-27 与两侧 time-main 同行居中：52rpx * 1.2 */
        height: 62.4rpx;
        margin-top: 0;
    }

    &__duration-deco {
        width: 88rpx;
        height: 4rpx;
        opacity: 0.5;
        flex-shrink: 0;

        &--left {
            transform: rotate(180deg);
            background: linear-gradient(90deg, rgba(166, 166, 166, 1) 0%, rgba(166, 166, 166, 0) 100%);
        }

        &--right {
            background: linear-gradient(90deg, rgba(166, 166, 166, 1) 0%, rgba(166, 166, 166, 0) 100%);
        }
    }

    &__duration-badge {
        height: 44rpx;
        line-height: 42rpx;
        min-width: 88rpx;
        padding: 0 16rpx;
        margin: 0 4rpx;
        border-radius: 22rpx;
        font-size: 24rpx;
        color: #666666;
        text-align: center;
        border: 1rpx solid #aaaaaa;
        white-space: nowrap;
        box-sizing: border-box;
    }

    &__duration-text {
        font-size: 24rpx;
        color: #999999;
        margin-left: 12rpx;
        white-space: nowrap;
    }

    &__tags {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    &__tag {
        font-size: 24rpx;
        color: #333;
        background: #f4f5f7;
        border-radius: 8rpx;
        padding: 8rpx 16rpx;
        margin-right: 16rpx;
        margin-top: 8rpx;
        line-height: 36rpx;

        &--primary {
            color: #d57813;
            background: #fcf6eb;
            font-weight: bold;
        }

        /* @by oh-my-zerone 2026-10-29 状态色修饰挂在 tag 上，避免被基础色覆盖 */
        &--done {
            color: #26b899;
            background: rgba(38, 184, 153, 0.12);
        }

        &--doing {
            color: #3a65ff;
            background: rgba(58, 101, 255, 0.12);
        }

        &--pending {
            color: #999999;
            background: #f3f3f3;
        }
    }
}

/* 航线信息卡 */
.route-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 1;
}

.route-item {
    display: flex;
    align-items: flex-start;
    position: relative;

    & + & {
        margin-top: 12rpx;
    }

    /* 虚线：从起徽章中心连到终徽章中心，徽章不透明背景遮住穿过部分，做到无缝衔接 */
    &:first-child::after {
        content: '';
        position: absolute;
        left: 17rpx;
        top: 18rpx;
        height: calc(100% + 12rpx);
        width: 0;
        border-left: 2rpx dashed #d8d8d8;
        z-index: 0;
    }

    &__badge {
        width: 36rpx;
        height: 36rpx;
        border-radius: 10rpx;
        color: #fff;
        font-size: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        font-weight: bold;
        &--start {
            background: #e1e4ec;
            color: #3a4564;
        }

        &--end {
            background: #3a65ff;
            color: #fff;
        }
    }

    &__content {
        flex: 1;
        min-width: 0;
        margin-left: 20rpx;
    }

    &__title {
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 28rpx;
        color: #333333;
        line-height: 36rpx;
    }

    &__address {
        font-size: 24rpx;
        color: #999;
        margin-top: 6rpx;
        line-height: 28rpx;
    }

    &__location {
        width: 48rpx;
        height: 48rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-left: 16rpx;
        position: relative;
        z-index: 1;
        align-self: center;
    }

    &__location-img {
        width: 100%;
        height: 100%;
    }
}

/* 底部操作栏：由 SubPageLayout footer 承载，安全区由容器处理 */
.bottom-actions {
    width: 100%;
    display: flex;
    align-items: center;

    &__inner {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 24rpx;
    }

    &__more {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    &__more-icon {
        width: 60rpx;
        height: 40rpx;
    }

    &__more-text {
        font-size: 20rpx;
        color: #999;
        margin-top: 2rpx;
    }

    &__btn-group {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 20rpx;
    }
}

/* #ifdef MP-WEIXIN */
/* @by oh-my-zerone 2026-10-29 起终点气泡样式对齐 MapView.map-callout */
.mp-callout {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.mp-callout__stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.mp-callout__tag {
    color: #ffffff;
    font-size: 20rpx;
    line-height: 32rpx;
    padding: 0 12rpx;
    border-radius: 10rpx 10rpx 0 0;

    &--start {
        background-color: #3a65ff;
    }

    &--end {
        background-color: #26b899;
    }
}

.mp-callout__bubble {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #ffffff;
    border: 1rpx solid #e3e6ee;
    border-radius: 12rpx;
    padding: 12rpx 16rpx;
    max-width: 320rpx;
    box-sizing: border-box;

    &--tagged {
        border-radius: 0 16rpx 16rpx 16rpx;
    }
}

.mp-callout__text {
    flex: 1;
    min-width: 0;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #1f2430;
    text-align: left;
    word-break: break-all;
}

.mp-callout__arrow {
    flex-shrink: 0;
    margin-left: 8rpx;
    font-size: 30rpx;
    line-height: 30rpx;
    color: #b0b5c0;
}

.mp-callout__line {
    width: 2rpx;
    height: 20rpx;
    background-color: #333333;
}
/* #endif */
</style>
