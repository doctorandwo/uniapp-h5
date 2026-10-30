/**
 * @by oh-my-zerone 2026-10-19
 * 常用地址管理数据模型
 * 职责：列表项 -> 卡片模型、记录 -> 表单、表单 -> 新增/编辑请求体、表单校验
 */
import store from '@/store';
import { toShortProvinceCode, toShortCityCode, toShortDistrictCode } from '@/common/utils/adminCode.js';
import { resolveAddressLocation } from '@/pages_common/chooseLocation/commonAddressHelper.js';

// const
import { getAddressTypeText, ADDRESS_TYPE } from './constants.js';

/** 手机号校验规则 */
const PHONE_REG = /^1[3-9]\d{9}$/;

/**
 * 拼接详细地址回退文案：省 + 市 + 区 + 地址名称
 * @param {Object} item 后端地址记录
 * @returns {string} 拼接后的详细地址
 */
function buildDetailFallback(item = {}) {
    const province = item.provinceName || item.province || '';
    const city = item.cityName || item.city || '';
    const district = item.districtName || item.district || '';
    return [province, city, district, item.addressName || ''].filter(Boolean).join('');
}

/**
 * 后端地址记录 -> 列表卡片模型（纯数据，可安全作为 props 跨端下发）
 * @param {Object} item 后端地址记录
 * @returns {Object} 卡片模型
 */
export function parseAddressToCard(item = {}) {
    const location = resolveAddressLocation(item);
    const [longitude = '', latitude = ''] = String(location).split(',');
    return {
        id: item.id,
        addressAlias: item.addressAlias || '',
        addressName: item.addressName || '',
        detail: item.detail || '',
        // 详细地址展示：优先 formattedAddress，为空时回退 省+市+区+addressName
        detailText: item.formattedAddress || buildDetailFallback(item),
        contact: item.contact || '',
        contactPhone: item.contactPhone || '',
        addressType: Number(item.addressType) || ADDRESS_TYPE.LOAD,
        addressTypeText: getAddressTypeText(item.addressType),
        province: item.provinceName || item.province || '',
        city: item.cityName || item.city || '',
        district: item.districtName || item.district || '',
        provinceCode: item.provinceCode || '',
        cityCode: item.cityCode || '',
        districtCode: item.districtCode || '',
        longitude,
        latitude,
        status: Number(item.status) || 0,
    };
}

/**
 * 卡片/记录 -> 表单模型（编辑回填）
 * @param {Object} record 卡片模型或后端记录
 * @returns {Object} 表单模型
 */
export function parseCardToForm(record = {}) {
    return {
        id: Number(record.id) || 0,
        addressName: record.addressName || '',
        detail: record.detail || '',
        addressAlias: record.addressAlias || '',
        contact: record.contact || '',
        contactPhone: record.contactPhone || '',
        addressType: Number(record.addressType) || ADDRESS_TYPE.LOAD,
        province: record.province || '',
        city: record.city || '',
        district: record.district || '',
        provinceCode: record.provinceCode || '',
        cityCode: record.cityCode || '',
        districtCode: record.districtCode || '',
        longitude: record.longitude || '',
        latitude: record.latitude || '',
        status: Number(record.status) || 0,
    };
}

/**
 * 构造空表单（新增模式的初始值）
 * @returns {Object} 表单模型
 */
export function createEmptyForm() {
    return parseCardToForm({});
}

/**
 * 表单 -> 公共字段（新增 / 编辑共用）
 * @param {Object} form 表单模型
 * @returns {Object} 请求体公共部分
 */
function buildBasePayload(form = {}) {
    const shipmentInfo = store.getters.shipmentInfo || {};
    return {
        addressType: Number(form.addressType) || ADDRESS_TYPE.LOAD,
        addressName: form.addressName || '',
        detail: form.detail || '',
        longitude: form.longitude || '',
        latitude: form.latitude || '',
        provinceCode: toShortProvinceCode(form.provinceCode),
        cityCode: toShortCityCode(form.cityCode),
        districtCode: toShortDistrictCode(form.districtCode),
        province: form.province || '',
        city: form.city || '',
        district: form.district || '',
        shipmentCode: shipmentInfo.code || '',
        contact: form.contact || '',
        contactPhone: form.contactPhone || '',
        addressAlias: form.addressAlias || '',
        defaultPut: 0,
        defaultPush: 0,
        collisionRadius: 0,
    };
}

/**
 * 表单 -> 新增请求体
 * @param {Object} form 表单模型
 * @returns {Object} shipmentAddrInfoInsertBo
 */
export function buildCreatePayload(form = {}) {
    return buildBasePayload(form);
}

/**
 * 表单 -> 编辑请求体（带 id 与状态）
 * @param {Object} form 表单模型
 * @returns {Object} shipmentAddrInfoUpdateBo
 */
export function buildUpdatePayload(form = {}) {
    return {
        ...buildBasePayload(form),
        id: Number(form.id) || 0,
        // 沿用原记录状态，缺省按启用提交，避免编辑把地址置为禁用
        status: Number(form.status) || 1,
    };
}

/**
 * 表单校验：必填与手机号格式
 * @param {Object} form 表单模型
 * @returns {{ok: boolean, message: string}} 校验结果，ok 为 true 时 message 为空串
 */
export function validateForm(form = {}) {
    if (!String(form.addressName || '').trim()) return { ok: false, message: '请选择地址' };
    if (!String(form.addressAlias || '').trim()) return { ok: false, message: '请输入地址别名' };
    if (!String(form.contact || '').trim()) return { ok: false, message: '请输入联系人' };
    const phone = String(form.contactPhone || '').trim();
    if (!phone) return { ok: false, message: '请输入联系电话' };
    if (!PHONE_REG.test(phone)) return { ok: false, message: '请输入正确的手机号' };
    return { ok: true, message: '' };
}
