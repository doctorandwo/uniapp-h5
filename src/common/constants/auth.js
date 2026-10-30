/**
 * 认证模块常量
 * @by oh-my-zerone 2026-06-24
 */

/** 审核状态：0未审核 1审核中 2审核未通过 3审核通过 */
export const AUTH_STATUS = {
    UNREVIEWED: 0,
    REVIEWING: 1,
    REJECTED: 2,
    APPROVED: 3,
};

/** 货主类别：0发货人 1发货企业（对应接口字段 shipperType） */
export const LEADER_TYPE = {
    PERSONAL: 0,
    ENTERPRISE: 1,
};

export const AUTH_STATUS_ALERT = {
    [AUTH_STATUS.UNREVIEWED]: {
        type: 'warning',
        text: '您的账号未认证，请及时认证，以免影响业务使用',
    },
    [AUTH_STATUS.REVIEWING]: {
        type: 'pending',
        text: '您的认证信息审核中，请耐心等待',
    },
    [AUTH_STATUS.REJECTED]: {
        type: 'warning',
        text: '您的认证未通过，请修改后重新提交',
    },
    [AUTH_STATUS.APPROVED]: {
        type: 'success',
        text: '',
    },
};

export const ID_CARD_ROLE = {
    LEGAL: 'legal',
    OWNER: 'owner',
};

export const ID_CARD_ROLE_TITLE = {
    [ID_CARD_ROLE.LEGAL]: '法人信息',
    [ID_CARD_ROLE.OWNER]: '发货人信息',
};

/** 是否需要先选择认证类型 */
export function needSelectLeaderType(authStatus) {
    if (authStatus === undefined || authStatus === null) return true;
    const status = Number(authStatus);
    return status === AUTH_STATUS.UNREVIEWED || status === AUTH_STATUS.REJECTED;
}
