/**
 * @by oh-my-zerone 2026-10-16
 * 异常列表 AbnormalListVo → 卡片视图转换
 */

// 异常原因枚举：reson 1~10 → 中文文案
export const RESOLVE_REASON_MAP = {
    1: '接错单',
    2: '装卸磅单异',
    3: '无效运单',
    4: '轨迹异常',
    5: '操作异常',
    6: '其他',
    7: '运单疑似重复',
    8: '装货磅单异常',
    9: '卸货磅单异常',
    10: '自动核验轨迹异常',
};

// 异常标记枚举：isWarning 0=正常 1=异常 2=取消
export const WARNING_MAP = {
    0: 'normal',
    1: 'warning',
    2: 'cancel',
};

/**
 * 将异常运单 vo 转换为卡片展示字段
 * @param {Object} vo 异常列表项 AbnormalListVo
 * @param {string} [vo.waybillAbnormalCode] 异常单号（作为唯一 id）
 * @param {string} [vo.waybillCode] 运单关联单号（兜底 id）
 * @param {string} [vo.loadAddressAlias] 装货地址别名（起点优先）
 * @param {string} [vo.loadFormattedAddress] 装货格式化地址（起点兜底）
 * @param {string} [vo.unloadAddressAlias] 卸货地址别名（终点优先）
 * @param {string} [vo.unloadFormattedAddress] 卸货格式化地址（终点兜底）
 * @param {number} [vo.reson] 异常原因编码 1~10
 * @param {number} [vo.isWarning] 异常标记 0/1/2
 * @param {string} [vo.waybillNo] 运单号（展示用）
 * @returns {Object} 卡片字段 { id, fromCity, toCity, delayText, warningType, reason, waybillNo }
 */
export const parseAbnormalVo2Card = (vo = {}) => {
    const fromCity = vo.loadAddressAlias || vo.loadFormattedAddress || '';
    const toCity = vo.unloadAddressAlias || vo.unloadFormattedAddress || '';
    const reasonText = RESOLVE_REASON_MAP[vo.reson] || '其他';

    // 延迟/关注文案：异常原因 + 运单号
    const delayText = reasonText; /*  || `${reasonText}${vo.waybillNo ? ' · 运单号 ' + vo.waybillNo : ''}` */

    return {
        id: vo.waybillAbnormalCode || vo.waybillCode || '',
        fromCity,
        toCity,
        delayText,
        warningType: WARNING_MAP[vo.isWarning],
        reason: reasonText,
        waybillNo: vo.waybillNo,
    };
};
