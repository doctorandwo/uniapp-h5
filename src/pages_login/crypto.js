// sm2加密
import smCrypto from 'sm-crypto';
/**
 * 用于加密数据
 * @param {any} msgString - 需加密的数据
 * @param {string} publicKey - 加密公钥
 * @return {string} 加密后的字符串
 */
export function doSM2Encrypt(msgString = '', publicKey = '') {
    console.log('doSM2Encrypt', msgString, publicKey);
    let msg = msgString;
    if (typeof msgString !== 'string') {
        msg = JSON.stringify(msgString);
    }
    let sm2 = smCrypto.sm2;
    // 1 - C1C3C2；	0 - C1C2C3；	默认为1
    let cipherMode = 1; // 特别注意,此处前后端需保持一致
    // const publicKey2 = "04bbfbea94e01445784544b29b9430a7b5309d6c93d0a05df2bfd43497f7f8de20cce0bf934f69e90ea399b372865899506a0abccd23a660dd191480014f2857cf";
    // 加密结果
    let encryptData = sm2.doEncrypt(msg, publicKey, cipherMode);
    // 加密后的密文前需要添加04，后端才能正常解密
    return '04' + encryptData;
}
