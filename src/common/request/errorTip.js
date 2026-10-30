/**
 * @by oh-my-zerone
 * @description 错误提示 handler。默认 toast，支持 modal 模式。
 * 可通过 createRequest 的 errorTip 注入替换，实现提示 UI 与引擎解耦。
 */

/**
 * 展示错误提示。默认使用 toast，配置了 modal 则改用弹窗（适用于 toast 最多两行会截断的长文案）
 * @param {string} errMsg 错误信息，为空时不作任何提示
 * @param {boolean|string|object} [modal] 弹窗配置。true：使用默认弹窗；字符串：作为弹窗标题；对象：可透传 uni.showModal 的 title/confirmText/showCancel 等参数
 * @returns {void}
 */
function showErrorTip(errMsg, modal) {
    if (!errMsg) return;
    // 未开启 modal 模式，保持原有的 toast 提示
    if (!modal) {
        setTimeout(() => uni.showToast({ title: errMsg, icon: 'none' }), 30);
        return;
    }
    // modal 模式：默认无取消按钮，仅保留确定
    let modalOption = { content: errMsg, showCancel: false, confirmColor: '#3a65ff' };
    if (typeof modal === 'string') {
        // 字符串作为弹窗标题
        modalOption = { ...modalOption, title: modal };
    } else if (typeof modal === 'object') {
        // 对象形式透传配置，content 缺省时回退为错误信息
        modalOption = { ...modalOption, ...modal, content: modal.content || errMsg };
    }
    setTimeout(() => uni.showModal(modalOption), 30);
}

export { showErrorTip };
