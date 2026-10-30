import { request } from '@/common/request';

// 获取用户详细信息
export function ApiGetUserInfo() {
    return request({ url: '/system/user/getInfo', method: 'get' });
}

// 获取用户认证信息
export function ApiGetShipmentInfo() {
    return request({ url: '/assets/userDetail/detail', method: 'get' });
}

// 绑定cid
export function ApiBindCid(cid) {
    return request({ url: `/imweb/thirdPush/binding/v2/${cid}`, method: 'post' });
}

// 解绑cid
export function ApiUnbindCid(cid) {
    return request({ url: `/imweb/thirdPush/unbinding/v2/${cid}`, method: 'post' });
}
