/**
 * 图片上传相关 API
 * @by oh-my-zerone 2026-07-10
 */
import { request } from '@/common/request';

/** 根据 code 获取图片访问地址 */
export function getUrlByCode(code) {
    return request({
        url: `/assets/upload/getUrlByCode?code=${code}`,
        method: 'post',
    });
}
