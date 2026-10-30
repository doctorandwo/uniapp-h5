<template>
    <view class="map-view-root">
        <!-- 微信小程序：原生 <map> 透传，保留 callout / control 插槽与原生能力 -->
        <!-- #ifdef MP-WEIXIN -->
        <map
            v-if="mapVisible"
            :id="mapId"
            class="map-view"
            :latitude="normalizedLatitude"
            :longitude="normalizedLongitude"
            :scale="scale"
            :markers="mpMarkers"
            :polyline="polyline"
            :polygons="polygons"
            :circles="circles"
            :include-points="includePoints"
            :show-location="showLocation"
            :enable-zoom="enableZoom"
            :enable-scroll="enableScroll"
            :enable-rotate="enableRotate"
            :enable-3D="enable3D"
            @regionchange="onRegionChange"
            @tap="onTap"
            @markertap="onMarkerTap"
            @callouttap="onCalloutTap"
            @updated="onUpdated"
        >
            <cover-view slot="callout">
                <cover-view
                    v-for="m in mpCalloutMarkers"
                    :key="m.id"
                    :marker-id="m.id"
                    class="map-callout"
                >
                    <cover-view class="map-callout__stack">
                        <cover-view
                            v-if="m.callout.tag"
                            class="map-callout__tag"
                            :style="{ backgroundColor: m.callout.tagColor || '#3A65FF' }"
                        >{{ m.callout.tag }}</cover-view>
                        <cover-view class="map-callout__bubble" :class="{ 'map-callout__bubble--tagged': m.callout.tag }">
                            <cover-view class="map-callout__text">{{ m.callout.content }}</cover-view>
                            <cover-view class="map-callout__arrow">›</cover-view>
                        </cover-view>
                    </cover-view>
                    <cover-view class="map-callout__line"></cover-view>
                </cover-view>
            </cover-view>
            <slot name="control" />
        </map>
        <!-- #endif -->

        <!-- H5：高德 JS API 渲染容器（内部加载 SDK，逻辑见下方 methods） -->
        <!-- #ifdef H5 -->
        <view :id="amapContainerId" class="map-view"></view>
        <!-- #endif -->
        <!-- @by oh-my-zerone map-view 跨端根：MP 透传原生 map，H5 走高德 JS API -->
    </view>
</template>

<script>
/**
 * @by oh-my-zerone 2026-10-22
 * 跨端通用地图展示组件（展示型，非选点）。
 * - 微信小程序：渲染原生 <map>，props / events / slots 与官方 <map> 对齐。
 * - H5：抽取 waybillDetails 的高德 JS API 渲染逻辑（SDK 注入、marker / polyline / 视野适配）。
 * 调用方只需把原生 <map> 替换为 <map-view>，用法基本不变。
 *
 * 跨端约束（见 docs/agent/rules-mp.md）：
 * - props 仅传可序列化数据（坐标、markers 数组等），不传含函数的对象。
 * - 事件载荷均为纯数据对象（{type,causedBy}、{markerId}、{latitude,longitude}），不传回调函数。
 */
// services
import { loadAMapJsApi } from '@/common/platform/amap-jsapi.js';

let uid = 0;

// H5 setFitView 避让边距（px）：[上, 下, 左, 右]（高德官方顺序；原注释误写为 [上,右,下,左]，
// 导致左=300/右=48 使内容整体偏右，已按真实顺序重排：左右各 48 居中、上 100 / 下 100）
const FIT_VIEW_AVOID = [100, 100, 48, 48];
// H5 默认中心点（无坐标且无覆盖物时回退）
const FALLBACK_CENTER = { longitude: 116.481488, latitude: 39.990464 };

