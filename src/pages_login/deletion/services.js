import { request } from '@/common/request';

/**
 * 注销申请审核状态
 * 与 /driver/cancel/getCurrentApply 的 data.status 保持一致
 */
export const CANCEL_APPLY_STATUS = {
    PENDING: 0, // 待审核
    PASSED: 1, // 审核通过
    REJECTED: 2, // 审核不通过
};

/** 获取当前用户最新注销申请（用户未发起过注销时，返回的 data 为 null） */
export function ApiGetCurrentApply(data = {}) {
    return request({ url: '/assets/driver/cancel/getCurrentApply', method: 'get', data });
}

/** 校验是否允许注销（data.directDeleted=true 表示无需审批，直接注销账号） */
// @by oh-my-zerone
export function ApiCheckDelete(data = {}) {
    return request({ url: '/assets/todo/checkDelete', method: 'get', data });
}

/** 发起注销申请 */
export function ApiAddCancelApply(data = {}) {
    return request({ url: '/assets/driver/cancel/add', method: 'post', data });
}

/** 获取注销申请失败（审核不通过）原因 */
export function ApiGetCancelFailed(data = {}) {
    return request({ url: '/assets/driver/cancel/getFailed', method: 'get', data });
}
