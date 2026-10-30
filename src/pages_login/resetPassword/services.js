// services.js —— 修改密码模块 IO 服务层
//
// 职责边界：只做「请求发起 + 响应整形」，不持有 UI 反馈（弹窗/Toast）与业务判定，
// 这部分统一上浮到编排层 useResetPassword.js，保证 service 可被复用与单测。
// 依赖约束：禁止引入 Vue / vuex；仅通过 useRequest 走 http 链路。
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { Schema } from '@zerone/toolbox/src/schema';
import { ApiSendSms, ApiGetPublicKey, ApiSetPassword } from '@/pages_login/service';
import { T_ResetPasswordForm } from './model';
import { CAPTCHA_TYPE } from './constants';

/**
 * 发送修改密码的短信验证码
 * @param {string} telno 手机号
 * @returns {Promise<[Error|null, any]>} useRequest 元组风格
 */
export async function sendResetCaptcha(telno) {
    return useRequest(ApiSendSms, { telno, type: CAPTCHA_TYPE }, /* silent */ true);
}

/**
 * 获取 SM2 公钥
 * @returns {Promise<[Error|null, { publicKeyStr: string }|null]>} 失败时二元组第二项恒为 null
 */
export async function fetchPublicKey() {
    const [err, res] = await useRequest(ApiGetPublicKey);
    if (err) return [err, null];
    // 与 register/setPassword/PasswordSet.vue 同源：res.data 即公钥串
    return [null, { publicKeyStr: (res && res.data) || '' }];
}

/**
 * 提交修改密码
 * 内部依次：fetchPublicKey → Schema.parse（加密密码 + 拼 sendType）→ ApiSetPassword
 * @param {{telno: string, captcha: string, password: string}} payload 明文密码
 * @returns {Promise<[Error|null, any]>} useRequest 元组风格
 */
export async function requestResetPassword({ telno, captcha, password }) {
    // 先整体取值再判空：对象默认值只在 undefined 时生效，
    // 直接解构 [err, { publicKeyStr } = {}] 会在返回 null 时抛 TypeError
    const [pkErr, pk] = await fetchPublicKey();
    if (pkErr || !pk) return [pkErr, null];

    const data = new Schema(T_ResetPasswordForm).parse({
        telno,
        captcha,
        password,
        publicKeyStr: pk.publicKeyStr,
    });
    return useRequest(ApiSetPassword, data);
}
