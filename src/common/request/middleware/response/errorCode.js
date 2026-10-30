/**
 * @by oh-my-zerone
 * @description 响应中间件：错误码 → 文案映射（纯数据映射，不含业务跳转）。
 * 文案来源为注入的 meta.errCodeMsg，使错误码配置与引擎解耦。
 */

/**
 * 根据错误码生成提示文案，缺省回退到 errCodeMsg.default
 * @param {number|string} code 错误码
 * @param {object} res 响应体（含 msg）
 * @param {object} errCodeMsg 错误码映射表
 * @returns {string} 提示文案
 */
function buildMsg(code, res, errCodeMsg) {
    const defaultMsg = errCodeMsg[code] ? errCodeMsg[code] : errCodeMsg['default'];
    return res.msg ? res.msg : defaultMsg;
}

/**
 * 响应 500 处理
 * @param {object} res
 * @param {Function} callback
 * @param {object} meta 含 errCodeMsg
 * @returns {boolean}
 */
function res500(res, callback, meta) {
    if (res.code === 500) {
        callback({ msg: buildMsg(500, res, meta?.errCodeMsg || {}) }); // 接口错误
        return false;
    }
    return true;
}

/**
 * 响应 400 处理
 * @param {object} res
 * @param {Function} callback
 * @param {object} meta 含 errCodeMsg
 * @returns {boolean}
 */
function res400(res, callback, meta) {
    if (res.code === 400) {
        callback({ msg: buildMsg(400, res, meta?.errCodeMsg || {}) });
        return false;
    }
    return true;
}

/**
 * 响应 404 处理
 * @param {object} res
 * @param {Function} callback
 * @param {object} meta 含 errCodeMsg
 * @returns {boolean}
 */
function res404(res, callback, meta) {
    if (res.code === 404) {
        callback({ msg: buildMsg(404, res, meta?.errCodeMsg || {}) });
        return false;
    }
    return true;
}

/**
 * 其他报错响应（未在白名单内的非成功码）
 * @param {object} res
 * @param {Function} callback
 * @returns {boolean}
 */
function resErre(res, callback) {
    // @by oh-my-zerone 2026-10-20 1 为后端老接口的成功码，不能在此拦成错误（否则老接口全部 reject 且没有任何返回）
    const condition = [200, 500, 401, 403, 404, 1001, 1];
    if (!condition.includes(res.code)) {
        const msg = res.msg ? res.msg : res.code;
        callback({ msg });
        return false;
    }
    return true;
}

export { res500, res400, res404, resErre };
