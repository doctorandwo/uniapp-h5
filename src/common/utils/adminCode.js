/**
 * 将行政区划编码统一为后端要求的短码
 * - 省：2 位
 * - 市：4 位
 * - 区/县：6 位
 */

export function toShortProvinceCode(code) {
    return String(code || '').slice(0, 2);
}

export function toShortCityCode(code) {
    return String(code || '').slice(0, 4);
}

export function toShortDistrictCode(code) {
    return String(code || '').slice(0, 6);
}

export function normalizeAddressCodes(poi) {
    if (!poi) return poi;
    return {
        ...poi,
        provinceCode: toShortProvinceCode(poi.provinceCode),
        cityCode: toShortCityCode(poi.cityCode),
        districtCode: toShortDistrictCode(poi.districtCode),
    };
}