export default {
    name: 'MapView',
    props: {
        /** 容器 id；不传时自动生成（H5 用于 new AMap.Map(id)） */
        id: { type: String, default: '' },
        /** 中心纬度（Number；传 null 时不渲染小程序 map，H5 回退到覆盖物/默认中心） */
        latitude: { type: [String, Number], default: '' },
        /** 中心经度 */
        longitude: { type: [String, Number], default: '' },
        /** 缩放级别（3-20） */
        scale: { type: Number, default: 14 },
        /** 标记点数组，结构对齐原生 marker（id/latitude/longitude/iconPath/width/height/anchor/callout/customCallout） */
        markers: { type: Array, default: () => [] },
        /** 折线数组，对齐原生 polyline（points/color/width/dottedLine/arrowLine） */
        polyline: { type: Array, default: () => [] },
        /** 多边形数组，对齐原生 polygons（points/strokeColor/strokeWidth/fillColor） */
        polygons: { type: Array, default: () => [] },
        /** 圆数组，对齐原生 circles（longitude/latitude/radius/color/strokeWidth/fillColor） */
        circles: { type: Array, default: () => [] },
        /** 是否显示当前定位点（H5 通过 AMap.Geolocation 插件实现） */
        showLocation: { type: Boolean, default: false },
        /** 是否允许缩放 */
        enableZoom: { type: Boolean, default: true },
        /** 是否允许拖动 */
        enableScroll: { type: Boolean, default: true },
        /** 是否允许旋转 */
        enableRotate: { type: Boolean, default: false },
        /** 是否开启 3D 楼块（H5 暂不做映射） */
        enable3D: { type: Boolean, default: false },
        /** 视野自动包含的点（等价 setFitView 的 includePoints） */
        includePoints: { type: Array, default: () => [] },
        /** 是否根据 markers / polyline / 覆盖物自动适配视野 */
        fitView: { type: Boolean, default: true },
        /** H5 高德 JS API key；缺省取环境变量 VUE_APP_JS_MAP_KEY */
        amapKey: { type: String, default: '' },
        /**
         * H5 setFitView 避让边距（px）：[上, 下, 左, 右]（高德官方顺序）。
         * 不传时回退内置默认值 FIT_VIEW_AVOID；外部可传入四元数组按需覆盖上下左右留白。
         * @by oh-my-zerone 2026-10-24
         */
        fitViewAvoid: {
            type: Array,
            default: () => [...FIT_VIEW_AVOID],
        },
        /**
         * H5 端 marker.anchor 补偿量（比例，相对图标尺寸，与 marker.anchor 同量纲）。
         * 调用方统一传「微信原生语义」的 anchor 比例值（如 {x:0.5,y:0.5} 表图标中心落坐标），
         * H5 在 addH5Marker 内叠加本补偿，复刻高德 1.4 手动锚点（0×0 包裹层 + 绝对定位）
         * 相对 MP 原生 <map> 的视觉落点差异，使两端观感对齐。默认 {x:0,y:0} 不改变任何现有行为，
         * 仅 QuoteMap 等需要补偿的调用方显式传入（如 {x:-0.35,y:-1.15}）。
         * @by oh-my-zerone 2026-10-24
         */
        h5AnchorCompensation: {
            type: Object,
            default: () => ({ x: 0, y: 0 }),
        },
    },
    data() {
        uid += 1;
        return {
            mapId: this.id || `map-view-${uid}`,
            amapContainerId: `map-view-amap-${uid}`,
            amapInstance: null,
            markerInstances: [],
            polylineInstances: [],
            polygonInstances: [],
            circleInstances: [],
            // includePoints 经纬度极值的「不可见标记」实例（仅参与 setFitView 框选，不渲染）
            fitPaddingInstances: [],
            geolocation: null,
            // #ifdef H5
            _lockRegionChange: false,
            // 最近一次程序化平移/缩放的时间戳（ms），用于抑制程序化移动触发的 regionchange
            _lastProgrammaticMove: 0,
            // 缩放手势窗口标记：高德缩放会连带触发 move 事件，窗口内禁止抛 drag
            _zooming: false,
            // 最近一次 zoomstart 时间戳（ms），用于「缩放窗口」兜底复位，防止标记卡死
            _lastZoomStart: 0,
            // movestart 时记录的缩放级别：与 moveend 时比对，识别「缩放连带触发」的 move 事件
            _zoomAtMoveStart: null,
            // 已抛出但尚未配对的 begin 事件的 causedBy（'' 表示无待配对），用于保证 begin / end 成对
            _pendingBegin: '',
            // 缩放结束后 _zooming 复位定时器句柄（beforeDestroy 清理）
            _zoomResetTimer: null,
            // #endif
        };
    },
    computed: {
        /** 解析最终使用的高德 key：props 优先，其次环境变量 */
        resolvedAmapKey() {
            return this.amapKey || process.env.VUE_APP_JS_MAP_KEY || '';
        },
        /**
         * 地图是否可见：双端统一按坐标有效性判断，兼容数字 / 数字字符串，
         * 排除空串 / null / NaN / 非数字（避免 H5 端 '' → 0,0 落到海洋，MP 端渲染异常坐标）。
         * @returns {boolean}
         */
        mapVisible() {
            return this.isValidCoord(this.latitude) && this.isValidCoord(this.longitude);
        },
        /** 归一化为 Number 的中心纬度（无效则 null），用于小程序原生 map 绑定 */
        normalizedLatitude() {
            return this.isValidCoord(this.latitude) ? Number(this.latitude) : null;
        },
        /** 归一化为 Number 的中心经度（无效则 null） */
        normalizedLongitude() {
            return this.isValidCoord(this.longitude) ? Number(this.longitude) : null;
        },
        /**
         * 小程序端 markers：把调用方的原生 callout 转成 customCallout，
         * 由组件内 <cover-view slot="callout"> 渲染同款居中气泡。
         * 原因：原生 callout 在 marker 同时带 label 时会被 label 落点拉偏，导致气泡水平中心
         * 不对准圆点；customCallout 锚定独立可控（沿用项目内 waybillDetails 已验证的范式）。
         * 仅转换「有 callout 且无 customCallout」的 marker，其余原样透传，不影响 MapPicker 等调用方。
         * @by oh-my-zerone 2026-10-24
         */
        mpMarkers() {
            return (this.markers || []).map(m => {
                if (!m || (!m.callout && !m.customCallout)) return m;
                const nm = { ...m };
                if (nm.callout && !nm.customCallout) {
                    nm.customCallout = {
                        anchorX: 0.5,
                        anchorY: 8,
                        display: nm.callout.display || 'ALWAYS',
                    };
                    delete nm.callout;
                }
                return nm;
            });
        },
        /** 小程序端需渲染自定义气泡的 marker（用于 <cover-view slot="callout"> 循环，读取 callout.content） */
        mpCalloutMarkers() {
            return (this.markers || []).filter(m => m && m.callout && m.callout.content);
        },
    },
    watch: {
        markers: { handler() { this.renderH5Overlays(); }, deep: true },
        polyline: { handler() { this.renderH5Overlays(); }, deep: true },
        polygons: { handler() { this.renderH5Overlays(); }, deep: true },
        circles: { handler() { this.renderH5Overlays(); }, deep: true },
        latitude() { this.syncH5Center(); },
        longitude() { this.syncH5Center(); },
        scale() { this.syncH5Center(); },
        showLocation(val) { this.toggleH5Location(val); },
        enableZoom(val) { this.updateH5Status(); },
        enableScroll(val) { this.updateH5Status(); },
        /**
         * includePoints 变化（选点完成 / 坐标回填 / 视口比例变化）时重框视野。
         * @by oh-my-zerone 2026-10-24 H5 由 fitH5View 处理，MP 端此前无集中 fit，
         * 仅靠原生 include-points 绑定与调用方跨组件 includePoints 不稳定；此处统一在组件内驱动。
         */
        includePoints: {
            handler() {
                // #ifdef MP-WEIXIN
                setTimeout(()=>{
                    this.fitMpView();
                },0)
                // #endif
            },
            deep: true,
        },
    },
    mounted() {
        // #ifdef H5
        this.initAMap();
        // #endif
    },
    beforeDestroy() {
        // #ifdef H5
        this.clearZoomResetTimer();
        this.clearH5Overlays();
        if (this.geolocation && this.amapInstance) {
            this.amapInstance.removeControl(this.geolocation);
        }
        if (this.amapInstance) {
            this.amapInstance.destroy();
            this.amapInstance = null;
        }
        // #endif
    },
    methods: {
        // ===================== 小程序：事件透传 =====================
        /** 原生 regionchange 直接透传（{type, causedBy}） */
        onRegionChange(e) { this.$emit('regionchange', e); },
        /** 原生 tap 直接透传 */
        onTap(e) { this.$emit('tap', e); },
        /** 原生 markertap 直接透传 */
        onMarkerTap(e) { this.$emit('markertap', e); },
        /** 原生 callouttap 直接透传 */
        onCalloutTap(e) { this.$emit('callouttap', e); },
        /** 原生 updated 直接透传 */
        onUpdated(e) { this.$emit('updated', e); },

        /**
         * 跨端获取当前地图中心点坐标。
         * 小程序走 uni.createMapContext().getCenterLocation；H5 走 AMap.getCenter()。
         * 供「拖动选点」类调用方（如 MapPicker）在 regionchange 后读取中心。
         * @returns {Promise<{longitude:number, latitude:number}|null>}
         */
        getCenterLocation() {
            // #ifdef MP-WEIXIN
            return new Promise(resolve => {
                uni.createMapContext(this.mapId, this).getCenterLocation({
                    success: res => resolve({ longitude: res.longitude, latitude: res.latitude }),
                    fail: () => resolve(null),
                });
            });
            // #endif
            // #ifdef H5
            return new Promise(resolve => {
                if (!this.amapInstance) { resolve(null); return; }
                const c = this.amapInstance.getCenter();
                resolve({ longitude: c.getLng(), latitude: c.getLat() });
            });
            // #endif
        },

        /**
         * 跨端把地图中心「命令式」移动到指定坐标（不依赖 props 差分，程序化移动会抑制事件回灌）。
         * 用于「点击列表 POI 后地图中心即以该点为中心」这类必须确保生效的场景：
         * 仅靠 latitude / longitude props 差分驱动时，若目标值与当前 props 相同（例如拖动后
         * 调用方未同步 props 中心、或重复点击同一项），watcher 不触发，地图就不会移动。
         *
         * @param {number|string} longitude 目标经度
         * @param {number|string} latitude 目标纬度
         * @param {number} [zoom] 目标缩放级别；不传时沿用当前 scale（H5）
         * @returns {void}
         */
        setCenter(longitude, latitude, zoom) {
            // #ifdef MP-WEIXIN
            uni.createMapContext(this.mapId, this).moveToLocation({
                longitude: Number(longitude),
                latitude: Number(latitude),
            });
            // #endif
            // #ifdef H5
            if (!this.amapInstance) return;
            this._lastProgrammaticMove = Date.now();
            this.amapInstance.setZoomAndCenter(Number(zoom) || this.scale || 14, [Number(longitude), Number(latitude)]);
            // #endif
        },

        /**
         * 跨端刷新地图尺寸：容器尺寸（尤其是高度）变化后必须调用一次。
         * H5：高德的 resizeEnable 只监听 window 的 resize，容器高度被外部布局改变时
         *     不会自动刷新，不调用会出现画布错位 / 中心偏移 / 覆盖物位置错乱。
         * 小程序：原生 <map> 随布局自适应，无需处理。
         * @returns {void}
         */
        resize() {
            // #ifdef H5
            const map = this.amapInstance;
            if (!map) return;
            // @by oh-my-zerone 2026-10-23 高德 JS SDK 1.4.15 的 Map 未提供 resize() 方法
            // （该方法是 2.0 才有的 API），直接调用会抛 "resize is not a function"。
            // 1.4 下容器尺寸变化由初始化参数 resizeEnable: true 自行监听并触发 map 的 resize 事件；
            // 这里仅在方法存在时调用（兼容后续升级 2.0），否则派发 window resize 兜底触发重算。
            if (typeof map.resize === 'function') {
                map.resize();
                return;
            }
            try {
                window.dispatchEvent(new Event('resize'));
            } catch (e) {
                // 低版本浏览器不支持 Event 构造函数时兜底
                const evt = document.createEvent('HTMLEvents');
                evt.initEvent('resize', true, false);
                window.dispatchEvent(evt);
            }
            // #endif
        },

        /**
         * 判断坐标是否为有效数值（兼容传入的数字或数字字符串，排除空串 / null / NaN）。
         * @param {*} v
         * @returns {boolean}
         */
        isValidCoord(v) {
            const n = Number(v);
            return v !== null && v !== undefined && v !== '' && isFinite(n);
        },

        // ===================== H5：高德 JS API =====================
        /**
         * H5：加载 SDK 并初始化地图实例，完成后首渲覆盖物与视野。
         * @returns {Promise<void>}
         */
        async initAMap() {
            // #ifdef H5
            if (!this.resolvedAmapKey) {
                uni.showToast({ title: '地图密钥缺失', icon: 'none' });
                return;
            }
            try {
                const AMap = await loadAMapJsApi(this.resolvedAmapKey);
                const center = this.getH5Center();
                // 容器存在性预检：DOM 未就绪时直接返回，等待后续 props watch 触发重渲染
                if (!document.getElementById(this.amapContainerId)) return;
                // @by oh-my-zerone 2026-10-22 必须传容器 id 字符串，不能传 DOM 元素：
                // 高德 Map 构造函数对元素入参仅识别 tagName === 'DIV'，uni-app H5 下
                // <view> 编译为 <uni-view>，传元素会命中不了 DIV 分支致 this.K 为 undefined，
                // 继而 this.K.___amap___ 抛 "Cannot read properties of undefined (reading '___amap___')"；
                // 传 id 字符串时高德内部自行 getElementById，不校验 tagName（与 waybillDetails 一致）。
                this.amapInstance = new AMap.Map(this.amapContainerId, {
                    zoom: this.scale || 14,
                    center: [center.longitude, center.latitude],
                    resizeEnable: true,
                    dragEnable: this.enableScroll,
                    zoomEnable: this.enableZoom,
                    rotateEnable: this.enableRotate,
                    // @by oh-my-zerone 2026-10-23 双指缩放以「地图中心」为锚点（默认以双指中间点为锚点，
                    // 会移动地图中心，导致中心标点（如 MapPicker 的选点标点）缩放后偏离定位点）。
                    // 置 1 后缩放只改变级别、中心不动，与微信小程序缩放表现一致。
                    touchZoomCenter: 1,
                });
                this.bindH5MapEvents();
                if (this.showLocation) this.toggleH5Location(true);
                this.renderH5Overlays();
                // 首帧完成通知（对齐原生 updated）
                this.amapInstance.on('complete', () => this.$emit('updated', {}));
            } catch (e) {
                // 打印真实错误，便于定位：缺安全密钥(INVALID_USER_SCODE) / key 无效 / 网络等
                console.error('[MapView] 高德地图初始化失败', e);
                const msg = (e && e.message) ? e.message : '请检查网络或高德 key 配置';
                uni.showToast({ title: `地图加载失败：${msg}`.slice(0, 30), icon: 'none' });
            }
            // #endif
        },
        /**
         * H5：清理「缩放结束后 _zooming 复位」定时器。
         * 缩放手势连续触发时复用同一个定时器窗口，组件销毁时避免回调残留。
         * @returns {void}
         */
        clearZoomResetTimer() {
            // #ifdef H5
            if (this._zoomResetTimer) {
                clearTimeout(this._zoomResetTimer);
                this._zoomResetTimer = null;
            }
            // #endif
        },
        /**
         * H5：判断当前是否处于缩放手势窗口内（zoomstart → zoomend 之后 600ms）。
         * 窗口内的 move 事件一律视为缩放连带触发，不抛 drag。
         * 另加 2s 兜底复位：若 zoomend 未触发导致 _zooming 卡死，拖动事件也不会被永久吞掉。
         * @returns {boolean}
         */
        isZoomGesture() {
            // #ifdef H5
            if (!this._zooming) return false;
            if (Date.now() - this._lastZoomStart > 2000) {
                this._zooming = false;
                return false;
            }
            return true;
            // #endif
        },
        /** H5：绑定地图级事件（regionchange / tap），归一化为原生语义 */
        bindH5MapEvents() {
            // #ifdef H5
            if (!this.amapInstance) return;
            // 统一包裹为 { detail }，与小程序原生 <map> 事件结构对齐（调用方均用 e.detail.xxx）
            // @by oh-my-zerone 2026-10-22 causedBy 必须对齐原生取值：平移 → 'drag'，缩放 → 'scale'。
            // 曾误用 'gesture'，调用方 MapPicker 按原生白名单 ['drag','scale','update'] 过滤，
            // 导致 H5 端 regionchange 被整体丢弃，拖动后中心点/周边 POI 刷新逻辑全部失效。
            const emitRegion = (type, causedBy) => this.$emit('regionchange', { detail: { type, causedBy } });
            // 程序化平移/缩放（setZoomAndCenter/setFitView）会触发事件，500ms 内抑制，避免反馈循环
            const suppressed = () => Date.now() - this._lastProgrammaticMove < 500;
            // @by oh-my-zerone 2026-10-23 begin / end 必须成对抛出。
            // 调用方（MapPicker）在 begin 时隐藏中心标点、end 时恢复；一旦 end 因「缩放连带」
            // 或「程序化移动抑制」被吞掉，标点就会永久隐藏（真机偶现「放大/缩小/拖动后 mark 消失」）。
            // 因此：begin 记录 _pendingBegin，任何收尾分支都必须补发配对的 end。
            const emitBegin = causedBy => {
                this._pendingBegin = causedBy;
                emitRegion('begin', causedBy);
            };
            const closePending = overrideCausedBy => {
                const pending = this._pendingBegin;
                if (!pending) return;
                this._pendingBegin = '';
                emitRegion('end', overrideCausedBy || pending);
            };
            // @by oh-my-zerone 2026-10-23 缩放手势期间只抛 scale，禁止抛 drag。
            // 高德缩放会连带触发 movestart / moveend，若一并抛出 drag，调用方（MapPicker）
            // 会把缩放误判为拖动：begin 隐藏中心标点、end 把标点重定位到地图中心，
            // 即「缩放改变 mark 位置」。故用 _zooming 窗口吞掉缩放期间（含结束后滞后）的 move 事件。
            this.amapInstance.on('movestart', () => {
                this._zoomAtMoveStart = this.amapInstance.getZoom();
                if (this.isZoomGesture() || suppressed()) return;
                emitBegin('drag');
            });
            this.amapInstance.on('moveend', () => {
                // 与时序无关的判定：高德文档明确 moveend「包括平移，以及中心点变化的缩放」，
                // 若本次 move 期间缩放级别发生变化，说明它是缩放手势触发的（含缓动结束后补发的
                // moveend），收尾时用 scale 而不是 drag，避免调用方把缩放当拖动并重定位中心标点。
                const zoomChanged = this._zoomAtMoveStart != null && this.amapInstance.getZoom() !== this._zoomAtMoveStart;
                this._zoomAtMoveStart = null;
                if (zoomChanged || this.isZoomGesture()) {
                    closePending('scale');
                    return;
                }
                // 抑制分支也要补发 end，否则调用方的 begin 永远收不到配对（标点隐藏不恢复）
                if (suppressed()) {
                    closePending();
                    return;
                }
                closePending('drag');
            });
            this.amapInstance.on('zoomstart', () => {
                this._zooming = true;
                this._lastZoomStart = Date.now();
                this.clearZoomResetTimer();
                if (!suppressed()) emitBegin('scale');
            });
            this.amapInstance.on('zoomend', () => {
                closePending('scale');
                // 延时复位：覆盖缩放缓动结束后补发的 moveend（缓动时长不定，故取较宽窗口）
                this.clearZoomResetTimer();
                this._zoomResetTimer = setTimeout(() => {
                    this._zoomResetTimer = null;
                    this._zooming = false;
                }, 600);
            });
            this.amapInstance.on('click', e => {
                const lnglat = e && e.lnglat;
                if (lnglat) {
                    this.$emit('tap', { detail: { latitude: lnglat.getLat(), longitude: lnglat.getLng() } });
                }
            });
            // #endif
        },
        /** H5：根据交互开关更新地图状态（缩放 / 拖动） */
        updateH5Status() {
            // #ifdef H5
            if (!this.amapInstance) return;
            this.amapInstance.setStatus({
                dragEnable: this.enableScroll,
                zoomEnable: this.enableZoom,
                rotateEnable: this.enableRotate,
            });
            // #endif
        },
        /**
         * H5：计算地图中心。优先级：latitude/longitude > 第一个覆盖物点 > 默认中心。
         * @returns {{longitude:number, latitude:number}}
         */
        getH5Center() {
            // #ifdef H5
            if (this.normalizedLatitude != null && this.normalizedLongitude != null) {
                return { longitude: this.normalizedLongitude, latitude: this.normalizedLatitude };
            }
            const points = this.collectH5Points();
            if (points.length) return points[0];
            // #endif
            return FALLBACK_CENTER;
        },
        /**
         * H5：汇总所有需要纳入视野的点（includePoints + 各类覆盖物点位）。
         * @returns {Array<{longitude:number, latitude:number}>}
         */
        collectH5Points() {
            const list = [];
            const push = p => {
                if (p && this.isValidCoord(p.longitude) && this.isValidCoord(p.latitude)) {
                    list.push({ longitude: Number(p.longitude), latitude: Number(p.latitude) });
                }
            };
            (this.includePoints || []).forEach(push);
            (this.markers || []).forEach(push);
            (this.circles || []).forEach(push);
            (this.polyline || []).forEach(line => (line.points || []).forEach(push));
            (this.polygons || []).forEach(poly => (poly.points || []).forEach(push));
            return list;
        },
        /**
         * H5：清空所有覆盖物实例。
         */
        clearH5Overlays() {
            // #ifdef H5
            this.markerInstances.forEach(m => m.setMap(null));
            this.markerInstances = [];
            this.polylineInstances.forEach(p => this.amapInstance && this.amapInstance.remove(p));
            this.polylineInstances = [];
            this.polygonInstances.forEach(p => this.amapInstance && this.amapInstance.remove(p));
            this.polygonInstances = [];
            this.circleInstances.forEach(c => this.amapInstance && this.amapInstance.remove(c));
            this.circleInstances = [];
            // 清理 includePoints 视野留白点的不可见标记
            this.fitPaddingInstances.forEach(m => this.amapInstance && m.setMap(null));
            this.fitPaddingInstances = [];
            // #endif
        },
        /**
         * H5：重绘全部覆盖物；fitView 开启时顺带适配视野。由 props watch 触发。
         */
        renderH5Overlays() {
            // #ifdef H5
            if (!this.amapInstance) return;
            this.clearH5Overlays();
            (this.markers || []).forEach(m => this.addH5Marker(m));
            (this.polyline || []).forEach(line => this.addH5Polyline(line));
            (this.polygons || []).forEach(poly => this.addH5Polygon(poly));
            (this.circles || []).forEach(c => this.addH5Circle(c));
            // @by oh-my-zerone 2026-10-22 仅 fitView 开启时才在覆盖物重绘后适配视野。
            // fitView 关闭（选点场景）时相机只允许被 latitude/longitude/scale props（syncH5Center）
            // 和用户手势驱动：否则拖动开始（markers 清空）/拖动结束（markerCenter 更新）触发重绘时，
            // fitH5View 会 setZoomAndCenter 回 props 里的旧中心，把用户拖动的地图拽回去。
            if (this.fitView) this.fitH5View();
            // #endif
        },
        /**
         * H5：根据 includePoints 计算视野留白点的「不可见标记」并缓存到 fitPaddingInstances。
         * 仅取经纬度极值（西南 / 东北两个角点），避免把 routeLinePoints 等大量点位逐个
         * 建标记；这些标记只参与 setFitView 框选、内容为空不渲染，等价于 MP 的 include-points。
         * @returns {void}
         */
        ensureFitPaddingInstances() {
            // #ifdef H5
            const AMap = window.AMap;
            // 先清理上一轮实例，保证 includePoints 变化后不残留旧角点
            this.fitPaddingInstances.forEach(m => this.amapInstance && m.setMap(null));
            this.fitPaddingInstances = [];
            const pts = (this.includePoints || [])
                .filter(p => this.isValidCoord(p.longitude) && this.isValidCoord(p.latitude))
                .map(p => [Number(p.longitude), Number(p.latitude)]);
            if (!pts.length || !AMap) return;
            let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
            pts.forEach(([lng, lat]) => {
                minLng = Math.min(minLng, lng);
                minLat = Math.min(minLat, lat);
                maxLng = Math.max(maxLng, lng);
                maxLat = Math.max(maxLat, lat);
            });
            // 极值为角点：并入 setFitView 后，H5 视野与 MP include-points 范围一致
            [[minLng, minLat], [maxLng, maxLat]].forEach(pos => {
                const mk = new AMap.Marker({
                    position: pos,
                    // 空内容：不渲染，仅参与视野计算
                    content: '<div style="width:0;height:0;"></div>',
                    map: this.amapInstance,
                    zIndex: 0,
                });
                this.fitPaddingInstances.push(mk);
            });
            // #endif
        },
        /**
         * H5：根据 fitView 开关适配视野；关闭时按中心 + scale 定位。
         */
        fitH5View() {
            // #ifdef H5
            if (!this.amapInstance) return;
            // @by oh-my-zerone 2026-10-24 避让边距优先取外部传入的 fitViewAvoid，
            // 校验不合法（非四元数组）时回退内置 FIT_VIEW_AVOID，避免高德 setFitView 抛错
            const avoid = (Array.isArray(this.fitViewAvoid) && this.fitViewAvoid.length === 4)
                ? this.fitViewAvoid
                : FIT_VIEW_AVOID;
            if (this.fitView) {
                const targets = [
                    ...this.markerInstances,
                    ...this.polylineInstances,
                    ...this.polygonInstances,
                    ...this.circleInstances,
                ];
                // @by oh-my-zerone 2026-10-23 对齐 MP 原生 include-points：
                // 将 includePoints 的经纬度极值作为「不可见标记」并入 setFitView 目标，
                // 使 H5 与小程序原生 <map> include-points 的视野框选范围一致
                // （否则 QuoteMap 注入的 viewport 留白点在 H5 端被忽略，两端视野不一致）。
                this.ensureFitPaddingInstances();
                const fitTargets = targets.concat(this.fitPaddingInstances);
                console.log('===fitTargets',fitTargets)
                if (fitTargets.length) {
                    this._lastProgrammaticMove = Date.now();
                    this.amapInstance.setFitView(fitTargets, false, avoid);
                    // 二次校正：字体/图片异步加载后尺寸变化，延迟再 fit 一次
                    setTimeout(() => {
                        if (this.amapInstance) {
                            this._lastProgrammaticMove = Date.now();
                            this.amapInstance.setFitView(fitTargets, false, avoid);
                        }
                    }, 200);
                    return;
                }
            }
            // 未开启 fitView 或无覆盖物：定位到中心 + scale
            const center = this.getH5Center();
            this._lastProgrammaticMove = Date.now();
            this.amapInstance.setZoomAndCenter(this.scale || 14, [center.longitude, center.latitude]);
            // #endif
        },
        /**
         * MP：根据 includePoints（含 viewport 留白角点）重框视野，使之囊括所有覆盖物。
         * 由 includePoints 的 watch 驱动；本方法直接持有 <map> 的 mapId 与组件实例，
         * 规避调用方跨组件 createMapContext 在嵌套自定义组件下定位不稳定的问题。
         * padding 由 fitViewAvoid（[上, 下, 左, 右]）转换为微信 includePoints 的 [上, 右, 下, 左]。
         * @by oh-my-zerone 2026-10-24
         * @returns {void}
         */
        fitMpView() {
            // #ifdef MP-WEIXIN
            const points = (this.includePoints || []).filter(
                p => this.isValidCoord(p.longitude) && this.isValidCoord(p.latitude),
            );
            if (!points.length) return;
            const ctx = uni.createMapContext(this.mapId, this);
            if (!ctx || typeof ctx.includePoints !== 'function') return;
            // 归一化为微信要求的 { latitude, longitude }（按字段名取值，顺序无关）
            const normalized = points.map(p => ({
                latitude: Number(p.latitude),
                longitude: Number(p.longitude),
            }));
            // fitViewAvoid 顺序 [上, 下, 左, 右] → 微信 padding [上, 右, 下, 左]
            const avoid = (Array.isArray(this.fitViewAvoid) && this.fitViewAvoid.length === 4)
                ? this.fitViewAvoid
                : FIT_VIEW_AVOID;
            const padding = [avoid[0], avoid[3], avoid[1], avoid[2]];
            ctx.includePoints({ points: normalized, padding });
            // #endif
        },
        /**
         * H5：坐标 / scale 变化且未开启 fitView 时，同步地图中心与缩放。
         */
        syncH5Center() {
            // #ifdef H5
            if (!this.amapInstance) return;
            if (this.fitView) {
                this.fitH5View();
            } else {
                const center = this.getH5Center();
                this._lastProgrammaticMove = Date.now();
                this.amapInstance.setZoomAndCenter(this.scale || 14, [center.longitude, center.latitude]);
            }
            // #endif
        },
        /**
         * H5：添加单个 marker。
         * 策略 A（已确认）：customCallout 在 H5 降级——有 callout 文本则渲染文本气泡，
         * 仅有 customCallout 时只渲染图标/圆点；点击图标抛 markertap，点击气泡抛 callouttap（对齐 MP）。
         *
         * @by oh-my-zerone 2026-10-22 锚定对齐微信小程序：
         * 高德 JS SDK 为 1.4.15，其 Marker 的 anchor 选项不可靠（字符串锚点为 2.0 特性，
         * 1.4 下静默失效），且此前实现忽略了调用方传入的 marker.anchor，导致 H5 图标
         * 相对实际坐标偏上。现改用 waybillDetails 已验证的「0×0 包裹层 + 绝对定位」方案：
         * 以坐标点为 0×0 锚点，图标按 marker.anchor 比例（缺省 {x:0.5, y:1}，即微信
         * 原生默认底边中点）精确锚定在坐标点上，气泡 + 引导线绝对定位于图标正上方，
         * 两端锚定几何完全一致，不依赖 SDK 锚点行为。
         *
         * @param {Object} marker 对齐原生 marker 结构
         */
        addH5Marker(marker) {
            // #ifdef H5
            const AMap = window.AMap;
            if (!this.isValidCoord(marker.longitude) || !this.isValidCoord(marker.latitude)) return;
            const width = Number(marker.width) || 24;
            const height = Number(marker.height) || 24;
            // 解析原生 anchor（相对图标尺寸的比例锚点），非法或缺省时回退 0
            const rawAnchorX = marker.anchor && isFinite(Number(marker.anchor.x)) ? Number(marker.anchor.x) : 0;
            const rawAnchorY = marker.anchor && isFinite(Number(marker.anchor.y)) ? Number(marker.anchor.y) : 0;
            // @by oh-my-zerone 2026-10-24 H5 端 anchor 补偿：调用方统一传 MP 原生语义比例值（如 {x:0.5,y:0.5}），
            // 在此叠加 h5AnchorCompensation，复刻高德 1.4 手动锚点相对 MP 原生 <map> 的视觉落点差异，使两端观感对齐；
            // 默认 {x:0,y:0} 不改变现有行为，不影响 MapPicker 等默认锚点调用方。
            const comp = (this.h5AnchorCompensation && typeof this.h5AnchorCompensation === 'object') ? this.h5AnchorCompensation : { x: 0, y: 0 };
            const anchorX = rawAnchorX + (Number(comp.x) || 0);
            const anchorY = rawAnchorY + (Number(comp.y) || 0);
            const bubble = marker.callout && marker.callout.content ? marker.callout : null;
            // @by oh-my-zerone 2026-10-23 对齐原生 marker.label：H5 此前仅渲染 callout / 图标，
            // 未渲染 label，导致 QuoteMap 的「起点 / 终点」彩色角标在 H5 缺失、两端不一致。这里统一补齐。
            const labelHtml = this.buildLabelContent(marker.label);
            let innerHtml;
            if (bubble) {
                innerHtml = this.buildBubbleContent(bubble, marker.iconPath, width, height, anchorX, anchorY);
            } else {
                // 无气泡：仅图标（或默认蓝点），图标锚点像素精确落在坐标点上
                innerHtml = marker.iconPath
                    ? `<img src="${marker.iconPath}" style="position:absolute;left:${-anchorX * width}px;top:${-anchorY * height}px;width:${width}px;height:${height}px;display:block;" />`
                    // 无图标也无气泡：默认蓝点（以坐标点为圆心）
                    : '<div style="position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:#3A65FF;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.3);"></div>';
            }
            // @by oh-my-zerone 2026-10-23 用真实 DOM 承载 content：便于给 callout 气泡单独挂点击，
            // 对齐 MP callouttap 语义（点击气泡仅抛 callouttap，不抛 markertap）。
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '0';
            wrapper.style.height = '0';
            wrapper.innerHTML = `${innerHtml}${labelHtml}`;
            // 点击气泡：抛 callouttap 并阻止冒泡，避免同时触发 marker 的 markertap（对齐 MP 行为）
            if (bubble) {
                const calloutEl = wrapper.querySelector('.map-view-callout');
                if (calloutEl) {
                    calloutEl.addEventListener('click', e => {
                        e.stopPropagation();
                        this.$emit('callouttap', { detail: { markerId: marker.id } });
                    });
                }
            }
            const amapMarker = new AMap.Marker({
                position: [Number(marker.longitude), Number(marker.latitude)],
                content: wrapper,
                map: this.amapInstance,
                zIndex: 200,
                extData: { markerId: marker.id },
                // @by oh-my-zerone 2026-10-24 必须显式置零 offset：高德 1.4 Marker 默认 offset 为
                // Pixel(-10, -34)（为其自带 20×34 大头针图标设计），自定义 content 时不置零会导致
                // 整个包裹层（圆点/气泡/label）整体左移 10px、上移 34px，圆点脱离线路两端。
                // 置零后包裹层原点精确落在坐标上，anchor {x:0.5,y:0.5} 即圆点中心压坐标，与 MP 原生一致。
                offset: new AMap.Pixel(0, 0),
            });
            amapMarker.on('click', () => this.$emit('markertap', { detail: { markerId: marker.id } }));
            this.markerInstances.push(amapMarker);
            // #endif
        },
        /**
         * H5：构建「气泡 + 引导线 + 图标」的 marker 内容（innerHTML）。
         * 对齐原生 callout 字段：content / color / fontSize / bgColor / borderRadius / padding。
         *
         * @by oh-my-zerone 2026-10-22 结构改为 0×0 包裹层 + 绝对定位（对齐微信小程序锚定语义）：
         * - 图标：left:-anchorX*width / top:-anchorY*height，使图标 anchor 像素点精确落在坐标点；
         * - 气泡+引导线：bottom 对齐图标顶部（anchorY*height），水平对齐图标锚点垂直线
         *   （left:(0.5-anchorX)*width + translateX(-50%)）。
         * 包裹层为 0×0，坐标点即其左上角，渲染结果不受高德 1.4 Marker anchor 兼容性影响。
         *
         * @param {Object} callout 原生 callout 对象
         * @param {string} [iconPath] 锚点图标
         * @param {number} width 图标宽
         * @param {number} height 图标高
         * @param {number} anchorX 锚点横向比例（0-1，相对图标宽度）
         * @param {number} anchorY 锚点纵向比例（0-1，相对图标高度）
         * @returns {string} HTML 字符串
         */
        buildBubbleContent(callout, iconPath, width, height, anchorX, anchorY) {
            const label = callout.content || '';
            const color = callout.color || '#333333';
            const fontSize = callout.fontSize || 12;
            const bgColor = callout.bgColor || '#ffffff';
            const borderRadius = callout.borderRadius != null ? callout.borderRadius : 6;
            const padding = callout.padding != null ? callout.padding : 8;
            /**
             * @by oh-my-zerone 2026-10-28 对齐设计稿：标签改为卡片左上角角标，与地址卡合为一体；
             * 地址最多两行，右侧带进入箭头。未传 tag 时按普通气泡渲染，不影响其他调用方。
             */
            const tag = callout.tag || '';
            const tagColor = callout.tagColor || '#3A65FF';
            const tagHtml = tag
                ? `<div style="background:${tagColor};color:#FFFFFF;font-size:${fontSize - 1}px;line-height:${fontSize + 3}px;padding:2px 8px;border-radius:6px 6px 0 0;box-sizing:border-box;white-space:nowrap;">${tag}</div>`
                : '';
            const cardRadius = tag ? '0 10px 10px 10px' : `${borderRadius}px`;
            const dot = iconPath
                ? `<img src="${iconPath}" style="position:absolute;left:${-anchorX * width}px;top:${-anchorY * height}px;width:${width}px;height:${height}px;display:block;" />`
                : '<div style="position:absolute;left:-4.5px;top:-4.5px;width:9px;height:9px;background:#333;border-radius:50%;"></div>';
            return `
                <div class="map-view-callout" style="position:absolute;left:${(0.5 - anchorX) * width}px;bottom:${anchorY * height}px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;width:max-content;">
                    <div style="display:flex;flex-direction:column;align-items:flex-start;">
                        ${tagHtml}
                        <div style="display:flex;align-items:center;gap:6px;background:${bgColor};padding:${padding}px;border-radius:${cardRadius};box-shadow:0 2px 10px rgba(0,0,0,.1);max-width:200px;box-sizing:border-box;">
                            <div style="flex:1;min-width:0;color:${color};font-size:${fontSize}px;line-height:${fontSize + 4}px;white-space:normal;word-break:break-all;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;">${label}</div>
                            <div style="flex-shrink:0;color:#B0B5C0;font-size:${fontSize + 4}px;line-height:1;">›</div>
                        </div>
                    </div>
                    <div style="width:1px;height:10px;background:#333;flex-shrink:0;"></div>
                </div>
                ${dot}
            `;
        },
        /**
         * H5：构造 marker.label 的 HTML（对齐原生 label 字段 content / color / bgColor /
         * fontSize / borderRadius / padding / anchorX / anchorY）。
         * 原生 <map> 的 label 在 H5 端由本方法补齐，否则 QuoteMap 的「起点 / 终点」彩色角标会缺失。
         * 锚点语义：label 中心落在以坐标为原点的 (anchorX, anchorY) 像素处（缺省 0,0）。
         *
         * @param {Object} [label] 原生 label 对象
         * @returns {string} HTML 字符串（无 label 时返回空串）
         * @by oh-my-zerone 2026-10-23
         */
        buildLabelContent(label) {
            if (!label || !label.content) return '';
            const text = label.content || '';
            const color = label.color || '#FFFFFF';
            const bgColor = label.bgColor || '#3A65FF';
            const fontSize = label.fontSize || 12;
            const borderRadius = label.borderRadius != null ? label.borderRadius : 6;
            const padding = label.padding != null ? label.padding : 6;
            const anchorX = label.anchorX != null ? Number(label.anchorX) : 0;
            const anchorY = label.anchorY != null ? Number(label.anchorY) : 0;
            return `<div style="position:absolute;left:${anchorX}px;top:${anchorY}px;transform:translate(-50%,-50%);background:${bgColor};color:${color};font-size:${fontSize}px;line-height:${fontSize + 2}px;padding:${padding}px;border-radius:${borderRadius}px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.15);box-sizing:border-box;">${text}</div>`;
        },
        /**
         * H5：添加单条折线。
         * @param {Object} line 对齐原生 polyline（points/color/width/dottedLine/arrowLine）
         */
        addH5Polyline(line) {
            console.log('addH5Polyline',line)
            // #ifdef H5
            const AMap = window.AMap;
            const path = (line.points || [])
                .filter(p => this.isValidCoord(p.longitude) && this.isValidCoord(p.latitude))
                .map(p => [Number(p.longitude), Number(p.latitude)]);

            console.log('path==',path)
            if (!path.length) return;
            const polyline = new AMap.Polyline({
                path,
                strokeColor: line.color || '#3A65FF',
                strokeWeight: line.width || 3,
                strokeStyle: line.dottedLine ? 'dashed' : 'solid',
                showDir: !!line.arrowLine,
                map: this.amapInstance,
                zIndex: 50,
            });
            this.polylineInstances.push(polyline);
            // #endif
        },
        /**
         * H5：添加单个多边形。
         * @param {Object} poly 对齐原生 polygons（points/strokeColor/strokeWidth/fillColor）
         */
        addH5Polygon(poly) {
            // #ifdef H5
            const AMap = window.AMap;
            const path = (poly.points || [])
                .filter(p => this.isValidCoord(p.longitude) && this.isValidCoord(p.latitude))
                .map(p => [Number(p.longitude), Number(p.latitude)]);
            if (!path.length) return;
            const polygon = new AMap.Polygon({
                path,
                strokeColor: poly.strokeColor || '#3A65FF',
                strokeWeight: poly.strokeWidth || 2,
                fillColor: poly.fillColor || 'rgba(58,101,255,0.1)',
                map: this.amapInstance,
            });
            this.polygonInstances.push(polygon);
            // #endif
        },
        /**
         * H5：添加单个圆。
         * @param {Object} c 对齐原生 circles（longitude/latitude/radius/color/strokeWidth/fillColor）
         */
        addH5Circle(c) {
            // #ifdef H5
            const AMap = window.AMap;
            if (!this.isValidCoord(c.longitude) || !this.isValidCoord(c.latitude) || !this.isValidCoord(c.radius)) return;
            const circle = new AMap.Circle({
                center: [Number(c.longitude), Number(c.latitude)],
                radius: Number(c.radius),
                strokeColor: c.color || '#3A65FF',
                strokeWeight: c.strokeWidth || 2,
                fillColor: c.fillColor || 'rgba(58,101,255,0.1)',
                map: this.amapInstance,
            });
            this.circleInstances.push(circle);
            // #endif
        },
        /**
         * H5：开关当前定位。开启时注入 AMap.Geolocation 插件（含定位按钮与蓝点）。
         * @param {boolean} val
         */
        toggleH5Location(val) {
            // #ifdef H5
            if (!this.amapInstance) return;
            if (val && !this.geolocation) {
                this.amapInstance.plugin('AMap.Geolocation', () => {
                    this.geolocation = new window.AMap.Geolocation({
                        enableHighAccuracy: true,
                        zoomToAccuracy: true,
                    });
                    this.amapInstance.addControl(this.geolocation);
                });
            } else if (!val && this.geolocation) {
                this.amapInstance.removeControl(this.geolocation);
                this.geolocation = null;
            }
            // #endif
        },
    },
};
</script>

