/**
 * @by oh-my-zerone 2026-09-30
 * @description 业务权限校验。
 *   由原 common/utils/hasPermit.js 收敛至 hooks（依赖 Vuex store getter btnPermission）。
 *   纯函数形式，可在组件或非组件上下文（如 config 模块）直接调用。
 */

// store
import Store from '@/store';

/**
 * 校验当前用户是否拥有指定权限
 * @param {string|string[]} val 单个权限编码，或权限编码数组（满足其一即可）
 * @returns {boolean}
 */
function hasPermit(val) {
    if (!val) return false;
    const pList = Store.getters.btnPermission;
    console.log('hasPermit==', val, pList);

    // 处理 val 为数组的情况
    if (Array.isArray(val)) {
        return val.some(item => pList.includes(item));
    }
    // 处理 val 为字符串的情况
    else if (typeof val === 'string') {
        return pList.includes(val);
    }
    // 其他情况返回 false
    return false;
}

export { hasPermit };
