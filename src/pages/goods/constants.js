import { arr2Obj } from '@/common/utils/format.js';
export const stowageStatusList = [
    { label: '吨', value: '0' },
    { label: '方', value: '1' },
    { label: '车', value: '2' },
];

export const stowageStatusMap = arr2Obj(stowageStatusList, 'value', 'label');

/** @deprecated 旧执行状态，卡片底栏已改用 info.status（orderStatus） */
export const executionStatus = [
    { label: '待接单', value: 'TO_BE_RECEIVE' },
    { label: '已接单', value: 'RECEIVE' },
    { label: '运输中', value: 'EXECUTING' },
    { label: '已完成', value: 'COMPLETED' },
    { label: '已取消', value: 'CANCELED' },
];
export const executionStatusMap = arr2Obj(executionStatus, 'value', 'label');

/**
 * 货源单状态 info.status
 * 0 已发布/上架 · 1 已下架 · 2 未发布 · 3 已完成
 */
export const orderStatusList = [
    { label: '已发布', value: '0' },
    { label: '已下架', value: '1' },
    { label: '未发布', value: '2' },
    { label: '已完成', value: '3' },
];
export const orderStatusMap = arr2Obj(orderStatusList, 'value', 'label');
export const ORDER_STATUS = {
    PUBLISHED: '0',
    OFF_SHELF: '1',
    UNPUBLISHED: '2',
    COMPLETED: '3',
};

/** 计费方式：运费规则项编码（redisAddressList[].redisOrderFreightVoList[].ruleItemCode） */
export const priceTypeRuleItemCode = '19';

/** 计费方式列表：ruleValue → 文案 */
export const priceTypeList = [
    { label: '卸货量估算', value: '1' },
    { label: '装货量估算', value: '2' },
    { label: '装卸货最小数量估算', value: '3' },
    { label: '装卸货最大数量估算', value: '4' },
];
export const priceTypeMap = arr2Obj(priceTypeList, 'value', 'label');
