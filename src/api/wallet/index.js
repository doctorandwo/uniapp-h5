/**
 * 钱包模块 API
 * @by oh-my-zerone 2026-06-15
 */
import { request } from '@/common/request';

/** 货主/个人钱包信息 */
export function getInfoPersonWallet(querys) {
    return request({
        url: '/payment/wallet-app/person/getAllPersonWallet',
        method: 'get',
        data: querys,
    });
}

/** 银行卡列表 */
export function getAllBankcardList(data) {
    return request({
        url: '/payment/wallet-app/person/userBankcardQuery',
        method: 'get',
        data,
    });
}

/** 移除银行卡 */
export function deleteBankcard(id) {
    return request({
        url: `/payment/wallet-app/person/remove/${id}`,
        method: 'DELETE',
    });
}

/** 发送短信验证码 */
export function sendMsg(data) {
    return request({
        url: '/auth/send_sms',
        data,
        method: 'POST',
    });
}

/** 校验验证码 */
export function checkCaptcha(data) {
    return request({
        url: '/auth/check_captcha',
        data,
        method: 'POST',
    });
}

/** 校验支付密码 */
export function getPayword(data) {
    return request({
        url: '/payment/wallet/judgePassword',
        data,
        method: 'POST',
    });
}

/** 设置支付密码（忘记密码） */
export function setPayword(data) {
    return request({
        url: '/payment/wallet-app/person',
        data,
        method: 'PUT',
    });
}

/** 重置支付密码 */
export function resetPayword(data) {
    return request({
        url: '/payment/wallet-app/person',
        data,
        method: 'PUT',
    });
}

/** 申请提现 */
export function apply2draw(data) {
    return request({
        url: '/payment/wallet-app/person/transferApply',
        data,
        method: 'POST',
    });
}

/** 银行卡 OCR */
export function bankcardOcrRead(data) {
    return request({
        url: '/assets/upload/ocr',
        method: 'POST',
        data: { type: 'bankcard', url: data.url, side: data.side },
        ContentType: 'application/x-www-form-urlencoded',
    });
}

/** 添加银行卡 */
export function addBankcard(data) {
    return request({
        url: '/payment/wallet-app/person/insertBankCard',
        data,
        method: 'POST',
        silent: true,
    });
}

/** 获取银行名称和行号的列表 */
export function getBankLineNoList(data) {
    return request({
        url: '/payment/bankCard/bankLineNoList',
        data,
        method: 'POST',
    });
}

/** 平安绑卡二次验证 */
export function secondVerifyBankcard(data) {
    return request({
        url: '/payment/bankCard/pingan/secondVerify',
        data,
        method: 'POST',
        silent: true,
    });
}

/** 平安绑卡验证重发验证码（重新发起申请绑卡） */
export function retryBindBankcard(data) {
    return request({
        url: '/payment/bankCard/pingan/retryBind',
        data,
        method: 'POST',
    });
}

/** 获取绑卡验证重试等待秒数 */
export function getRetryRemainSeconds(data, option = {}) {
    return request({
        url: '/payment/bankCard/pingan/getRetryRemainSeconds',
        method: 'GET',
        data,
        ...option,
    });
}

/** 提现申请列表 */
export function transferApplyList(querys) {
    return request({
        url: '/payment/wallet-app/person/transferApplyList',
        method: 'post',
        data: querys,
    });
}

/** 查询主单下子单提现记录 */
export function transferDetailList(querys, { loading = true } = {}) {
    return request({
        url: '/payment/wallet-app/person/queryTransfer',
        method: 'get',
        data: querys,
        loading,
    });
}

/** 提现记录详情 */
export function transferDetail(code, { loading = true } = {}) {
    return request({
        url: `/payment/wallet-app/person/transferDetail/${code}`,
        method: 'get',
        loading,
    });
}

/** 充值/收支变动记录 */
export function paidRecordList(data) {
    return request({
        url: '/payment/wallet-app/company/PaidRecord',
        method: 'post',
        data,
    });
}

/** 付款记录 */
export function payRecordList(data) {
    return request({
        url: '/payment/wallet-app/company/list',
        method: 'post',
        data,
    });
}
