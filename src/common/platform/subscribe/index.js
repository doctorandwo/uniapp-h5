/**
 * @by oh-my-zerone 2026-10-09
 * @desc 微信一次性订阅消息封装（变量见 ./constants.js）
 *
 * 调用方可传"真实模板ID"或"已注册业务 key"，函数自动识别并解析。
 * 仅微信小程序（MP-WEIXIN）生效；其他端直接 reject。
 * 单次最多订阅 3 条模板；订阅成功后对"已接受"模板逐条上报埋点。
 */

// const
import { SUBSCRIBE_TEMPLATE_IDS, SUBSCRIBE_KEY_SET, SUBSCRIBE_REPORT_URL } from './constants';

// services
import { request } from '@/common/request/index';

/**
 * 将业务 key 解析为真实模板ID；未命中则按原始值透传。
 *
 * @param {string} key 业务 key 或 微信真实模板ID
 * @returns {string} 真实模板ID
 */
function resolveKey(key) {
    return SUBSCRIBE_KEY_SET.has(key) ? SUBSCRIBE_TEMPLATE_IDS[key] : key;
}

/**
 * 将入参解析为真实模板ID数组（已去空）。
 *
 * @param {string|string[]} input 模板ID或已注册key，支持单值或数组
 * @returns {string[]} 解析后的真实模板ID数组
 */
function resolveTmplIds(input) {
    if (input == null || input === '') return [];
    const list = Array.isArray(input) ? input : [input];
    return list.filter(v => v != null && v !== '').map(v => resolveKey(String(v)));
}

/**
 * 上报单条订阅成功埋点；失败仅告警，不抛出，避免影响主流程。
 *
 * @param {Object} params 埋点参数
 * @param {string} params.businessCode 业务 code
 * @param {string} params.templateId 微信真实模板ID
 * @param {string} params.businessOperType 业务操作类型
 * @returns {Promise<void>}
 */
async function reportSubscribeOnce({ businessCode, templateId, businessOperType }) {
    try {
        await request({
            url: SUBSCRIBE_REPORT_URL,
            method: 'post',
            data: { businessCode, templateId, businessOperType },
            silent: true,
        });
    } catch (err) {
        console.warn('[subscribe] 上报埋点失败', { businessCode, templateId, businessOperType }, err);
    }
}

/**
 * 根据 extra 埋点配置构建"按真实 templateId 索引"的上报表。
 * 优先级：businessMap[key] > 共享 businessCode + businessOperType。
 *
 * @param {string[]} tmplIds 已解析的真实模板ID
 * @param {Object} reportConfig 埋点字段（businessCode / businessOperType / businessMap）
 * @returns {Map<string, { businessCode, businessOperType }>}
 */
function buildReportIndex(tmplIds, reportConfig) {
    const index = new Map();
    if (!reportConfig) return index;

    const hasSharedType = reportConfig.businessOperType != null && reportConfig.businessOperType !== '';
    if (hasSharedType) {
        const shared = {
            businessCode: reportConfig?.businessCode || void 0,
            businessOperType: reportConfig.businessOperType,
        };
        tmplIds.forEach(id => index.set(id, shared));
    } else {
        console.warn('[subscribe] extra 的 businessOperType 必须提供，否则忽略共享埋点配置');
    }

    if (reportConfig.businessMap && typeof reportConfig.businessMap === 'object') {
        Object.keys(reportConfig.businessMap).forEach(key => {
            const entry = reportConfig.businessMap[key];
            if (!entry) return;
            const hasType = entry.businessOperType != null && entry.businessOperType !== '';
            if (hasType) {
                index.set(resolveKey(key), {
                    businessCode: entry?.businessCode || void 0,
                    businessOperType: entry.businessOperType,
                });
            } else {
                console.warn('[subscribe] businessMap[' + key + '] 埋点参数不完整（businessOperType 必须提供）');
            }
        });
    }

    return index;
}

/**
 * 解析微信 success 回调，对 status === 'accept' 的模板按上报表逐条触发埋点。
 *
 * @param {Object} res 微信 success 回调结果
 * @param {Map<string, { businessCode, businessOperType }>} reportIndex 上报表
 * @returns {void}
 */
function dispatchSubscribeReports(res, reportIndex) {
    if (!res || typeof res !== 'object' || !reportIndex || reportIndex.size === 0) return;
    Object.keys(res).forEach(templateId => {
        if (templateId === 'errMsg') return;
        if (res[templateId] !== 'accept') return;
        const entry = reportIndex.get(templateId);
        if (!entry) return;
        reportSubscribeOnce({
            businessCode: entry?.businessCode || void 0,
            templateId,
            businessOperType: entry.businessOperType,
        });
    });
}

/**
 * 判断给定 key 是否已在 SUBSCRIBE_TEMPLATE_IDS 中注册。
 *
 * @param {string} key 业务键
 * @returns {boolean}
 */
export function hasSubscribeTmplKey(key) {
    return SUBSCRIBE_KEY_SET.has(key);
}

/**
 * 根据业务 key 获取对应的真实模板ID。
 *
 * @param {string} key 业务键
 * @returns {string|undefined}
 */
export function getSubscribeTmplId(key) {
    return SUBSCRIBE_TEMPLATE_IDS[key];
}

/**
 * 微信一次性订阅消息。
 *
 * @param {string|string[]} tmplIdsOrKeys 模板 key 或 真实模板ID（最多 3 个）
 * @param {Object} [extra] 扩展参数：businessCode / businessOperType / businessMap 为埋点配置，
 *                         其余 success / fail / complete 透传给 uni
 * @returns {Promise<Object>} 成功 resolve(uni success 结果)，失败 reject(uni fail 或业务校验错误)
 */
export function requestSubscribeMessage(tmplIdsOrKeys, extra = {}) {
    return new Promise((resolve, reject) => {
        const tmplIds = resolveTmplIds(tmplIdsOrKeys);

        if (tmplIds.length === 0) {
            const err = new Error('[subscribe] 模板ID不能为空');
            extra.fail && extra.fail({ errMsg: err.message });
            return reject(err);
        }
        if (tmplIds.length > 3) {
            const err = new Error('[subscribe] 单次最多订阅 3 条模板消息');
            extra.fail && extra.fail({ errMsg: err.message });
            return reject(err);
        }

        // 拆出本封装的埋点字段，避免污染 uni 透传对象
        const { businessCode = '', businessOperType = '', businessMap = '', ...uniExtra } = extra;
        const reportIndex = buildReportIndex(tmplIds, { businessCode, businessOperType, businessMap });
        // #ifdef MP-WEIXIN
        uni.requestSubscribeMessage({
            ...uniExtra,
            tmplIds,
            success: res => {
                uniExtra.success && uniExtra.success(res);
                dispatchSubscribeReports(res, reportIndex);
                resolve(res);
            },
            fail: err => {
                uniExtra.fail && uniExtra.fail(err);
                reject(err);
            },
        });
        // #endif

        // #ifndef MP-WEIXIN
        const err = new Error('[subscribe] 仅微信小程序支持订阅消息');
        uniExtra.fail && uniExtra.fail({ errMsg: err.message });
        resolve(err);
        // #endif
    });
}

export default requestSubscribeMessage;
