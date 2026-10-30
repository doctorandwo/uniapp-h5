/**
 * @by oh-my-zerone
 * 常用地址服务（chooseLocation / mapPicker 共享）
 * 从原 pages_quoteCreate/service.js 收敛常用地址相关接口
 */
import { request } from '@/common/request';

/**
 * 获取货主常用地址列表
 * @param {Object} params
 * @returns
 */
export function ApiGetCommonAddressList(params) {
    return request({
        url: '/assets/shipment/address-app/list',
        method: 'get',
        data: params,
    });
}

/**
 * 设置货主常用地址
 * @param {Object} data
 * @returns
 */
export function ApiSetCommonAddress(data) {
    return request({
        url: '/assets/shipment/address-app',
        method: 'post',
        data,
    });
}
