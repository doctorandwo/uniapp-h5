/**
 * @by oh-my-zerone
 * @description 请求中间件：兼容数组参数（isArrayQuery 透传场景）
 * @param {object} config 请求配置
 * @returns {object} config
 */
function reqFormatParams(config) {
    const isArrayQuery = config?.data?.isArrayQuery;
    if (isArrayQuery) {
        try {
            config.data = JSON.parse(config.data.isArrayQuery); // 兼容数组参数
        } catch (error) {
            console.log('reqFormatParams==', error);
        }
    }
    return config;
}

export { reqFormatParams };
