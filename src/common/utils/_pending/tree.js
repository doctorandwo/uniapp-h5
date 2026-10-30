/**
 * @by oh-my-zerone 2026-09-30
 * @description 待定归档：原 common/utils/tree.js。
 *   全局无引用，暂存备查，后续如有"扁平数组转树"需求可启用。
 */

/**
 * 将扁平数组转换为树形结构
 * @param {Array} list 扁平数组
 * @param {Object} options 配置项
 * @param {string} options.idKey 节点唯一标识字段，默认 'id'
 * @param {string} options.parentKey 父节点标识字段，默认 'parentId'
 * @param {string|number} options.rootValue 根节点标识值，默认 0
 * @param {string} options.childrenKey 子节点字段名，默认 'children'
 * @returns {Array} 树形数组
 */
export function buildTree(list = [], options = {}) {
    const { idKey = 'id', parentKey = 'parentId', rootValue = 0, childrenKey = 'children' } = options;

    const nodeMap = new Map();
    const tree = [];

    // 先构建节点映射，避免直接修改原数组
    list.forEach(item => {
        nodeMap.set(item[idKey], { ...item });
    });

    list.forEach(item => {
        const node = nodeMap.get(item[idKey]);
        const parentId = item[parentKey];

        // 根节点：parentId 等于 rootValue，或为 null/undefined/空字符串
        if (parentId === rootValue || parentId == null || parentId === '') {
            tree.push(node);
            return;
        }

        const parent = nodeMap.get(parentId);
        if (parent) {
            if (!parent[childrenKey]) {
                parent[childrenKey] = [];
            }
            parent[childrenKey].push(node);
        } else {
            // 找不到父节点时兜底作为根节点展示，避免数据丢失
            tree.push(node);
        }
    });

    return tree;
}

/**
 * 将字典列表转换为树形结构
 * 规则：dictPid 为 0 是第一级；dictPid 等于某条数据的 dictCode 则是该数据的下级
 * @param {Array} list 字典列表
 * @returns {Array} 树形数组
 */
export function buildDictTree(list = []) {
    return buildTree(list, {
        idKey: 'dictCode',
        parentKey: 'dictPid',
        rootValue: 0,
        childrenKey: 'children',
    });
}
