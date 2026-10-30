/**
 * 认证模块工具
 * @by oh-my-zerone 2026-06-24
 */

import { LEADER_TYPE } from '@/common/constants/auth';
import { getUploadHeaders } from '@/common/platform/header';

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

/** 格式化审核通过时间 */
export function formatAuthTime(time) {
    if (!time) return '';
    const dateStr = String(time).split(' ')[0];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[0]}年${parts[1]}月${parts[2]}日`;
}

/** 证件号脱敏展示 */
export function maskIdNumber(num) {
    if (!num) return '';
    if (num.length <= 2) return num;
    return `${num.slice(0, 1)}${'*'.repeat(num.length - 2)}${num.slice(-1)}`;
}

export function normalizeDate(val) {
    if (!val) return '';
    return String(val).split(' ')[0];
}

/** 从详情推断 shipperType（审核中/已通过且无会话选择时使用） */
export function inferLeaderType(detail = {}) {
    if (detail.shipperType === LEADER_TYPE.ENTERPRISE || detail.shipperType === LEADER_TYPE.PERSONAL) {
        return Number(detail.shipperType);
    }
    if (detail.companyName || detail.organizationCodeNo || detail.businessLicenseImg || detail.name) {
        return LEADER_TYPE.ENTERPRISE;
    }
    return LEADER_TYPE.PERSONAL;
}

/** 组装认证提交参数 */
export function buildAuthPayload({ detail = {}, form = {}, shipperType, telphone } = {}) {
    const effectiveRaw = form.identificationEffective ?? detail.identificationEffective;
    return {
        telphone: form.telphone || detail.telphone || telphone || '',
        adminName: form.adminName || detail.adminName || '',
        identificationNumber: form.identificationNumber ?? detail.identificationNumber ?? '',
        identificationImg: form.identificationImg ?? detail.identificationImg ?? '',
        identificationBackImg: form.identificationBackImg ?? detail.identificationBackImg ?? '',
        identificationBeginTime: normalizeDate(form.identificationBeginTime ?? detail.identificationBeginTime ?? ''),
        identificationEndTime: normalizeDate(form.identificationEndTime ?? detail.identificationEndTime ?? ''),
        identificationEffective: Number(effectiveRaw) === 1 ? 1 : 0,
        shipperType: shipperType ?? detail.shipperType ?? LEADER_TYPE.PERSONAL,
        companyName: form.companyName ?? detail.companyName ?? detail.name ?? '',
        organizationCodeNo: form.organizationCodeNo ?? detail.organizationCodeNo ?? '',
        address: form.address ?? detail.address ?? '',
        businessLicenseImg: form.businessLicenseImg ?? detail.businessLicenseImg ?? '',
    };
}

/** 校验身份证表单，silent 为 true 时不弹 toast */
export function validateAuthForm(form, { silent = false } = {}) {
    const toast = title => {
        if (!silent) uni.showToast({ title, icon: 'none' });
    };
    if (!form.identificationImg) {
        toast('请上传身份证正面');
        return false;
    }
    if (!form.identificationBackImg) {
        toast('请上传身份证国徽面');
        return false;
    }
    if (!form.identificationNumber) {
        toast('请输入身份证号');
        return false;
    }
    if (!form.adminName) {
        toast('请输入姓名');
        return false;
    }
    if (!form.identificationBeginTime) {
        toast('请选择生效日期');
        return false;
    }
    if (!form.identificationEffective && !form.identificationEndTime) {
        toast('请选择失效日期');
        return false;
    }
    return true;
}

/** 校验企业信息表单 */
export function validateEnterpriseForm(form, { silent = false } = {}) {
    const toast = title => {
        if (!silent) uni.showToast({ title, icon: 'none' });
    };
    if (!form.companyName) {
        toast('请输入公司名称');
        return false;
    }
    if (!form.organizationCodeNo) {
        toast('请输入统一信用代码');
        return false;
    }
    if (!form.address) {
        toast('请输入住所');
        return false;
    }
    if (!form.businessLicenseImg) {
        toast('请上传营业执照');
        return false;
    }
    return true;
}

/** 从详情提取身份证表单字段 */
export function pickIdFormFromDetail(detail = {}, defaults = {}) {
    return {
        adminName: detail.adminName || defaults.adminName || '',
        telphone: detail.telphone || defaults.telphone || '',
        identificationNumber: detail.identificationNumber || '',
        identificationImg: detail.identificationImg || '',
        identificationBackImg: detail.identificationBackImg || '',
        identificationBeginTime: normalizeDate(detail.identificationBeginTime),
        identificationEndTime: normalizeDate(detail.identificationEndTime),
        identificationEffective: Number(detail.identificationEffective) === 1 ? 1 : 0,
    };
}

/** 从详情提取企业表单字段 */
export function pickEnterpriseFormFromDetail(detail = {}) {
    return {
        companyName: detail.companyName || '',
        organizationCodeNo: detail.organizationCodeNo || '',
        address: detail.address || '',
        businessLicenseImg: detail.businessLicenseImg || '',
    };
}
