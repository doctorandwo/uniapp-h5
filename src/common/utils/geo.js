function deg2rad(deg) {
    return (deg * Math.PI) / 180;
}

export function calcDistanceKm(lng1, lat1, lng2, lat2) {
    const n1 = Number(lng1);
    const n2 = Number(lat1);
    const n3 = Number(lng2);
    const n4 = Number(lat2);
    if (!isFinite(n1) || !isFinite(n2) || !isFinite(n3) || !isFinite(n4)) {
        return 0;
    }
    const R = 6371;
    const dLat = deg2rad(n4 - n2);
    const dLng = deg2rad(n3 - n1);
    const a = Math.min(1, Math.max(0, Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(n2)) * Math.cos(deg2rad(n4)) * Math.sin(dLng / 2) ** 2));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(3));
}

/**
 * 计算两点间距离，单位米
 * @param {number|string} lng1 - 起点经度
 * @param {number|string} lat1 - 起点纬度
 * @param {number|string} lng2 - 终点经度
 * @param {number|string} lat2 - 终点纬度
 * @returns {number} 距离（米）
 */
export function calcDistanceM(lng1, lat1, lng2, lat2) {
    return calcDistanceKm(lng1, lat1, lng2, lat2) * 1000;
}
