/**
 * @by oh-my-zerone
 * @description 请求中间件：合并自定义头，支持删除指定头字段（如 Terminal-OS）
 * @param {object} config 请求配置
 * @returns {object} config
 */
function reqWithHeader(config) {
    config.header = { ...config.header, ...config.customHeader };
    if (config.deleteProp) delete config.header[`${config.deleteProp}`]; // 删除头部的某个属性
    return config;
}

export { reqWithHeader };
