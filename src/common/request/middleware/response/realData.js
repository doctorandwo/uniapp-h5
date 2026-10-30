/**
 * @by oh-my-zerone
 * @description 响应中间件：提取响应体中的 data 字段（数据映射，无业务跳转）
 * @param {object} res uni 响应对象
 * @param {Function} callback 改写最终响应体：callback(newRes)
 * @returns {boolean} 始终通过
 */
function resRealData(res, callback) {
    callback(res.data);
    return true;
}

export { resRealData };
