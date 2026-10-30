const sm2 = require('sm-crypto').sm2;
// 加密策略，1 - C1C3C2，0 - C1C2C3，默认为1
const encryptMode = 1;

/**
 * 加密数据
 * @param {Object} data 明文数据
 */
export function encryptData(data, publicKeyStr) {
    const encryptData = sm2.doEncrypt(data, publicKeyStr, encryptMode); // 加密结果
    return encryptData;
}
