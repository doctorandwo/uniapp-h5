/**
 * @by oh-my-zerone 2026-08-21
 * @desc 订阅消息业务操作类型常量（收敛至 platform/subscribe）
 * @file src/common/platform/subscribe/businessOperType.js
 *
 * 设计要点：
 * 1. 唯一集中维护"订阅消息触发的业务操作类型"取值，与埋点上报接口字段
 *    `businessOperType` 一一对应（值即为后端约定的字符串编码，请勿随意修改）。
 * 2. 与 requestSubscribeMessage 中的 SUBSCRIBE_TEMPLATE_IDS 配套使用：
 *    一个真实模板ID 可被多种业务场景共用，本常量负责标识"本次订阅属于哪种业务"。
 * 3. 新增业务场景时：
 *      (1) 在微信公众平台申请模板并在 requestSubscribeMessage 中维护 key；
 *      (2) 在此追加对应 businessOperType；
 *      (3) 在业务调用处同时传入 businessCode / businessOperType。
 *
 * businessCode 取值约定（来自埋点接口文档）：
 *  - 货源相关：传货源 code
 *  - 设备审核：传设备 code
 *  - 申请加入服务商：传 teamCode
 *  - 调度指派：传飞手 code
 */

export const BusinessOperTypeConstant = {
    // ===== 认证审核 =====
    SHIPMENT_EXAMINE: 'shipmentExamine', // 农户认证审核结果通知
    TEAM_EXAMINE: 'teamExamine', // 服务商认证审核结果通知
    DRIVER_EXAMINE: 'driverExamine', // 飞手认证审核结果通知
    VEHICLE_EXAMINE: 'vehicleExamine', // 设备审核结果通知

    // ===== 接单申请 =====
    ORDER_APPLY_REMIND: 'orderApplyRemind', // 接单申请提醒
    ORDER_APPLY_RESULT: 'orderApplyResult', // 接单申请审核结果

    // ===== 飞手加入企业 =====
    DRIVER_JOIN_REMIND: 'driverJoinRemind', // 飞手加入企业申请提醒
    DRIVER_JOIN_RESULT: 'driverJoinResult', // 加入申请审核结果

    // ===== 调度指派 =====
    ASSIGN_RESULT: 'assignResult', // 调度指派结果

    // ===== 货源完成 =====
    GOODS_COMPLETED: 'goodsCompleted', // 货源完成（达量完成）
    GOODS_MANUAL_COMPLETED: 'goodsManualCompleted', // 货源完成（农户手动完成）
};

export default BusinessOperTypeConstant;
