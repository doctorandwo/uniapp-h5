/**
 * 函数节流
 * @by oh-my-zerone 2026-06-15
 */
const throttle = function (fn, delay) {
    let cd = false;
    let timer = null;
    return function () {
        const content = this;
        const args = arguments;
        if (!cd) {
            fn.apply(content, args);
            cd = true;
            clearTimeout(timer);
            timer = setTimeout(function () {
                cd = false;
            }, delay);
        }
    };
};

export default throttle;
