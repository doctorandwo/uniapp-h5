/**
 * @by oh-my-zerone 2026-09-30
 * @update 2026-10-09
 * @description 高德地图 Web 服务封装（逆地理 / POI 搜索）。
 *   由原 common/utils/Location.js 收敛至 platform，属平台/服务层能力。
 *   依赖 process.env.VUE_APP_BASE_KEY_WEBMAP（高德 Web 服务 key）。
 *   统一约定：所有方法均返回 Promise<[err, data]>，err 为 true 表示请求失败。
 */

// const
/** 高德 Web 服务基址 */
const AMAP_WEB_BASE_URL = 'https://restapi.amap.com';
/** 默认搜索半径（米） */
const DEFAULT_RADIUS = 5000;
/** POI 搜索默认分页参数 */
const DEFAULT_PAGE_NUM = 1;
const DEFAULT_PAGE_SIZE = 10;
/** webSearchNearby 的默认搜索半径（米） */
const DEFAULT_NEARBY_RADIUS = 1000;

/**
 * 判断高德接口返回体是否成功
 * @param {Object} data 接口返回体
 * @returns {Boolean} 成功返回 true
 */
function isAMapSuccess(data) {
    return data && data.status === '1' && data.infocode === '10000';
}

/**
 * 将参数对象序列化为 URL query string，自动跳过空值（null / undefined / ''）。
 *   所有值经 encodeURIComponent 编码，便于直接拼接到请求地址。
 * @param {Object} params 键值对参数
 * @returns {String} 形如 "a=1&b=2" 的字符串；无有效参数时返回空串
 */
function buildQueryString(params = {}) {
    return Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
}

/**
 * 基于基址、路径与参数对象拼接完整高德请求地址。
 * @param {String} path 接口路径，如 "/v5/place/text"
 * @param {Object} [params] 查询参数，空值会被自动忽略
 * @returns {String} 完整请求 URL
 */
function buildAMapUrl(path, params = {}) {
    const query = buildQueryString(params);
    return query ? `${AMAP_WEB_BASE_URL}${path}?${query}` : `${AMAP_WEB_BASE_URL}${path}`;
}

/**
 * 封装 uni.request 调用高德 Web 服务，统一收敛为 [err, data] 结构。
 *   成功（status=1 且 infocode=10000）：[false, data]
 *   失败（接口错误 / 网络异常）：[true, data | err]
 * @param {String} url 完整请求地址
 * @returns {Promise<Array>} resolve([err, data])
 */
function requestAMap(url) {
    return new Promise(resolve => {
        uni.request({
            header: { 'Content-Type': 'application/text' },
            url,
            success: res => {
                const data = res.data || {};
                resolve([!isAMapSuccess(data), data]);
            },
            fail: err => resolve([true, err]),
        });
    });
}

/**
 * 根据经纬度逆解析详细地址（高德 v3 逆地理编码）。
 *   注意：key 需使用高德「Web 服务」类型 key，普通 JS API key 无逆地理权限。
 * @param {Object} coordinate 坐标对象 {longitude, latitude}
 * @param {String} [key] 高德 Web 服务 key，缺省时取环境变量 VUE_APP_BASE_KEY_WEBMAP
 * @returns {Promise<Array>} resolve([err, regeocode])，regeocode 为逆地理结果对象
 */
export function webGetAddress(coordinate, key = process.env.VUE_APP_BASE_KEY_WEBMAP) {
    const url = buildAMapUrl('/v3/geocode/regeo', {
        location: `${coordinate.longitude},${coordinate.latitude}`,
        key,
        extensions: 'all',
    });
    return new Promise(resolve => {
        uni.request({
            header: { 'Content-Type': 'application/text' },
            url,
            success: res => resolve([false, res.data && res.data.regeocode]),
            fail: err => resolve([true, err]),
        });
    });
}

/**
 * 周边 POI 搜索（高德 v5 周边搜索），按距离排序。
 *   与 searchPOIByKeyword 返回结构保持一致：[err, pois]，便于上层统一处理。
 * @param {String} location 中心点坐标 "经度,纬度"
 * @param {String} keyword 搜索关键字
 * @param {Number} [radius=5000] 搜索半径（米）
 * @param {Number} [pageNum=1] 页码
 * @param {Number} [pageSize=10] 每页数量
 * @returns {Promise<Array>} resolve([err, pois])，pois 始终为数组
 */
