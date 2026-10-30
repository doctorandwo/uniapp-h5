/**
 * @by oh-my-zerone 2026-09-30
 * @description 待定归档：原 common/utils/wallet.js（整体）。
 *   computational / isNum / chooseImages 三者全局均无外部引用，钱包上传已由 pages_auth/utils 与 platform 上传链路覆盖，暂存备查。
 */

// const
import { jsFloat } from '@/libs/jsFloatCompute';

// platform
import { getUploadHeaders } from '@/common/platform/header';

/** 金额精度计算 */
export function computational(A1, A2, symbol, digit = 2) {
    let result = 0;
    if (symbol == '+') result = jsFloat.add(A1, A2);
    else if (symbol == '-') result = jsFloat.subtract(A1, A2);
    else if (symbol == '*') result = jsFloat.ride(A1, A2);
    else if (symbol == '/') result = jsFloat.divide(A1, A2);
    else result = A1;
    return Number(result).toFixed(digit);
}

/** 检验是否整数或小数 */
export function isNum(str, title) {
    const regu = /^[0-9]+\.?[0-9]*$/;
    if (!regu.test(str)) {
        uni.showToast({
            title: '请输入正确的' + title,
            icon: 'none',
        });
        throw new Error('数值不是数字');
    }
}

/**
 * 选择图片并上传
 * @param {string} url 上传地址
 */
export function chooseImages(url, count = 1, sizeType, sourceType, size) {
    return new Promise((resolve, reject) => {
        uni.chooseImage({
            count: count,
            sizeType: sizeType || ['original', 'compressed'],
            sourceType: sourceType || ['album', 'camera'],
            success: function (res) {
                if (size) {
                    let flat = false;
                    res.tempFiles.forEach(item => {
                        if (item.size > size) flat = true;
                    });
                    if (flat) {
                        reject('图片不应大于5M');
                        return;
                    }
                }
                uni.showLoading({ mask: true, title: '上传中...' });
                const car_lic = res.tempFilePaths[0];
                const header = getUploadHeaders();
                uni.uploadFile({
                    url: url,
                    filePath: car_lic,
                    name: 'file',
                    header,
                    success: uploadFileRes => {
                        const data = JSON.parse(uploadFileRes.data);
                        resolve(data);
                    },
                    fail: err => reject(err),
                    complete: () => uni.hideLoading(),
                });
            },
            fail: err => reject(err),
        });
    });
}
