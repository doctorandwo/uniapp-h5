// model.js —— 修改密码页表单字段 Schema
// 与 register/setPassword/model.js 同源风格：字段描述 map，由 Schema.parse 校验/转换
// 不引用 Vue / vuex；仅依赖公用 crypto 工具与模块常量
import { doSM2Encrypt } from '@/pages_login/crypto';
import { CAPTCHA_TYPE } from './constants';

/**
 * 修改密码表单字段描述
 *  - 'string' / 'string|telno' / 'string|captcha'  表示类型 + 内置规则
 *  - data => ... / () => ...                      表示转换 / 取值函数
 *
 * 唯一调用方：services.js#requestResetPassword
 *   new Schema(T_ResetPasswordForm).parse(RESET_PASSWORD_PAYLOAD)
 *
 * —— 入参契约（由 services 显式构造，不再依赖隐式命名）——
 * @property {string} telno        手机号
 * @property {string} captcha      短信验证码
 * @property {string} password     明文新密码（经 newPwd 转换后为 SM2 密文）
 * @property {string} publicKeyStr SM2 公钥串
 *
 * —— 出参字段 ——
 *  newPwd    由明文 password + publicKeyStr 经 SM2 加密得到
 *  sendType  固定为模块常量 CAPTCHA_TYPE（'reset'），与 services#sendResetCaptcha 同源
 *
 * 密码强度（字母+数字+特殊字符）由 rules.js 承担：schema 仅做形态校验。
 */
export const T_ResetPasswordForm = {
    telno: 'string|telno',
    captcha: 'string|captcha',
    publicKeyStr: 'string',
    newPwd: data => doSM2Encrypt(data.password, data.publicKeyStr),
    sendType: () => CAPTCHA_TYPE,
};
