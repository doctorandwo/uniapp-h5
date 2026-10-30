import { request } from '@/common/request/index.js';
import { CommonGetSection, CommonGetSectionList, CommonGetSubSection } from '@/api/common/index.js';
import Vue from 'vue';
const { $global } = Vue.prototype;
import { ApiGetSubSectionListMock, ApiGetNewsListMock } from './mockNews';

/**
 * 获取banner
 * @param {object} data
 * @returns
 */
export function ApiGetBannerList(data = {}) {
    return CommonGetSection({
        sectionId: 19,
        siteId: $global.siteId,
        ...data,
    });
}

/**
 * 获取副栏目列表
 * @param {Array} sectionIds
 * @returns {Promise<Array>}
 */
export function ApiGetSubSectionList(sectionIds) {
    // return Promise.all([Promise.resolve(ApiGetSubSectionListMock)]);
    const siteId = $global.siteId;
    const promiseArr = sectionIds.map(sectionId => CommonGetSubSection({ siteId, sectionId }));

    return Promise.all(promiseArr);
}

/**
 * 获取新闻（包含平台和行业）和政策列表--首页用
 * @param {Array} sectionIds
 * @returns {Promise<Array>}
 */
export async function ApiGetNewsList({ sectionIds, ...rest }) {
    // return Promise.resolve(sectionIds == '42' ? ApiGetNewsListMock : { data: [] });
    return CommonGetSectionList({ sectionIds, siteId: $global.siteId, ...rest });
}

// 实时详情列表
export function ApiDynamicsList() {
    return CommonGetSection({ sectionId: 111, siteId: $global.siteId });
}

// 获取最新任务
export function ApiGetLatestTask() {
    return request({
        url: '/chf/demandOrder/serviceSide/latestOrderOrTask',
        method: 'get',
    });
}
