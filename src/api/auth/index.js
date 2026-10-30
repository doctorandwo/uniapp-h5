/**
 * 货主认证 API
 * @by oh-my-zerone 2026-06-16
 */
import { request } from '@/common/request';

/** 获取货主详细信息 */
export function getShipmentDetail(code) {
    return request({
        url: `/assets/shipment/getByCode?code=${code}`,
        method: 'get',
    });
}

/** 小程序货主认证提交 */
export function postMiniAuth(data) {
    return request({
        url: '/assets/shipment/mini/auth',
        method: 'post',
        data,
        loading: true,
        loadingTxt: '提交中...',
    });
}

/** OCR */
export function ocrRead(data) {
    return request({
        url: '/assets/upload/ocr',
        method: 'post',
        data,
        ContentType: 'application/x-www-form-urlencoded',
    });
}

/** 身份证 OCR */
export function idCardOcrRead(data) {
    return ocrRead({ type: 'id-card', url: data.url, side: data.side });
}
