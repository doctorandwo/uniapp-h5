/**
 * @by oh-my-zerone
 * @description 响应中间件：401 未认证处理（仅做数据映射 + 调用注入的 onTokenExpired 跳转，
 * 跳转逻辑由组合根注入，与数据映射职责分离）。
 * @param {object} res
 * @param {Function} callback
 * @param {object} meta 含 errCodeMsg / hooks.onTokenExpired
 * @returns {boolean}
 */
function res401(res, callback, meta) {
    if (res.code === 401) {
        const errCodeMsg = meta?.errCodeMsg || {};
        const defaultMsg = errCodeMsg[401] ? errCodeMsg[401] : errCodeMsg['default'];
        const msg = res.msg ? res.msg : defaultMsg;
        callback({ msg, silent: true }); // silent：401 由跳转处理，不再额外弹提示
        meta?.hooks?.onTokenExpired?.(res);
        return false;
    }
    return true;
}

export { res401 };
