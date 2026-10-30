/**
 * @by oh-my-zerone
 * 常用地址辅助（chooseLocation / mapPicker 共享）
 * 职责：
 *   - 保存常用地址（buildCommonAddressPayload / saveCommonAddress）
 *   - 地址模型归一化（常用地址 / 高德 POI / 逆地理结果 -> 列表项）
 *   - 选点类型(start/end) -> 后端地址类型(1/2) 映射
 * 原散落在 chooseLocation 的 adminCode 短码、三处 mapping 已收敛到此，单点维护。
 */
import store from '@/store';
import { toShortProvinceCode, toShortCityCode, toShortDistrictCode } from '@/common/utils/adminCode.js';
import { ApiSetCommonAddress } from './service.js';

/** 选点类型(start/end) -> 后端地址类型(1/2) */
export const POINT_TYPE_TO_ADDRESS_TYPE = { start: 1, end: 2 };

/**
 * 构造保存常用地址的请求体
 * @param {string} alias 地址别名
 * @param {object} poi 选中的 POI / 地址点
 * @param {number} addressType 后端地址类型（1 起点 / 2 终点）
 * @returns {object} 请求体
 */
export function buildCommonAddressPayload(alias, poi, addressType) {
    const userInfo = store.getters.userInfo || {};
    const shipmentInfo = store.getters.shipmentInfo || {};
    const [longitude = '', latitude = ''] = String(poi?.location || '').split(',');

    return {
        addressType,
        addressName: poi?.name || poi?.title || '',
        detail: poi?.address || poi?.subtitle || '',
        longitude,
        latitude,
        provinceCode: toShortProvinceCode(poi?.provinceCode),
        cityCode: toShortCityCode(poi?.cityCode),
        districtCode: toShortDistrictCode(poi?.districtCode),
        province: poi?.province || '',
        city: poi?.city || '',
        district: poi?.district || '',
        shipmentCode: shipmentInfo?.code || '',
        // @by oh-my-zerone 2026-10-16 联系人「填什么存什么」：优先用本次选点采集值，缺省回退账号信息
        contact: poi?.contact || userInfo?.nickName || userInfo?.userName || '',
        contactPhone: poi?.contactPhone || userInfo?.phonenumber || '',
        defaultPut: 0,
        defaultPush: 0,
        collisionRadius: 0,
        bankType: '',
        networkCode: '',
        remark: '',
        commoditySubclassCodes: '',
        commodityCategoryCode: '',
        addressAlias: alias || '',
    };
}

/**
 * 保存常用地址
 * @param {string} alias 地址别名（为空则不保存）
 * @param {object} poi 选中的 POI / 地址点
 * @param {number} addressType 后端地址类型（1 起点 / 2 终点）
 * @returns {Promise}
 */
export async function saveCommonAddress(alias, poi, addressType) {
    const payload = buildCommonAddressPayload(alias, poi, addressType);
    return ApiSetCommonAddress(payload);
}

/**
 * 统一保存常用地址（保存策略：有别名即保存，与地图选点行为一致）
 * @param {string} alias 地址别名（为空则不保存）
 * @param {object} poi 选中的 POI / 地址点
 * @param {number} addressType 后端地址类型（1 起点 / 2 终点）
 * @returns {Promise|void}
 */
export function ensureCommonAddress(alias, poi, addressType) {
    if (!alias) return Promise.resolve();
    return saveCommonAddress(alias, poi, addressType);
}

/**
 * 归一化地址坐标
 * 兼容后端多种坐标结构（地址实体的 location 为 [经度, 纬度] 数组）：
 *   longitude/latitude -> lng/lat -> location 数组 -> "经度,纬度" 字符串
 * @param {object} item 地址对象
 * @returns {string} "经度,纬度"；取不到时返回空串
 * @by oh-my-zerone 2026-10-16
 */
export function resolveAddressLocation(item = {}) {
    const { longitude, latitude, lng, lat, location } = item;
    const isFilled = value => value !== null && value !== undefined && value !== '';
    if (isFilled(longitude) && isFilled(latitude)) return `${longitude},${latitude}`;
    if (isFilled(lng) && isFilled(lat)) return `${lng},${lat}`;
    if (Array.isArray(location)) {
        const [x, y] = location;
        return isFilled(x) && isFilled(y) ? `${x},${y}` : '';
    }
    if (typeof location === 'string' && location.indexOf(',') !== -1) return location;
    return '';
}

/**
 * 常用地址列表项 -> 统一地址模型（含短码与展示字段）
 * @param {object} item 后端常用地址对象
 * @returns {object} 归一化后的列表项
 */
export function parseCommonAddress(item = {}) {
    return {
        ...item,
        isCommon: true,
        name: item.addressName || '',
        address: item.detail || '',
        // @by oh-my-zerone 2026-10-16 常用地址接口坐标为 location:[经度,纬度]，不能按 longitude/latitude 直取（会得到空坐标）
        location: resolveAddressLocation(item),
        title: item.addressName || '',
        subtitle: item.detail || '',
        provinceCode: toShortProvinceCode(item.provinceCode),
        cityCode: toShortCityCode(item.cityCode),
        districtCode: toShortDistrictCode(item.districtCode),
        province: item.provinceName || item.province || '',
        city: item.cityName || item.city || '',
        district: item.districtName || item.district || '',
        addressAlias: item.addressAlias || '',
        contact: item.contact || '',
        contactPhone: item.contactPhone || '',
    };
}

/**
 * 高德 POI -> 统一地址模型
 * @param {object} item 高德 POI 对象
 * @param {string} [adcode=''] 行政区划码（取 item.adcode）
 * @returns {object} 归一化后的列表项
 */
export function parsePoiToAddress(item = {}, adcode = '') {
    const code = adcode || item.adcode || '';
    return {
        ...item,
        isCommon: false,
        location: item.location,
        title: item.name,
        subtitle: item.address,
        provinceCode: toShortProvinceCode(item.pcode),
        cityCode: toShortCityCode(code),
        districtCode: toShortDistrictCode(code),
        province: item.pname || item.province || '',
        city: item.cityname || item.city || '',
        district: item.adname || item.district || '',
    };
}

/**
 * 逆地理结果 POI -> 统一地址模型（地图打点 / 我的位置场景）
 * @param {object} poi 逆地理结果中的 POI
 * @param {string} [adcode=''] 行政区划码（优先用入参，回退 poi.addressComponent.adcode）
 * @param {object} [coordinate={}] 当前经纬度 {longitude, latitude}
 * @returns {object} 归一化后的 pendingPoi
 */
export function buildPendingPoi(poi = {}, adcode = '', coordinate = {}) {
    const { longitude = '', latitude = '' } = coordinate || {};
    const { addressComponent } = poi || {};
    const resolvedAdcode = adcode || addressComponent?.adcode || '';
    return {
        ...poi,
        location: `${longitude},${latitude}`,
        title: poi.name,
        subtitle: poi.address,
        provinceCode: toShortProvinceCode(resolvedAdcode),
        cityCode: toShortCityCode(resolvedAdcode),
        districtCode: toShortDistrictCode(resolvedAdcode),
        province: addressComponent?.province || '',
        city: addressComponent?.city || '',
        district: addressComponent?.district || '',
    };
}