export function searchNearbyPOI(location, keyword, radius = DEFAULT_RADIUS, pageNum = DEFAULT_PAGE_NUM, pageSize = DEFAULT_PAGE_SIZE) {
    const url = buildAMapUrl('/v5/place/around', {
        key: process.env.VUE_APP_BASE_KEY_WEBMAP,
        location,
        keywords: keyword,
        radius,
        sortrule: 'distance',
        page_num: pageNum,
        page_size: pageSize,
    });
    return requestAMap(url).then(([err, data]) => [err, data.pois || []]);
}

/**
 * 关键字搜索 POI（高德 v5 文本搜索），与 searchNearbyPOI 返回结构一致。
 * @param {String} keyword 搜索关键字，如"万达广场"、"xx路18号"
 * @param {String} [location] 中心点坐标 "经度,纬度"，用于距离排序；传空则不按距离排序
 * @param {Object} [options] 可选参数
 * @param {String} [options.region] 限定搜索城市（城市中文名 / citycode / adcode），不传则不限城市
 * @param {Boolean} [options.citylimit=false] 是否仅返回 region 指定区域内的数据，需与 region 同时传
 * @param {Number} [options.radius=5000] 搜索半径（米），仅在传了 location 时生效
 * @param {Number} [options.pageNum=1] 页码
 * @param {Number} [options.pageSize=10] 每页数量，最大 25
 * @returns {Promise<Array>} resolve([err, pois])，pois 始终为数组
 */
export function searchPOIByKeyword(keyword, location = '', options = {}) {
    const {
        region = '',
        citylimit = false,
        radius = DEFAULT_RADIUS,
        pageNum = DEFAULT_PAGE_NUM,
        pageSize = DEFAULT_PAGE_SIZE,
    } = options;
    const params = {
        key: process.env.VUE_APP_BASE_KEY_WEBMAP,
        keywords: keyword,
        page_num: pageNum,
        page_size: pageSize,
    };
    if (location) {
        params.location = location;
        params.radius = radius;
        // 距离排序仅在传了中心点时有意义，避免无坐标时下发无效参数
        params.sortrule = 'distance';
    }
    if (region) {
        params.region = region;
        // @by oh-my-zerone 2026-10-13 仅需要严格区域限定时才下发 citylimit，保持既有调用方行为不变
        if (citylimit) params.citylimit = true;
    }
    return requestAMap(buildAMapUrl('/v5/place/text', params)).then(([err, data]) => [err, data.pois || []]);
}

/**
 * 行政区划查询（高德 v3 config/district）。
 *   默认按「中国」+ subdistrict=1 取一级行政区（省级）列表。
 * @param {String} [keywords='中国'] 行政区名称 / adcode，如 "中国"、"浙江省"、"330000"
 * @param {Object} [options] 可选参数
 * @param {Number} [options.subdistrict=1] 下级行政区级数（0-3），1 表示返回下一级
 * @param {Boolean} [options.extensions=false] 是否返回行政区边界坐标
 * @returns {Promise<Array>} resolve([err, districts])，districts 始终为数组
 * @by oh-my-zerone 2026-10-13
 */
export function getDistricts(keywords = '中国', options = {}) {
    const { subdistrict = 1, extensions = false } = options;
    const url = buildAMapUrl('/v3/config/district', {
        key: process.env.VUE_APP_BASE_KEY_WEBMAP,
        keywords,
        subdistrict,
        extensions: extensions ? 'all' : 'base',
    });
    return requestAMap(url).then(([err, data]) => [err, data.districts || []]);
}

/**
 * 根据输入词查询附近地点（高德 v3 文本搜索，extensions=all）。
 *   与上面三个方法不同，本方法返回完整响应体 data（含 status / info / count / pois）。
 * @param {String} [keywords=''] 搜索关键词，如"餐厅"、"酒店"等
 * @param {Object} [coordinate=null] 当前位置坐标 {longitude, latitude}，用于周边限制
 * @param {Object} [options] 可选参数
 * @param {String} [options.key] 高德 Web 服务 key，不传则使用环境变量
 * @param {Number} [options.radius=1000] 搜索半径（米）
 * @param {Number} [options.page=1] 页码
 * @param {Number} [options.pagesize=10] 每页数量，最大 25
 * @returns {Promise<Array>} resolve([err, data])，失败时 err 为 true
 */
