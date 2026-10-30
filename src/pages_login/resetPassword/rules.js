// rules.js —— 修改密码模块表单字段纯函数校验
//
// 定位：模块内最内层的纯规则层，被 hook（编排）与视图（展示）共同引用。
// 依赖约束：零 import，禁止引入 Vue / vuex / request / constants 之外的任何模块。
// 所有函数均为无副作用纯函数，可独立单测。

/**
 * 校验手机号
 * @param {string} telno 手机号
 * @returns {string|undefined} 错误文案；校验通过返回 undefined
 */
export function validateTelno(telno) {
    if (!telno) return '请输入手机号';
    if (!/^1[3-9]\d{9}$/.test(telno)) return '请输入正确的手机号';
}

/**
 * 校验短信验证码
 * @param {string} captcha 验证码
 * @returns {string|undefined} 错误文案；校验通过返回 undefined
 */
export function validateCaptcha(captcha) {
    if (!captcha) return '请输入验证码';
    if (!/^\d{6}$/.test(captcha)) return '验证码为 6 位数字';
}

/**
 * 校验登录密码
 * 规则：6~20 位且包含字母、数字、特殊字符三类（与 PasswordSet.vue 同源）
 * @param {string} password 明文密码
 * @returns {string|undefined} 错误文案；校验通过返回 undefined
 */
export function validatePassword(password) {
    if (!password) return '请输入密码';
    if (password.length < 6 || password.length > 20) return '登录密码必须是 6 到 20 位';
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).*/;
    if (!regex.test(password)) return '密码必须包含字母、数字和特殊字符';
}

/**
 * 校验确认密码
 * @param {string} passwordAgain 确认密码
 * @param {string} password 基准密码（新密码）
 * @returns {string|undefined} 错误文案；校验通过返回 undefined
 */
export function validatePasswordAgain(passwordAgain, password) {
    if (!passwordAgain) return '请再次输入密码';
    if (passwordAgain !== password) return '两次输入的密码不一致';
}

/**
 * 手机号打码（仅展示用）
 * 非 11 位时原样返回，避免异常输入导致展示错乱
 * @param {string} telno 手机号
 * @returns {string} 打码后的手机号，如 138****8888
 */
export function maskTelno(telno) {
    if (!telno || typeof telno !== 'string' || telno.length !== 11) return telno || '';
    return telno.slice(0, 3) + '****' + telno.slice(-4);
}

/**
 * 字段校验器注册表
 *
 * 以「字段名 → (完整 form) => 错误文案」的形式集中暴露，
 * 让编排层按字段名取用即可，无需再写 if/else 分支链；
 * 新增字段时只改本表，编排层零改动。
 *
 * @type {Record<string, (form: Record<string, string>) => string|undefined>}
 */
export const FIELD_VALIDATORS = {
    telno: form => validateTelno(form.telno),
    captcha: form => validateCaptcha(form.captcha),
    password: form => validatePassword(form.password),
    passwordAgain: form => validatePasswordAgain(form.passwordAgain, form.password),
};
