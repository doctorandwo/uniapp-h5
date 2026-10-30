import { request } from '@/common/request/index.js';

/* 需求大厅-需求列表 */
export function ApiDemandOrderList(data) {
    return request({
        url: '/chf/demandOrder/serviceSide/demandOrderList',
        method: 'post',
        data,
    });
}

/* 服务分类 */
export function ApiServiceCategoryList(data) {
    return request({
        url: '/chf/serviceCategory/service/list',
        method: 'post',
        data,
    });
}

/* 业务申报统计 */
export function ApiEsBusinessDeclarationStatistics() {
    return request({
        url: '/chf/esBusinessDeclaration/statistics',
        method: 'get',
    });
}
