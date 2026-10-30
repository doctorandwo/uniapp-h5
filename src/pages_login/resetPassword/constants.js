// constants.js —— 修改密码模块唯一常量源
//
// 职责：收敛本模块内散落的魔法值与文案，供 rules / model / services / hook / 视图共同引用。
// 依赖约束（最底层）：零 import，禁止引入 Vue / vuex / request / 任何业务模块，
// 以保证任意层引用本文件都不会产生循环依赖。

/**
 * 短信验证码类型
 * 同时用于 ApiSendSms 的 type 入参与 T_ResetPasswordForm 的 sendType 字段，
 * 二者必须同源，此前分别硬编码在 services.js 与 model.js 中。
 * @type {'reset'}
 */
export const CAPTCHA_TYPE = 'reset';

/**
 * 验证码重发冷却秒数
 * @type {number}
 */
export const COUNTDOWN_SECONDS = 60;

/**
 * 业务成功码白名单
 * 与项目内 success/res.code 约定保持一致（参考 register/setPassword 与 login 系列）
 * @type {Array<number|string>}
 */
export const SUCCESS_CODES = [0, 200, '0', '200'];

/**
 * 提交前需要校验的字段
 * 视图层本地表单与编排层提交校验共用：
 *  - 视图层（ResetPasswordForm.vue）据此初始化本地 form/errors 并做字段校验；
 *  - 编排层（useResetPassword.js）据此对提交载荷做兜底校验。
 * telno 为只读来源（来自 vuex，用户不可编辑），不参与校验
 * @type {string[]}
 */
export const SUBMIT_FIELDS = ['captcha', 'password', 'passwordAgain'];

/**
 * 弹窗标题
 * @type {string}
 */
export const MODAL_TITLE = '提示';

/**
 * 交互提示文案
 * 集中管理，避免各文件硬编码中文串导致改文案时漏改
 * @type {Record<string, string>}
 */
export const TIPS = {
    /** 手机号缺失（vuex userInfo.phonenumber 为空） */
    telnoMissing: '获取手机号失败，请重新登录',
    /** 验证码发送失败 */
    sendCaptchaFail: '发送验证码失败',
    /** 验证码发送成功 */
    sendCaptchaSuccess: '验证码发送成功',
    /** 提交修改密码失败 */
    submitFail: '修改密码失败',
    /** 提交修改密码成功 */
    submitSuccess: '密码修改成功，请重新登录',
};
