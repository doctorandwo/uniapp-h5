/**
 * @by oh-my-zerone 2026-10-16
 * 货主端运单列表查询参数。空字段返回 undefined，GET 清洗时会去掉。
 */
export const T_Submit_WaybillList = {
    pageNum: 'number',
    pageSize: 'number',
    /* 单个运单状态 */
    status: data => (data.status === undefined || data.status === null || data.status === '' ? undefined : Number(data.status)),
    /* 多状态，参数名与原生一致 */
    statues: data => data.statues || undefined,
    /* 异常单：1 */
    isAbnormal: data => (data.isAbnormal ? 1 : undefined),
    /* 运单号 */
    waybillNo: data => (data.waybillNo ? String(data.waybillNo).trim() : undefined),
};
