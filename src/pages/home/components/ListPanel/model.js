/* 需求订单列表查询参数--服务端 */
export const T_DemandOrderList = {
    pageNum: 'number',
    pageSize: 'number',
    /* 服务分类 */
    serviceCategoryCode: data => (data.serviceCategoryCode == 'all' ? void 0 : data.serviceCategoryCode),
    /* 服务项目 */
    serviceItemCode: '?string|serviceItem',
    /* 最小价格 */
    minPrice: data => {
        if (!data.price || data.price.includes('以下')) return '';

        let min;
        if (data.price.includes('以上')) min = data.price.replace('以上', '');
        else min = data.price.split('-')[0];

        return min * 100;
    },
    /* 最大价格 */
    maxPrice: data => {
        if (!data.price || data.price.includes('以上')) return '';

        let max;
        if (data.price.includes('以下')) max = data.price.replace('以下', '');
        else max = data.price.split('-')[1];

        return max * 100;
    },
};

import { QUOTE_MODE_LIST } from '@/pages/home/constants.js';
import { formatNumber } from '@/common/utils/format.js';
import dayjs from 'dayjs';

// 格式化时间
const formatTime = time => {
    if (!time) return '';
    const now = dayjs();
    const diff = now.diff(dayjs(time), 'minute');

    if (diff < 1) return '刚刚';
    if (diff < 60) return `${diff}分钟前`;
    if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
    if (diff < 43200) return `${Math.floor(diff / 1440)}天前`;
    return dayjs(time).format('YYYY-MM-DD');
};

/* 需求卡片视图--服务端 */
export const T_DemandCardView = {
    code: 'string',
    /* 标题 */
    title: 'string|serviceItemName',
    /* 价格 */
    price: data => formatNumber(data.amount / 100),
    /* 标签 */
    tags: ({ quoteMode, serviceCategoryName, serviceCategoryCode }) => {
        const tag1 = { label: serviceCategoryName, value: serviceCategoryCode, dark: true };
        const tag2 = { label: QUOTE_MODE_LIST[quoteMode], value: quoteMode };
        return [tag1, tag2].filter(item => item.label);
    },
    /* 描述 */
    desc: 'string|demandDesc',

    /* 发布人 */
    username: 'string|contactName',
    /* 时间 */
    time: data => formatTime(data.createTime),
    /* 头像 */
    avatar: 'string',
    /* 起点 */
    start: data => {
        return {
            address: data.startPoint,
            date: (data.demandDateExceptYear || '') + ' ' + data.startTime,
        };
    },
    /* 终点 */
    end: data => {
        return {
            address: data.endPoint,
            date: (data.demandDateExceptYear || '') + ' ' + data.endTime,
        };
    },
    /* card类型--有终点是物流配送，否则是其他 */
    // '区域飞行': 'areaFly',一个点,其他
    // '定点飞行': 'pointFly',两个点，物流配送
    cardType: data => (data.flyMode == 'pointFly' ? 'logistics' : 'other'),
    /* 地址 */
    address: data => data.startPoint,
    /* 日期 */
    date: data => {
        if (!data || data.flyMode == 'pointFly') return '';
        const { startTime = '', endTime = '', demandDateExceptYear = '' } = data;
        if (!startTime || !endTime || !demandDateExceptYear) return '';

        const today = dayjs().format('YYYY-MM-DD');
        const st = dayjs(`${today} ${startTime}`);
        const et = dayjs(`${today} ${endTime}`);
        const duration = et.diff(st, 'hour', true).toFixed(1);

        return `${demandDateExceptYear} ${startTime} - ${endTime} 共${duration}小时`;
    },
};
