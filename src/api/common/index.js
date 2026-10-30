import { request } from '@/common/request';
import store from '@/store/index';

// 获取字典
export function getDicts(dictType) {
    return request({
        url: '/system/dict/data/type/' + dictType,
        method: 'get',
    });
}

export function listByDict(data) {
    return request({
        url: '/system/dict/data/listDataByDict',
        method: 'post',
        data: data,
    });
}

/**
 * 获取栏目下的内容列表
 * @param {{sectionId:string,categoryId:string,siteId:string,}}
 * @returns
 */
export function CommonGetSection({ sectionId, categoryId, siteId, ...rest }) {
    return request({
        url: '/jzcms/content/getContentListBySectionId',
        method: 'post',
        data: {
            sectionId: sectionId,
            categoryId: categoryId,
            siteId: siteId,
            ...rest,
        },
    });
}

/**
 * 获取站点下的内容列表(推荐优先。标签次之)
 * @param {{sectionIds:Array,categoryId:string,siteId:string,}}
 * @returns
 */
export function CommonGetSectionList({ sectionIds, categoryId, siteId, ...rest }) {
    return request({
        url: '/jzcms/content/getCmsContentsBySiteId',
        method: 'post',
        data: {
            sectionIds: sectionIds,
            categoryId: categoryId,
            siteId: siteId,
            ...rest,
        },
    });
}

/**
 * 获取副栏目列表
 * @param {{siteId:string,sectionId:string}}
 * @returns
 */
export function CommonGetSubSection({ siteId, sectionId }) {
    return request({
        url: `/jzcms/content/${siteId}/${sectionId}/subSectionList`,
        method: 'get',
    });
}

/**
 * @description: ocr识别
 */
export function imgRecognitionApi(data) {
    return request({
        url: '/assets/ai/ocr/img/recognition',
        method: 'post',
        data: data,
        timeout: 150000,
    });
}

/**
 * 省份列表
 * @by oh-my-zerone 2026-06-15
 */
export function provinceList() {
    return request({
        url: '/system/province/list',
        method: 'get',
    });
}

/**
 * 城市列表
 * @by oh-my-zerone 2026-06-15
 */
export function cityList(querys) {
    return request({
        url: '/system/city/list',
        method: 'get',
        data: querys,
    });
}

/**
 * 根据字典类型获取字典数据
 * @by oh-my-zerone 2026-06-15
 */
export function getDictByType(type) {
    return request({
        url: `/system/dict/data/dictType/${type}`,
        method: 'get',
    });
}
