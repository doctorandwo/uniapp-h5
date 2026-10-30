/**
 * @by oh-my-zerone 2026-10-19
 * 地址簿编辑态内存缓存
 * 列表页 -> 表单页传递记录使用：URL query 只传可序列化的 id，
 * 记录本体放模块级缓存，避免长 JSON 拼进 URL 触发长度限制
 */

/** 当前编辑中的地址记录（卡片模型） */
let editingAddress = null;

/**
 * 写入待编辑记录
 * @param {Object} record 卡片模型
 * @returns {void}
 */
export function setEditingAddress(record) {
    editingAddress = record || null;
}

/**
 * 读取并清空待编辑记录（一次性读取，避免脏数据残留）
 * @returns {Object|null} 卡片模型
 */
export function takeEditingAddress() {
    const record = editingAddress;
    editingAddress = null;
    return record;
}

/**
 * 主动清空待编辑记录
 * @returns {void}
 */
export function clearEditingAddress() {
    editingAddress = null;
}
