/**
 * @desc 监听元素是否进入视口，进入时触发回调（基于 uni.createIntersectionObserver 封装）
 * @by oh-my-zerone 2026-06-23
 * @param {Object} context 组件实例（this），用于绑定观察器上下文
 * @param {string} selector 目标元素的选择器（支持 #id / .class / 标签等）
 * @param {Function} onVisible 元素进入视口时触发的回调，签名 (res) => void，res 为 uni 回调参数
 * @param {Object} [options] 可选配置
 * @param {number} [options.top=0] 相对于视口顶部的偏移（正值：元素需滚出该距离才视为不可见；负值：提前触发）
 * @param {number[]} [options.thresholds=[0]] 触发回调的可见比例阈值
 * @param {number} [options.initialRatio=0] 初始可见比例
 * @param {boolean} [options.observeAll=false] 是否同时观察所有匹配的元素
 * @returns {Object|null} uni IntersectionObserver 实例，失败时返回 null；调用方需在适当时机调用 disconnect() 释放
 */
export function createVisibilityObserver(context, selector, onVisible, options = {}) {
    if (!context || !selector || typeof onVisible !== 'function') {
        console.error('[createVisibilityObserver] 参数缺失：context / selector / onVisible 必填');
        return null;
    }
    const { top = 0, thresholds = [0], initialRatio = 0, observeAll = false } = options;

    const observer = uni.createIntersectionObserver(context, {
        thresholds,
        initialRatio,
        observeAll,
    });
    observer.relativeToViewport({ top }).observe(selector, res => {
        if (!res) return;
        onVisible(res);
    });

    return observer;
}

