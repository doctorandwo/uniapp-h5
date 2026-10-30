import { request } from '@/common/request/index.js';

/**
 * 企业钱包信息
 * 返回：账户总额(amount)、冻结金额(freezeAmount)，可用余额 = amount - freezeAmount
 * @param {object} [querys] 查询参数
 * @returns {Promise<{amount:number, freezeAmount:number}>}
 */
export function getInfoCompanyWallet(querys) {
    return request({
        url: '/payment/wallet-app/company/getInfoCompanyWallet',
        method: 'get',
        data: querys,
    });
}

/**
 * 待打款信息-统计（运单结算统计）
 * 返回：运单数量(waybillCount)、货主实付运费金额(shipperRealPay)
 * 用于「个人中心」账户卡片底部提示：有 a 笔费用待支付 b 元
 * @param {object} [querys] 查询参数
 * @returns {Promise<{waybillCount:number, shipperRealPay:number}>}
 */
export function getWaybillSettlementStatistical(querys) {
    return request({
        url: '/transportation/waybillSettlement/statistical',
        method: 'get',
        data: querys,
    });
}

/**
 * 货主APP我的页面统计信息
 * 返回：地址数量(addressCount)、收藏运力数量(favoriteCapacityCount)、
 *       待签合同数量(contractCount)、理赔投诉数量(claimComplaintCount)
 * 用于「个人中心」便捷菜单的数量角标
 * @param {object} [querys] 查询参数
 * @returns {Promise<{addressCount:number, favoriteCapacityCount:number, contractCount:number, claimComplaintCount:number}>}
 */
export function getMyStatistics(querys) {
    return request({
        url: '/assets/shipment/app/my/statistics',
        method: 'get',
        data: querys,
    });
}
