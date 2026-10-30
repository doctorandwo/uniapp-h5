/**
 * @by oh-my-zerone
 * @description 兼容出口：从新的中间件模块统一导出，保持 bootstrap.config.js 零改动。
 * 业务侧如需自定义链路，建议直接引用 @/common/request/middleware。
 */
export * from './middleware/request/index';
export * from './middleware/response/index';
export { showErrorTip } from './errorTip';
