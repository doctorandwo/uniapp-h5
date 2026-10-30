/**
 * 脱敏工具
 * @by oh-my-zerone 2026-06-15
 */

const encryFunction = {
    typeMap: {
        bankCard: 'bankCardEncry',
        idCard: 'idCardEncry',
        name: 'nameEncry',
    },
    bankCardEncry(value) {
        return '**** **** **** ' + value.substring(value.length - 4);
    },
    idCardEncry(value) {
        if (!value) return '';
        const len = value.length;
        if (len <= 2) return value;
        if (len <= 7) return value.substring(0, 1) + '*'.repeat(len - 2) + value.substring(value.length - 1);
        return value.substring(0, 4) + '*'.repeat(len - 7) + value.substring(value.length - 3);
    },
    nameEncry(value) {
        if (!value) return '';
        const len = value.length;
        if (len == 1) return value;
        if (len == 2) return '*' + value.substring(value.length - 1);
        return value.substring(0, 1) + '*'.repeat(len - 2) + value.substring(value.length - 1);
    },
};

function encryValue(value, type) {
    if (!encryFunction.typeMap[type]) return value;
    const fn = encryFunction[encryFunction.typeMap[type]];
    return fn(value);
}

export default encryValue;
