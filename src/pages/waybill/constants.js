import { arr2Obj } from '@/common/utils/format.js';

/**
 * @by oh-my-zerone 2026-10-16
 * 超好运运单状态。运输、结算共用 pageTransport，异常单用 isAbnormal 筛选，不传 status。
 */
const statusMap = {
    1: { label: '已接单', value: '1', color: '#0460FB' },
    2: { label: '已装货', value: '2', color: '#0460FB' },
    3: { label: '已卸货', value: '3', color: '#0CAA74' },
    4: { label: '已复核', value: '4', color: '#0460FB' },
    5: { label: '已核算', value: '5', color: '#0460FB' },
    6: { label: '已申请', value: '6', color: '#0460FB' },
    7: { label: '已打款', value: '7', color: '#999999' },
    8: { label: '有异常', value: '8', color: '#E64B4B' },
};

/** 异常单筛选项。请求时只传 isAbnormal=1 */
export const STATUS_ABNORMAL = 'abnormal';

export const STATUS_WAYBILL_TRANS = [statusMap[1], statusMap[2], statusMap[3], { label: '异常单', value: STATUS_ABNORMAL, color: statusMap[8].color }];

export const STATUS_WAYBILL_SETTLEMENT = [statusMap[4], statusMap[5], statusMap[6], statusMap[7]];

export const STATUS_WAYBILL_TRANS_MAP = arr2Obj(STATUS_WAYBILL_TRANS, 'value');

export const STATUS_WAYBILL_SETTLEMENT_MAP = arr2Obj(STATUS_WAYBILL_SETTLEMENT, 'value');

export const STATUS_WAYBILL_MAP = arr2Obj(Object.values(statusMap), 'value');

/** 运输「全部」：已接单、已装货、已卸货 */
export const TRANSPORT_ALL_STATUES = '1,2,3';

/** 结算「全部」：已复核、已核算、已申请、已打款 */
export const SETTLEMENT_ALL_STATUES = '4,5,6,7';

export const stowageStatusList = [
    { label: '吨', value: '0' },
    { label: '方', value: '1' },
    { label: '车', value: '2' },
    { label: '箱', value: '3' },
    { label: '包', value: '4' },
];

export const stowageStatusMap = arr2Obj(stowageStatusList, 'value', 'label');

export const IMG = {
    iconCash: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1786960331285dad625.png',
    iconFilter: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1787016311285803676.png',
    iconMulti: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1787016354851c61551.png',
};
