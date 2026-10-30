/**
 * 小程序更新提示 hook
 * @by oh-my-zerone 2026-09-08
 *
 * 职责：
 *   封装微信小程序原生更新能力 uni.getUpdateManager()，统一处理
 *   「启动检测 → 静默下载 → 提示重启 / 失败兜底 → 应用新版本」链路，
 *   让调用方只需在启动时调用一次 checkUpdate()。
 *
 * 背景（.PRD/1.4.0）：
 *   小程序发布新版本后，已打开过的用户默认仍运行本地缓存的旧包，
 *   需冷启动或长时间未使用才会被微信自动替换，线上修复无法及时触达。
 *   本 hook 用于在冷启动时主动检测并引导重启。
 *
 * 用法：
 *   // #ifdef MP-WEIXIN
 *   const { state, checkUpdate } = useAppUpdate();
 *   checkUpdate();
 *   // #endif
 *
 * 平台差异：
 *   实现体整体包在 // #ifdef MP-WEIXIN 条件编译内，H5 / 其他端调用为 noop，
 *   调用方无需判断平台，也不会因 uni.getUpdateManager 不存在而报错。
 *
 * 设计取舍：
 *   - 弹窗用 uni.showModal（D4-A）：不新增组件。App.vue 无 <template>，
 *     自定义弹窗需在页面挂载，成本与改动面都更大；原生弹窗样式已符合平台习惯。
 *   - 强制更新策略来自前端常量 FORCE_UPDATE_FROM（D2-A）：不依赖后端接口，
 *     后续若要改后端下发，只需替换 isForceUpdate 的实现，其余流程不变。
 *   - 「稍后」以 storage 记录版本号（D6-A）：同一版本在一个启动周期内只打扰一次，
 *     用户重启到新版本后（constants.js 中 APP_VERSION 变化）再次发版仍会提示。
 *   - 模块级 dialogShown / running 保证幂等：即便 checkUpdate 被多次调用，
 *     也只会跑一条检测链路、只弹一次窗。
 *
 * 响应式说明（Vue 2.x）：
 *   使用 Vue.observable 暴露 state；本项目运行在 Vue 2.6 + UniApp 环境，
 *   不要改成 Vue 3 的 ref / reactive。
 */
import Vue from 'vue';
import { APP_VERSION, UPDATE_STORAGE_KEYS, UPDATE_TEXTS, FORCE_UPDATE_FROM } from './constants';

/** 模块级标记：是否已有检测链路在跑（防止并发重复调用） */
let running = false;

/** 模块级标记：单次启动周期内是否已弹过更新弹窗（防止重复打扰） */
let dialogShown = false;

/**
 * 比较两个语义化版本号。
 *
 * 按位比较，段数不等时缺失位补 0（'1.4' 与 '1.4.0' 相等）；
 * 非数字段按 0 处理，保证异常值不抛错。
 *
 * @param {string} v1 版本 A
 * @param {string} v2 版本 B
 * @returns {number} v1 > v2 返回 1；v1 < v2 返回 -1；相等返回 0
 */
