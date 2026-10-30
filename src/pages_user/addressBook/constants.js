/**
 * @by oh-my-zerone 2026-10-19
 * 常用地址管理模块常量
 * 地址类型枚举与 picker 选项集中在此，新增类型只需扩展 ADDRESS_TYPE_OPTIONS / ADDRESS_TYPE_TEXT_MAP
 */

/** 列表分页大小 */
export const PAGE_SIZE = 10;

/** 列表刷新广播事件名：表单页保存 / 列表页删除后通知列表刷新 */
export const ADDRESS_BOOK_REFRESH_EVENT = 'addressBook:refresh';

/** 地址类型枚举：与后端 addressType 保持一致（1 装货 / 2 卸货） */
export const ADDRESS_TYPE = {
    LOAD: 1,
    UNLOAD: 2,
};

/**
 * 地址类型 picker 选项
 * label 用于展示与原生 picker 的 range，value 用于提交
 */
export const ADDRESS_TYPE_OPTIONS = [
    { label: '装货地址', value: ADDRESS_TYPE.LOAD },
    { label: '卸货地址', value: ADDRESS_TYPE.UNLOAD },
];

/** 原生 picker 的 range 只接受字符串数组，由选项派生，保证与取值同源 */
export const ADDRESS_TYPE_LABELS = ADDRESS_TYPE_OPTIONS.map(item => item.label);

/** 地址类型 -> 卡片标签文案 */
export const ADDRESS_TYPE_TEXT_MAP = {
    [ADDRESS_TYPE.LOAD]: '装货',
    [ADDRESS_TYPE.UNLOAD]: '卸货',
};

/**
 * 地址类型 -> 标签文案（未知类型回退为空串，避免展示 undefined）
 * @param {number|string} value 地址类型值
 * @returns {string} 标签文案
 */
export function getAddressTypeText(value) {
    return ADDRESS_TYPE_TEXT_MAP[Number(value)] || '';
}

/**
 * 地址类型值 -> picker 选中索引（未命中时回退第一项）
 * @param {number|string} value 地址类型值
 * @returns {number} picker 索引
 */
export function getAddressTypeIndex(value) {
    const index = ADDRESS_TYPE_OPTIONS.findIndex(item => item.value === Number(value));
    return index === -1 ? 0 : index;
}
