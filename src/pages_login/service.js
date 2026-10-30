import { request } from '@/common/request';

/* **************** 微信一键登录 ********************** */
// 凭证code 换 token
export function appletsToken(data) {
    const accountInfo = uni.getAccountInfoSync();
    const appId = accountInfo.miniProgram.appId;
    return request({
        // url: `/auth/wxOneClickLoginNoCreate/${appId}`, // 微信登录，新用户，不会自动注册
        url: `/auth/wxOneClickLogin/${appId}`, // 微信登录，新用户，会自动注册
        method: 'post',
        data: { ...data, appId },
    });
}

// 微信授权登录(验证手机号登录)
export function authPhoneWxLogin(data) {
    const accountInfo = uni.getAccountInfoSync();
    const appId = accountInfo.miniProgram.appId;
    return request({
        // url: `/auth/wxOneClickLoginNoCreate/${appId}`,
        url: `/auth/wxOneClickLogin/${appId}`, // 微信登录，新用户，会自动注册
        method: 'post',
        data: { ...data, appId },
    });
}

/* **************** 手机号密码登录 ********************** */
// 手机号密码登录
export function ApiPwdLogin(data) {
    return request({
        url: '/auth/pwd_login_new',
        method: 'post',
        data,
    });
}

// SM2加密，获取公钥
export function ApiGetPublicKey() {
    return request({
        url: '/auth/getPublicKey',
        method: 'get',
    });
}

/* **************** 短信验证码登录方法 ********************** */
/**
 * 短信验证码登录方法
 * @param {Object} data
 * @returns
 */
export function ApiSmsLogin(data) {
    return request({
        // url: '/auth/sms_login',
        url: '/auth/sms_login_or_register',
        method: 'post',
        data,
    });
}

/**
 * @description: 获取验证码
 * @param {Object} data
 * @property {string} telno 手机号
 * @property {'reset'|"login"|'register'|"restPayPassword"} type 验证码类型
 * @return {Promise<boolean>} 验证码获取是否成功
 */
export function ApiSendSms(data, silent = false) {
    return request({
        url: '/auth/send_sms',
        method: 'post',
        data,
        silent,
    });
}

// 校验短信验证码是否有效
export function ApiCheckCaptcha({ telno, captcha, type }) {
    return request({
        url: '/auth/check_captcha',
        method: 'post',
        data: { telno, captcha, type },
    });
}

/* **************** 注册 ********************** */

/**
 * 校验手机号是否已被注册
 * @param {*} telno
 * @returns
 */
export const ApiCheckPhoneNumber = telno => {
    return request({
        url: '/auth/checkPhoneUnique?telno=' + telno,
        method: 'post',
    });
};

/**
 * 校验用户名是否已被注册
 * @param {*} userName
 * @returns
 */
export const ApiCheckUserName = userName => {
    return request({
        url: '/auth/checkUserNameUnique?userName=' + userName,
        method: 'post',
    });
};

export const ApiRegister = data => {
    return request({
        url: '/auth/registerUser',
        method: 'post',
        data,
    });
};

/* **************** 重置密码 ********************** */

/**
 * 修改密码
 * @param {Object} data
 * @returns
 */
export function ApiSetPassword(data) {
    return request({
        url: '/auth/updatePwdByCaptchaNew',
        method: 'post',
        data,
    });
}
