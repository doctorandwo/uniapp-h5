import { request } from '@/common/request/index.js';

/**
 * @by oh-my-zerone 2026-10-16
 * 货主端运单分页列表。运输、结算共用，按 status / statues / isAbnormal 区分。
 */
export function ApiWaybillList(data) {
    return request({
        url: '/transportation/app/waybillInfo/pageTransport',
        method: 'get',
        data,
    });
}

/**
 * 作废运单
 * @param {object} data - { wayBillInCode, cancelReason }
 * @returns
 */
export function ApiInvalidWayBill(data) {
    return request({
        url: '/transportation/waybillOper/invalid',
        method: 'get',
        data,
    });
}

/**
 * 货主订单统计（首页货物流转看板）
 * 响应 data：runningOrderCount 进行中货源数量 / pendingLoadOrderCount 待装货货源数量 / pendingUnloadOrderCount 待卸货货源数量
 * @returns {Promise}
 */
export function ApiGetShipperOrderStatistics() {
    return request({
        url: '/transportation/waybill/app/getShipperOrderStatistics',
        method: 'get',
    });
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
    return request({
        url: '/system/dict/data/type/' + dictType,
        method: 'get',
    });
}
// 根据运单号查询运单详情
export function ApiGetWaybillDetail(waybillCode) {
    return request({
        url: `/transportation/app/waybillInfo/getWaybillInfo/${waybillCode}`,
        method: 'get',
    });
}

/**
 * @by oh-my-zerone 2026-10-19
 * 根据运单 code 查询轨迹时间线
 */
export function ApiGetWaybillTrace(waybillCode) {
    return request({
        url: '/transportation/waybillTrace/getByWayBillCode',
        method: 'get',
        data: { waybillCode },
    });
}
