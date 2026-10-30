/**
 * @by oh-my-zerone 2026-10-17
 * 运单详情 Mock（字段对齐货主端详情接口结构，供页面联调）
 */

/** 价格模型字典 Mock：dictValue -> dictLabel */
export const MOCK_PRICE_MODEL_MAP = {
    1: '按吨计价',
    2: '包车价',
};

/**
 * 构造详情接口 data
 * @param {string} [code] 运单 code，可从路由透传
 * @returns {object}
 */
export function getWaybillDetailMock(code = 'WB202610170001') {
    return {
        code,
        status: 2,
        priceModel: '1',
        goodsType: '建材',
        goodsName: '水泥',
        loadWeight: 0.5,
        unloadWeight: 0.48,
        stowageStatus: 0,
        shipmentPrice: 120,
        freightPrice: 60,
        fillTime: '2026-10-17 09:30:00',
        signTime: '',
        deviceModel: 'DJI FlyCart 30',
        produceName: '大疆',
        mileage: 3200,
        altitude: 85,
        driverName: '张飞手',
        driverPhone: '13800138000',
        teamName: '至简航空服务有限公司',
        driverAuditOrderNumber: 'DR20261001001',
        driverAuthStatus: 3,
        driverAvatar: '',
        deviceMaxWeight: 30,
        deviceMinWeight: 0,
        vehicleAuditOrderNumber: 'VH20261001001',
        vehicleAuthStatus: 3,
        vehicleAppearanceImage: '',
        waybillNo: 'YD202610170088',
        mainOrderNumber: 'HY202610150012',
        orderCreateTime: '2026-10-15 14:20:00',
        trackNumber: '',
        balanceVo: {
            shipperRealPay: 60,
        },
        shipmentInfo: {
            companyName: '示例货主企业',
            adminName: '李货主',
        },
        waybillAddress: {
            loadAddressName: '望京装货地',
            loadFormattedAddress: '北京市朝阳区望京街10号',
            loadLocations: [116.481488, 39.990464],
            unloadAddressName: '酒仙桥卸货地',
            unloadFormattedAddress: '北京市朝阳区酒仙桥路4号',
            unloadLocations: [116.495, 39.975],
        },
        loadWaybillAttachmentList: [
            {
                attachUrlList: ['https://zjz1-store.obs.cn-north-4.myhuaweicloud.com/static/chydk_owner/pages/waybill/icon-avatar.png'],
            },
        ],
        unloadWaybillAttachmentList: [],
    };
}
