/**
 * @by oh-my-zerone 2026-10-09
 * @desc 订阅消息常量（模板ID、key 集合、上报接口）
 */

// 一次性订阅消息模板ID 键值映射：key 为业务语义键，value 为微信真实模板ID
export const SUBSCRIBE_TEMPLATE_IDS = {
    AUDIT_RESULT: 'TdYNvU9wR-uLTXHG05h_1VdbbXaTV7JOV9jV54pdzhE', // 审核结果通知（我的-认证填写身份信息确认后）
    APPLY_AUDIT_REMINDER: 'FFst4goeIj2vq37AWL8cNrnG2RBQ56orOlTuRZGEGWE', // 申请审核提醒（发布货源）
    SERVICE_COMPLETE: '2RL6qCWfo3fpkXVHK9h4bEgUGMT5usASU8u__UQCoTc', // 服务完成通知（货源完成）
};

// key 集合，O(1) 判定入参是否为已注册 key
export const SUBSCRIBE_KEY_SET = new Set(Object.keys(SUBSCRIBE_TEMPLATE_IDS));

// 订阅消息埋点上报接口
export const SUBSCRIBE_REPORT_URL = '/transportation/wxapplet/subscribe/report';
