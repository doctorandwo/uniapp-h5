/**
 * @by oh-my-zerone
 * @description 响应中间件：业务成功判定（终止链路的最后一道，命中成功态则 resolve）
 * @param {object} res
 * @param {Function} callback
 * @returns {boolean} 命中成功态返回 true；否则返回 false 交由上游错误提示
 */
function resSuccess(res, callback) {
    // @by oh-my-zerone 2026-10-20 兼容后端两套成功码：新接口 200 / 老接口 1（如 /transportation/waybill/getByOrderCode、loadAndUnloadingGoods）
    if (res.code === 200 || res.code === 1 || res.code == 50002) {
        callback(res);
        return true;
    } else if (res.code === 1001) {
        const result = { code: 1001, data: {} };
        callback(result);
        return true;
    }
    return false;
}

export { resSuccess };
