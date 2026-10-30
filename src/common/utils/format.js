/**
 * 数组转对象
 * @param {array} arr 数组
 * @param {any} key 键值
 * @returns {object}
 */
export function arr2Obj(arr = [], key = 'value', valueKey) {
    if (!key) {
        console.error('请传入key');
        return {};
    }
    let count = 0;
    const res = arr.reduce((acc, cur) => {
        if (!cur?.[key]) {
            console.error(`${key}键对应的值为空`);
            return acc;
        }
        if (valueKey) acc[cur[key]] = cur[valueKey];
        else acc[cur[key]] = cur;
        count++;
        return acc;
    }, {});
    if (count !== arr.length) console.warn('存在重复的key');
    return res;
}

export function text2Array(text) {
    if (!text) return [];

    // 正则判断 字符串是否是 数组的JSON字符串
    let isArr = /^(\[.*\])$/;
    if (isArr.test(text)) return JSON.parse(text);

    // 正则判断 字符串是否是 ,拼接的字符串
    let isCommaStr = /^([^,]+)(,[^,]+)*$/;
    if (isCommaStr.test(text)) return text.split(',');

    return [];
}

export function normalList(list, valueKey, labelKey) {
    if (!list) return [];
    return list.map(item => ({ value: item[valueKey], label: item[labelKey], ...item }));
}

// 默认保留2位；小数点有0去0
export function fixNum(val, wei = 2, hasZero = false) {
    let num = !val ? 0 : Number(val);
    return !hasZero ? num.toFixed(wei).replace(/\.?0+$/, '') : num.toFixed(wei);
}

/**
 * @by oh-my-zerone
 * 金额格式化：
 * 1. 加千分位分隔，并去掉小数尾部无效 0；
 * 2. 整数位数超过 12 位时换算为「万」（÷10^4）以减少位数；
 *    若换算后仍超过 12 位，再升一级用「亿」（÷10^8），依此类推。
 * @param {number} val 金额
 * @returns {string}
 */
export function formatMoney(val) {
    const num = Number(val) || 0;
    const units = ['', '万', '亿', '万亿', '兆'];
    let value = num;
    let level = 0;
    // 统计整数部分位数（不含符号与小数点）
    let intDigits = String(Math.floor(Math.abs(value))).length;
    // 每超过 12 位进位一级（每级 ÷10^4，减少 4 位）
    while (intDigits > 12 && level < units.length - 1) {
        value /= 10000;
        level += 1;
        intDigits = String(Math.floor(Math.abs(value))).length;
    }
    // 千分位 + 最多 2 位小数，再剔除无效末尾 0 及多余小数点
    let str = Math.abs(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    str = str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return (value < 0 ? '-' : '') + str + units[level];
}

/**
 * 四舍五入保留位数  (支持千分位分隔符)
 * @param {*} value 数字
 * @param {*} precision 保留位置(1= 小数一位 2=小数二位, -1= 位数, -2=百位数)
 */
export function formatNumber(value, precision = 2, options = {}) {
    const { hasComma = true } = options;
    // 将字符串类型的数字转换为数值
    let number = parseFloat(value);
    // 检查是否为有效数字
    if (isNaN(number)) {
        number = 0; // 或者根据需求返回其他值，如 0
    }
    // 检查第二个参数是否为有效的整数
    let places = parseInt(precision, 10);
    if (isNaN(places)) {
        places = 2; // 默认保留两位小数
    }
    // 格式化数字
    number = number.toFixed(places);
    // 转换数字并返回
    return hasComma ? number.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : number;
}
