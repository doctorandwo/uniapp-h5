// useResetPassword.js —— 修改密码模块编排层 hook
//
// 位置说明：本 hook 强依赖本模块的 rules / services / constants，
// 因此与页面同目录、同生命周期，不再放在 src/common/hooks ——
// 避免通用层反向依赖业务页面层（依赖倒置），也符合「页面业务不进全局目录」的约束。
//
// 分层：视图 → 本 hook（编排）→ services（IO）/ rules（纯规则）/ constants（常量）
// 依赖注入：Vue 仅用于 Vue.observable 暴露响应式流程状态，不写任何 UI 分支。
//
// —— 微信小程序跨端约束（重要）——
// 1. 小程序端 props 数据通道会对对象做 JSON 序列化，函数成员会被剥离，
//    因此本 hook 不再把「函数集合 actions」作为 prop 下发给子组件；
//    改为由页面监听子组件 $emit 的 send-captcha / submit 事件后，在本文件内调用 actions。
// 2. 跨组件事件载荷同样只能传可序列化数据，因此表单值由子组件在提交时
//    以事件载荷 submit(values) 显式上抛，不再依赖「父持有表单对象 + 子组件回写」。
import Vue from 'vue';
import { FIELD_VALIDATORS } from './rules';
import { sendResetCaptcha, requestResetPassword } from './services';
import { COUNTDOWN_SECONDS, SUCCESS_CODES, SUBMIT_FIELDS, TIPS, MODAL_TITLE } from './constants';

/**
 * 展示提示弹窗（无取消按钮）
 * 收敛编排层重复的 uni.showModal 调用
 * @param {string} content 提示内容
 * @returns {void}
 */
function alertTip(content) {
    uni.showModal({ title: MODAL_TITLE, content, showCancel: false });
}

/**
 * 判定 useRequest 响应是否为业务成功
 * 约定：网络层报错即失败；响应未携带 code 视为成功；否则需在成功码白名单内
 * @param {Error|null} err 错误对象
 * @param {any} res 响应体
 * @returns {boolean} 是否成功
 */
function isSuccess(err, res) {
    if (err) return false;
    if (!res || typeof res.code === 'undefined') return true;
    return SUCCESS_CODES.includes(res.code);
}

/**
 * 从失败响应中提取展示文案
 * @param {Error|null} err 错误对象
 * @param {any} res 响应体（可能是对象，也可能是拦截器直接抛出的字符串）
 * @param {string} fallback 兜底文案
 * @returns {string} 错误文案
 */
function pickErrorMessage(err, res, fallback) {
    if (typeof res === 'string') return res;
    return (res && res.msg) || (err && err.msg) || fallback;
}

/**
 * 按提交字段清单执行纯规则校验
 * 校验规则由 rules.js 的 FIELD_VALIDATORS 提供，本处不写 if/else 分支
 * @param {Record<string, string>} form 完整表单快照（含 telno / captcha / password / passwordAgain）
 * @returns {boolean} 是否全部通过
 */
function validateForm(form = {}) {
    return SUBMIT_FIELDS.every(field => {
        const validator = FIELD_VALIDATORS[field];
        return validator ? !validator(form) : true;
    });
}

/**
 * 修改密码编排 hook
 * 状态与行为约定：
 *  - state 仅承载「请求 / 倒计时」流程状态（全部为可 JSON 序列化的纯数据，可安全作为 prop 下发）；
 *  - 表单字段值由视图层本地持有，提交时经 submit(values) 入参上抛；
 *  - 不再对外暴露 validate / validateAll / setTelno / reset（对应职责已下沉到视图层纯规则校验）。
 * @param {object} [opts] 配置项
 * @param {() => void} [opts.onSuccess] 提交成功后回调（如清登录态 + 跳登录）
 * @returns {{ state: object, actions: object }} 响应式 state 与可调用的 actions
 */
export function useResetPassword({ onSuccess } = {}) {
    const state = Vue.observable({
        loading: false,
        submitting: false,
        countdown: 0,
    });
    let timer = null;

    /** 停止倒计时并释放定时器 */
    function stopCountdown() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    /** 倒计时每秒递减，归零后自动停表 */
    function tickCountdown() {
        if (state.countdown <= 0) {
            stopCountdown();
            return;
        }
        state.countdown -= 1;
    }

    /** 重启一轮倒计时（重复调用时先停表，避免定时器叠加） */
    function startCountdown() {
        stopCountdown();
        state.countdown = COUNTDOWN_SECONDS;
        timer = setInterval(tickCountdown, 1000);
    }

    /**
     * 发送短信验证码（由页面在收到子组件 send-captcha 事件后调用）
     * 冷却中或请求中不重复触发
     * @param {string} telno 手机号（来自页面 vuex userInfo.phonenumber）
     * @returns {Promise<void>}
     */
    async function sendCaptcha(telno) {
        if (state.countdown > 0 || state.loading) return;
        if (!telno) {
            alertTip(TIPS.telnoMissing);
            return;
        }
        state.loading = true;
        const [err, res] = await sendResetCaptcha(telno);
        state.loading = false;
        if (!isSuccess(err, res)) {
            alertTip(pickErrorMessage(err, res, TIPS.sendCaptchaFail));
            return;
        }
        uni.showToast({ title: TIPS.sendCaptchaSuccess, icon: 'none' });
        startCountdown();
    }

    /**
     * 提交修改密码（由页面在收到子组件 submit 事件后调用）
     * 入参来自视图层提交时的事件载荷；先按提交字段清单做纯规则校验，
     * 成功后回调外层 onSuccess（典型为清登录态 + 跳登录）
     * @param {object} [values] 表单快照
     * @param {string} values.telno 手机号
     * @param {string} values.captcha 短信验证码
     * @param {string} values.password 新密码
     * @param {string} values.passwordAgain 确认新密码（仅参与校验）
     * @returns {Promise<void>}
     */
    async function submit(values = {}) {
        if (state.submitting) return;
        if (!validateForm(values)) return;
        const { telno, captcha, password } = values;
        if (!telno) {
            alertTip(TIPS.telnoMissing);
            return;
        }
        state.submitting = true;
        const [err, res] = await requestResetPassword({ telno, captcha, password });
        state.submitting = false;
        if (!isSuccess(err, res)) {
            alertTip(pickErrorMessage(err, res, TIPS.submitFail));
            return;
        }
        uni.showToast({ title: TIPS.submitSuccess, icon: 'none' });
        typeof onSuccess === 'function' && onSuccess();
    }

    /**
     * 销毁：停止倒计时；由页面 onUnload 调用
     * @returns {void}
     */
    function destroy() {
        stopCountdown();
    }

    return {
        state,
        actions: {
            sendCaptcha,
            submit,
            destroy,
        },
    };
}
