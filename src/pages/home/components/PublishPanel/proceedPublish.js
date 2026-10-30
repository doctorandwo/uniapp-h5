/**
 * 发布链路跳转工具函数：构造 createQuote / selectRoute URL 并跳转。
 * 供 home.PublishPanel 与 success.vue 共用，确保两条入口 URL 规则一致。
 * @by oh-my-zerone 2026-08-31
 */

/**
 * 构造 createQuote 页面 URL，携装卸货地址点。
 * startPoint / endPoint 缺失时各自不带对应查询参数；均缺失则返回无参 URL。
 * @param {object|null|undefined} startPoint 装货地址点
 * @param {object|null|undefined} endPoint 卸货地址点
 * @returns {string} createQuote 路径
 */
export function buildCreateQuoteUrl(startPoint, endPoint) {
    const base = '/pages_quoteCreate/createQuote/index';
    const params = [];
    if (startPoint) {
        params.push(`startPoint=${encodeURIComponent(JSON.stringify(startPoint))}`);
    }
    if (endPoint) {
        params.push(`endPoint=${encodeURIComponent(JSON.stringify(endPoint))}`);
    }
    return params.length ? `${base}?${params.join('&')}` : base;
}

/**
 * 构造发布链路入口页（selectRoute 选点页）URL，可携装卸货地址点。
 * 缺失时各自不带对应查询参数；均缺失则返回无参 URL。
 * @param {object|null|undefined} startPoint 装货地址点
 * @param {object|null|undefined} endPoint 卸货地址点
 * @returns {string} selectRoute 路径
 * @by oh-my-zerone 2026-10-19
 */
export function buildSelectRouteUrl(startPoint, endPoint) {
    const base = '/pages_goodsSource/sourcePublish/selectRoute/index';
    const params = [];
    if (startPoint) {
        params.push(`startPoint=${encodeURIComponent(JSON.stringify(startPoint))}`);
    }
    if (endPoint) {
        params.push(`endPoint=${encodeURIComponent(JSON.stringify(endPoint))}`);
    }
    return params.length ? `${base}?${params.join('&')}` : base;
}

/**
 * 跳转到发布链路入口页 selectRoute（拼 URL + navigateTo）。
 * 发布成功后重置首页地址交由全局事件 'pages/home/index:resetAddress' 驱动。
 * @param {object} options
 * @param {object} [options.startPoint] 装货地址点
 * @param {object} [options.endPoint] 卸货地址点
 */
export function proceedPublish({ startPoint, endPoint } = {}) {
    const url = buildSelectRouteUrl(startPoint, endPoint);
    uni.navigateTo({ url });
}
