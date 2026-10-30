import { request } from '@/common/request/index.js';
import { getAppOrderInfoListMock, getCymMock } from './mock.js';

// UI 调试开关：true 时货源列表走本地 mock，不发真实请求；联调/上线请置为 false
const USE_MOCK = false;

// 查询低空当前货主的货源列表
// export function ApiGetDkOrderInfoList(data) {
//     return request({
//         url: '/transportation/orderInfoSearch/getDkOrderInfoList',
//         method: 'post',
//         data,
//     });
// }

// 货主完成/取消货源
// export function ApiLoadAndUnloadingGoods(data) {
//     return request({
//         url: '/transportation/order/loadAndUnloadingGoods',
//         method: 'post',
//         data,
//     });
// }

// 货量增加-货主货源
export function ApiIncrementDkOrderStowage(data) {
    return request({
        url: '/transportation/order/incrementDkOrderStowage',
        method: 'post',
        data,
    });
}

/** 超好飞接口  **/

// 货源列表
export function ApiGetSourceList(data) {
    if (USE_MOCK) return Promise.resolve(getAppOrderInfoListMock(data));
    return request({
        url: '/transportation/orderInfoSearch/getAppOrderInfoList',
        method: 'get',
        data,
    });
}

// 货源详情
export function ApiGetSourceDetail(code) {
    return request({
        url: `/transportation/orderInfoSearch/getAppOrderDetailBycode/${code}`,
        method: 'get',
    });
}

// 货源码二维码（返回图片 base64，完整 data URL，可直接作为 image src）
export function ApiGetCym(code, query = {}) {
    if (USE_MOCK) return Promise.resolve(getCymMock(code));
    return request({
        url: `/transportation/waybill/app/getCym/${code}`,
        method: 'get',
        data: query
    });
}

// 发布货源
export function ApiPublishSource(data) {
    return request({
        url: '/transportation/order/pubilsh',
        method: 'post',
        data,
    });
}

// 编辑货源
export function ApiModifySource(data) {
    return request({
        url: '/transportation/order/appModifyNotdel',
        method: 'post',
        data,
    });
}

// 删除货源
export function ApiDeleteSource(orderCode) {
    return request({
        url: `/transportation/app/orderInfo/deleteOrder/${orderCode}`,
        method: 'delete',
    });
}

// 上下架货源
export function ApiLoadAndUnloadingGoods(data) {
    return request({
        url: '/transportation/order/loadAndUnloadingGoods',
        method: 'post',
        data,
    });
}
