import { request } from '@/common/request/index.js';
import { getAbnormalListMock } from './mock.js';

// 查询低空当前货主的货源列表
// export function ApiGetDkOrderInfoList(data) {
//     return request({
//         url: '/transportation/orderInfoSearch/getDkOrderInfoList',
//         method: 'post',
//         data,
//     });
// }

export function ApiGetSourceList(data) {
    return request({
        url: '/transportation/orderInfoSearch/getAppOrderInfoList',
        method: 'get',
        data,
    });
}

// 查询推荐运力列表（司机维度）
export function ApiPageRecommendedDispatcherList(data) {
    return request({
        url: '/assets/driver/recommend/list',
        method: 'post',
        data,
    });
}

// 查询货主常用路线（取第一条路线的装卸货城市编码，作为推荐列表筛选条件）
export function ApiGetCommonRoute(shipmentCode) {
    return request({
        url: `/assets/driver/recommend/commonRoute/${shipmentCode}`,
        method: 'get',
    });
}

// 查询异常列表（首页「需关注」）
export function ApiSelectAbnormalList(data = {}) {
    // Mock：模拟返回分页数据（联调时切换为下方真实请求）
    return getAbnormalListMock(data);
    return request({
        url: '/transportation/waybillAbnormal/selectAbnormalList',
        method: 'get',
        data,
    });
}
