/**
 * @by oh-my-zerone
 * @description 渐进式兼容出口：默认导出改造后的 request（旧 API 不变），并导出 createRequest 工厂。
 * 47 个消费文件与 bootstrap.config.js 无需改动即可平滑切换。
 */
// services
import request, { createRequest } from './http';

export default request;
export { request, createRequest };
