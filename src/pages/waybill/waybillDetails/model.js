/**
 * @by oh-my-zerone 2026-10-17
 * 运单详情页面视图模型（自货主端搬运）
 * 仅做字段兜底与数据结构转换，不承担展示格式化
 */
import { Schema } from '@zerone/toolbox/src/schema';
import { STATUS_WAYBILL_MAP } from '@/pages/waybill/constants.js';

class WaybillDetailSchema extends Schema {
    constructor(t) {
        super(t);
    }
}

/** 列表状态色 -> 摘要标签三态 */
const statusColorModeOf = status => {
    const color = STATUS_WAYBILL_MAP[String(status)]?.color;
    if (color === '#0CAA74') return 'done';
    if (color === '#0460FB') return 'doing';
    return 'pending';
};

// 经纬度数组 [lng, lat] -> { longitude, latitude }
const parseLocation = locArr => {
    if (Array.isArray(locArr) && locArr.length >= 2) {
        return { longitude: locArr[0], latitude: locArr[1] };
    }
    return { longitude: 0, latitude: 0 };
};

// 从附件列表中提取所有图片 URL
const extractVoucherImages = list => {
    if (!Array.isArray(list)) return [];
    const urls = [];
    list.forEach(item => {
        if (Array.isArray(item.attachUrlList)) {
            urls.push(...item.attachUrlList.filter(Boolean));
        } else if (item.attachUrl) {
            urls.push(item.attachUrl);
        }
    });
    return urls;
};

/**
 * @description: 运单详情页面视图模型
 * @param {object} data - 接口返回的 waybill detail
 * @returns {object}
 */
export const T_WaybillDetail = {
    // 运单code
    code: data => data?.waybillCode || '',
    // 运单状态
    status: data => Number(data?.status) || 0,
    // @by oh-my-zerone 2026-10-28 摘要状态标签与列表 STATUS_WAYBILL_MAP 文案/色态对齐
    statusName: data => STATUS_WAYBILL_MAP[String(Number(data?.status))]?.label || '',
    statusColorMode: data => statusColorModeOf(Number(data?.status)),
    // 价格模型
    priceModel: data => data?.priceModel || '',
    // 货品信息
    goodsInfo: data => ({
        goodsType: data?.goodsType || '',
        goodsName: data?.goodsName || '',
        loadWeight: data?.loadWeight ?? 0,
        loadingVouchers: extractVoucherImages(data?.loadWaybillAttachmentList),
        unloadingVouchers: extractVoucherImages(data?.unloadWaybillAttachmentList),
    }),
    orderSource: data => ({
        orderName: data?.orderName || '',//货源名称
        orderCode: data?.orderCode || '',//货源编号
        orderId: data?.orderId || '',//货源id
        platformName: data?.platformName || '',//承接平台
    }),
    // 司机
    driver: data => ({
        name: data?.driverName || '',
        phone: data?.driverTelphone || '',
        licenseNumber: data?.licenseNumber || '',
        score: '5.0',
        goodReviews: 0,
        company: data?.companyName || '',
        authStatus: data?.driverAuthStatus,
        avatar: data?.driverAvatar || '',
        driverUserCode: data?.driverUserCode || '',//司机用户code
        vehicleTypeName: data?.vehicleTypeName || '',//车型名称
    }),
    // 航线信息
    myRoute: data => ({
        start: {
            name: data?.loadAddressName || '',
            address: data?.loadFormattedAddress || '',
            city: data?.loadCityName || data?.loadCity || '',
            district: data?.loadDistrictName || data?.loadDistrict || '',
            location: parseLocation(data?.loadLocation),
        },
        end: {
            name: data?.unloadAddressName || '',
            address: data?.unloadFormattedAddress || '',
            city: data?.unloadCityName || data?.unloadCity || '',
            district: data?.unloadDistrictName || data?.unloadDistrict || '',
            location: parseLocation(data?.unloadLocation),
        },
    }),
    // 运输单详情
    waybillInfo: data => ({
        waybillNo: data?.waybillNo || '',
        receiveTime: data?.receiveTime || '',//接单时间
        status: data?.status || '',//结算状态
        loadAttachmentCodes: data?.loadAttachmentCodes || [],//装货凭证
        unloadAttachmentCodes: data?.unloadAttachmentCodes || [],//卸货凭证
        isAbnormal: data?.isAbnormal || '',//是否异常单
        webAbnormal: data?.webAbnormal || '',//异常原因
    }),
    // 运单概要
    summary: data => ({
        goods: data?.goodTypeName || '',
        weight: data?.status >= 3 ? (data?.unloadWeight ?? 0) : (data?.loadWeight ?? 0),
        stowageStatus: Number(data?.stowageStatus),
        price: data?.freightPrice ?? 0,
        fillTime: data?.loadTime || '',
        signTime: data?.unloadTime || '',
        aircraft: data?.deviceModel || '',
        distance: data?.mileage ?? 0,
        drop: data?.altitude ?? 0,
    }),
    // 地图中心点：默认取起点，起点无坐标时取终点
    center: data => {
        const start = parseLocation(data?.loadLocation);
        const end = parseLocation(data?.unloadLocation);
        return {
            longitude: start.longitude || end.longitude,
            latitude: start.latitude || end.latitude,
        };
    },
};

export const waybillDetailView = data => new WaybillDetailSchema(T_WaybillDetail).parse(data);
