/**
 * @by oh-my-zerone 2026-10-27
 * transportCapacity 模块共用接口层（运力详情 / 收藏司机）
 * 详情：GET /assets/driver/recommend/detail/{driverCode}?shipmentCode=
 * 设置常用司机：POST /assets/driver/recommend/commonDriver
 * 收藏列表：GET /assets/driver/recommend/commonDriver/{shipmentCode}
 */

import { request } from '@/common/request';

/**
 * 查询推荐运力司机详情
 * @param {string} driverCode 司机编码（路径变量）
 * @param {string} shipmentCode 货主编码（必填 query）
 * @returns {Promise} request 实例
 */
export function ApiGetDriverRecommendDetail(driverCode, shipmentCode) {
    return request({
        url: `/assets/driver/recommend/detail/${driverCode}`,
        method: 'get',
        data: { shipmentCode },
    });
}

/**
 * 货主设置常用司机（添加 / 取消）
 * @param {{ shipmentCode: string, driverCode: string, type: number }} payload
 *   type: 0=取消, 1=添加
 * @returns {Promise} request 实例
 */
export function ApiSetCommonDriver(payload) {
    return request({
        url: '/assets/driver/recommend/commonDriver',
        method: 'post',
        data: payload,
    });
}

/**
 * 根据货主编码查询收藏（常用）司机列表
 * @param {string} shipmentCode 货主编码（路径变量）
 * @returns {Promise} request 实例，data 为司机数组
 */
export function ApiGetCommonDriverList(shipmentCode) {
    return request({
        url: `/assets/driver/recommend/commonDriver/${shipmentCode}`,
        method: 'get',
    });
}