function compareVersion(v1, v2) {
    const a = String(v1 || '').split('.');
    const b = String(v2 || '').split('.');
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i += 1) {
        // 非数字段（如 '1.4.0-beta'）按 0 处理，只比较前导数字，避免 NaN 干扰
        const n1 = parseInt(a[i], 10) || 0;
        const n2 = parseInt(b[i], 10) || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

/**
 * 是否命中强制更新。
 *
 * 口径：当前包版本 < FORCE_UPDATE_FROM 即强制。
 *   - FORCE_UPDATE_FROM 为空 → 不强制（全部为「建议更新」）
 *   - 例：FORCE_UPDATE_FROM = '1.4.0'，当前包 1.0.0 → 强制；当前包 1.4.0 → 不强制
 *
 * 说明：getUpdateManager 不返回线上版本号，因此以「当前包版本是否需要被拉新」判定，
 * 已升级到目标版本的用户不会被反复强制。
 *
 * @returns {boolean} true=强制更新（弹窗不可取消）
 */
function isForceUpdate() {
    if (!FORCE_UPDATE_FROM) return false;
    return compareVersion(APP_VERSION, FORCE_UPDATE_FROM) < 0;
}

const useAppUpdate = () => {
    const state = Vue.observable({
        /** 是否正在检测 / 下载新版本 */
        checking: false,
        /** onCheckForUpdate 是否返回有新版本 */
        hasUpdate: false,
        /** 新包是否已下载完成（可 applyUpdate） */
        updateReady: false,
        /** 新包下载是否失败 */
        updateFailed: false,
        /** 本次更新是否为强制更新（由 FORCE_UPDATE_FROM 计算） */
        forceUpdate: isForceUpdate(),
        /** 当前包版本号 */
        currentVersion: APP_VERSION,
    });

    /** @type {Object|null} 微信小程序 UpdateManager 实例（仅 MP-WEIXIN 端赋值） */
    let manager = null;

    /**
     * 读取用户「稍后」时记录的版本号。
     * storage 读写在极端场景（超配额 / 隐私模式）可能抛错，这里吞掉异常不影响主流程。
     *
     * @returns {string} 已忽略的版本号，未记录时返回空串
     */
    function getSkipVersion() {
        try {
            return uni.getStorageSync(UPDATE_STORAGE_KEYS.SKIP_VERSION) || '';
        } catch (e) {
            return '';
        }
    }

    /**
     * 记录用户「稍后」时忽略的版本号。
     *
     * @param {string} version 要记录的版本号
     * @returns {void}
     */
    function setSkipVersion(version) {
        try {
            uni.setStorageSync(UPDATE_STORAGE_KEYS.SKIP_VERSION, version);
        } catch (e) {
            console.warn('[useAppUpdate] 记录忽略版本失败:', e);
        }
    }

    /**
     * 应用新版本并重启小程序。
     * 调用后微信会强制重启到新版本，无需再做其他处理。
     *
     * @returns {void}
     */
    function applyUpdate() {
        if (!manager) return;
        manager.applyUpdate();
    }

    /**
     * 新包下载完成 → 提示用户重启。
     *
     * - 强制更新：showCancel = false，无取消入口，确认即 applyUpdate
     * - 非强制：提供「稍后」，选择后记录版本号，本启动周期不再打扰（D6-A）
     *
     * @returns {void}
     */
    function promptUpdateReady() {
        if (dialogShown) return;

        if (state.forceUpdate) {
            dialogShown = true;
            uni.showModal({
                title: UPDATE_TEXTS.TITLE,
                content: UPDATE_TEXTS.UPDATE_READY,
                showCancel: false,
                confirmText: UPDATE_TEXTS.BTN_RESTART,
                success: res => {
                    if (res.confirm) applyUpdate();
                },
            });
            return;
        }

        // 用户已对本版本选过「稍后」→ 本次不再提示
        if (getSkipVersion() === APP_VERSION) return;

        dialogShown = true;
        uni.showModal({
            title: UPDATE_TEXTS.TITLE,
            content: UPDATE_TEXTS.UPDATE_READY,
            confirmText: UPDATE_TEXTS.BTN_RESTART,
            cancelText: UPDATE_TEXTS.BTN_LATER,
            success: res => {
                if (res.confirm) {
                    applyUpdate();
                    return;
                }
                setSkipVersion(APP_VERSION);
            },
        });
    }

    /**
     * 新包下载失败 → 提示用户重试。
     * 用户点「重新检测」时复位弹窗标记并重新走一遍检测链路。
     *
     * @returns {void}
     */
    function promptUpdateFailed() {
        if (dialogShown) return;
        dialogShown = true;
        uni.showModal({
            title: UPDATE_TEXTS.TITLE,
            content: UPDATE_TEXTS.UPDATE_FAILED,
            confirmText: UPDATE_TEXTS.BTN_RETRY,
            cancelText: UPDATE_TEXTS.BTN_CLOSE,
            success: res => {
                if (!res.confirm) return;
                // 重新检测：放开弹窗标记，checkUpdate 内部会重置流程状态
                dialogShown = false;
                checkUpdate();
            },
        });
    }

    /**
     * 检测小程序新版本（对外唯一入口）。
     *
     * 流程：
     *   1. 无 getUpdateManager（低版本基础库 / 非小程序端）→ 静默跳过，不影响启动
     *   2. onCheckForUpdate 无新版本 → 结束
     *   3. 有新版本 → 后台静默下载 → onUpdateReady 提示重启 / onUpdateFailed 提示重试
     *
     * 幂等：running 标记保证同一时刻只有一条检测链路；失败重试时该标记已复位。
     *
     * @returns {void}
     */
    function checkUpdate() {
        // #ifdef MP-WEIXIN
        if (typeof uni.getUpdateManager !== 'function') return;
        if (running) return;
        running = true;

        state.checking = true;
        state.hasUpdate = false;
        state.updateReady = false;
        state.updateFailed = false;

        manager = uni.getUpdateManager();

        manager.onCheckForUpdate(res => {
            console.log('onCheckForUpdate', res);
            state.hasUpdate = !!(res && res.hasUpdate);
            if (!state.hasUpdate) {
                state.checking = false;
                running = false;
                return;
            }
            // 有新版本：微信会在后台静默下载，等待 onUpdateReady / onUpdateFailed
        });

        manager.onUpdateReady(() => {
            state.updateReady = true;
            state.checking = false;
            running = false;
            promptUpdateReady();
        });

        manager.onUpdateFailed(() => {
            state.updateFailed = true;
            state.checking = false;
            running = false;
            promptUpdateFailed();
        });
        // #endif
    }

    return {
        state,
        checkUpdate,
        applyUpdate,
        currentVersion: APP_VERSION,
    };
};

export { useAppUpdate };
export default useAppUpdate;