<style lang="scss" scoped>
/* 根节点与内部地图均填满父容器；父容器需给定具体高度 */
.map-view-root,
.map-view {
    width: 100%;
    height: 100%;
}

/* 小程序端自定义气泡（customCallout）：居中于圆点，与 H5 同款「角标 + 白底地址卡 + 引导线」；
   沿用 waybillDetails 已验证的范式（flex 列 + align-items:center 实现水平居中） */
/* #ifdef MP-WEIXIN */
.map-callout {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 角标与卡片左对齐堆叠，整块仍由外层居中于圆点 */
.map-callout__stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

/* 卡片左上角角标：仅上圆角，左右与卡片左边缘对齐 */
.map-callout__tag {
    color: #ffffff;
    font-size: 20rpx;
    line-height: 32rpx;
    padding: 0 12rpx;
    border-radius: 10rpx 10rpx 0 0;
}

.map-callout__bubble {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #ffffff;
    border: 1rpx solid #e3e6ee;
    border-radius: 12rpx;
    padding: 12rpx 16rpx;
    max-width: 320rpx;
    box-sizing: border-box;

    /* 带角标时左上角让位给角标 */
    &--tagged {
        border-radius: 0 16rpx 16rpx 16rpx;
    }
}

.map-callout__text {
    flex: 1;
    min-width: 0;
    font-size: 24rpx;
    line-height: 32rpx;
    color: #1f2430;
    text-align: left;
    word-break: break-all;
}

/* 进入箭头（cover-view 无法使用 gap，用 margin 控制间距） */
.map-callout__arrow {
    flex-shrink: 0;
    margin-left: 8rpx;
    font-size: 30rpx;
    line-height: 30rpx;
    color: #b0b5c0;
}

.map-callout__line {
    width: 2rpx;
    height: 20rpx;
    background-color: #333333;
}
/* #endif */
</style>
