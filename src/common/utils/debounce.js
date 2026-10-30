/**
 * @by oh-my-zerone 2026-09-30
 * @description 函数防抖。由原 debounceThrottle.js 收敛而来；
 *   重复的 throttle 实现已移除，节流统一由 common/utils/throttle.js 提供。
 */

/**
 * @desc 函数防抖
 * @param {Function} func 目标函数
 * @param {number} wait 延迟执行毫秒数
 * @param {boolean} immediate true - 立即执行，false - 延迟执行
 */
export const debounce = function (func, wait = 1000, immediate = true) {
    let timer;
    return function () {
        let context = this,
            args = arguments;
        if (timer) clearTimeout(timer);
        if (immediate) {
            let callNow = !timer;
            timer = setTimeout(() => {
                timer = null;
            }, wait);
            if (callNow) func.apply(context, args);
        } else {
            timer = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        }
    };
};
