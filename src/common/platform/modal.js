/**
 * @by oh-my-zerone 2026-09-30
 * @description 跨端 Modal 兼容层（H5 / 微信小程序）。
 *   由原 common/utils/compatible.js 收敛至 platform，统一跨端弹窗出口。
 */

// components
// #ifdef H5
import { modal as showModalH5 } from 'zjz1-h5-ui/packages/z1-modal/function.js';
// #endif

export const showModal = (options = {}) => {
    // #ifdef H5
    showModalH5(options);
    // #endif

    // #ifdef MP-WEIXIN
    const trans = {};
    // options.onConfirm && (trans.success = options.onConfirm);
    options.onClose && (trans.fail = options.onClose);

    uni.showModal({
        ...options,
        ...trans,
        success(res) {
            // res 数据格式 {"errMsg":"showModal:ok","cancel":true,"confirm":false}
            if (res.cancel) {
                console.log('用户点击取消');
                return;
            }
            options.onConfirm && options.onConfirm(res);
        },
    });
    // #endif
};