export function webSearchNearby(keywords = '', coordinate = null, options = {}) {
    const { key = process.env.VUE_APP_BASE_KEY_WEBMAP, radius = DEFAULT_NEARBY_RADIUS, page = 1, pagesize = 10 } = options;

    const params = {
        keywords,
        key,
        page,
        pagesize,
        extensions: 'all',
    };
    if (coordinate && coordinate.longitude && coordinate.latitude) {
        params.location = `${coordinate.longitude},${coordinate.latitude}`;
        params.radius = radius;
    }
    const url = buildAMapUrl('/v3/place/text', params);

    return new Promise(resolve => {
        uni.request({
            header: { 'Content-Type': 'application/text' },
            url,
            success: res => {
                const data = res.data || {};
                resolve([data.status !== '1', data.status === '1' ? data : data.info || '搜索失败']);
            },
            fail: err => resolve([true, err]),
        });
    });
}

/**
 * 解析驾车路径规划的路段折线为大圆点集
 * 高德 steps[].polyline 形如 "经度,纬度;经度,纬度"，按路段顺序拼接即为完整路线
 * @param {Object} path 高德 route.paths[0]
 * @returns {Array<Object>} [{ longitude, latitude }]；无有效点时为空数组
 * @by oh-my-zerone 2026-10-16
 */
function parseDrivingPolyline(path = {}) {
    const steps = Array.isArray(path.steps) ? path.steps : [];
    const points = [];
    steps.forEach(step => {
        String(step && step.polyline ? step.polyline : '')
            .split(';')
            .forEach(pair => {
                const [lngText, latText] = pair.split(',');
                const longitude = Number(lngText);
                const latitude = Number(latText);
                if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                    points.push({ longitude, latitude });
                }
            });
    });
    return points;
}

/**
 * 驾车路径规划（高德 v3 direction/driving）。
 *   用于页面上展示「里程 / 预计时长」，以及在地图上绘制真实沿路路线（withPolyline）。
 * @by oh-my-zerone 2026-10-16
 * @param {Object} origin 起点坐标 {longitude, latitude}
 * @param {Object} destination 终点坐标 {longitude, latitude}
 * @param {Object} [options] 可选参数
 * @param {Number} [options.strategy=0] 路径规划策略（0 速度优先 / 1 费用优先 / 2 距离优先…）
 * @param {Boolean} [options.withPolyline=false] 是否返回路线点集（需 extensions=all，响应体更大）
 * @returns {Promise<Array>} resolve([err, path])，
 *   path 为 { distance 米, duration 秒, tolls 过路费(元), points 路线点集(仅 withPolyline) }；无可用路线时 err 为 true
 */
export function webDrivingRoute(origin = {}, destination = {}, options = {}) {
    const { strategy = 0, withPolyline = false } = options;
    if (
        !origin.longitude ||
        !origin.latitude ||
        !destination.longitude ||
        !destination.latitude
    ) {
        return Promise.resolve([true, null]);
    }
    const url = buildAMapUrl('/v3/direction/driving', {
        key: process.env.VUE_APP_BASE_KEY_WEBMAP,
        origin: `${origin.longitude},${origin.latitude}`,
        destination: `${destination.longitude},${destination.latitude}`,
        strategy,
        // @by oh-my-zerone 2026-10-16 需要路线点集时才请求 all，避免无谓的响应体膨胀
        extensions: withPolyline ? 'all' : 'base',
    });
    return requestAMap(url).then(([err, data]) => {
        if (err) return [true, null];
        const path = data && data.route && data.route.paths && data.route.paths[0];
        if (!path) return [true, null];
        return [
            false,
            {
                distance: Number(path.distance) || 0,
                duration: Number(path.duration) || 0,
                tolls: Number(path.tolls) || 0,
                strategy: path.strategy || '',
                points: withPolyline ? parseDrivingPolyline(path) : [],
            },
        ];
    });
}
