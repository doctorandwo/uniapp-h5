/**
 * @by oh-my-zerone 2026-10-19
 * 常用地址管理接口（/assets/shipment/address-app 系列）
 * 列表 / 新增 / 编辑 / 删除统一收口在此，页面只依赖本文件
 */
import { request } from '@/common/request';

/** 接口基地址 */
const BASE_URL = '/assets/shipment/address-app';

/**
 * 获取货主常用地址列表
 * @param {Object} params 查询参数（pageNum / pageSize / addressAlias / addressName ...）
 * @returns {Promise<Object>} TableDataInfo（rows / total）
 */
export function ApiGetAddressList(params) {
    return request({
        url: `${BASE_URL}/list`,
        method: 'get',
        data: params,
    });
}

/**
 * 新增货主常用地址
 * @param {Object} data shipmentAddrInfoInsertBo
 * @returns {Promise<Object>}
 */
export function ApiAddAddress(data) {
    return request({
        url: BASE_URL,
        method: 'post',
        data,
    });
}

/**
 * 编辑货主常用地址
 * @param {Object} data shipmentAddrInfoUpdateBo（含 id）
 * @returns {Promise<Object>}
 */
export function ApiEditAddress(data) {
    return request({
        url: BASE_URL,
        method: 'put',
        data,
    });
}

/**
 * 删除货主常用地址（支持单个或逗号分隔多个 id）
 * @param {string|number} ids 地址主键
 * @returns {Promise<Object>}
 */
export function ApiRemoveAddress(ids) {
    return request({
        url: `${BASE_URL}/${ids}`,
        method: 'delete',
    });
}
