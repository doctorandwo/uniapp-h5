/**
 * 小程序更新提示 - 常量配置
 * @by oh-my-zerone 2026-09-08
 *
 * 用途：
 *   收敛「更新提示」链路上的当前版本号、storage key、文案与强制更新策略，
 *   让 useAppUpdate 只负责流程编排；发版时调整策略只改本文件，不动调用方。
 *
 * 决策依据（.PRD/1.4.0）：
 *   - D2 强制更新：前端配置驱动，不依赖后端接口
 *   - D3 更新日志：本期不展示，弹窗文案固定
 *   - D4 弹窗实现：uni.showModal 原生弹窗，不新增组件
 *
 * 扩展方式：
 *   - 需要更新日志：新增 RELEASE_NOTES（版本号 → 说明）映射，由 index.js 拼进 content
 *   - 需要后端下发强制策略：只替换 index.js 中 forceUpdate 的判定来源，
 *     文案与 storage key 保持不变，调用方无感
 */

/**
 * 当前包版本号（小程序端独立维护）。
 *
 * 与 manifest.json 的 versionName 完全解耦：
 *   - versionName 仅用于微信后台版本展示，不参与任何运行时逻辑
 *   - 本常量是运行时唯一版本口径，用于强更判定与「稍后」去重
 *   - 发版时只改这里，无需同步 manifest
 *
 * 格式：语义化版本 major.minor.patch，段数可少于 3 段（compareVersion 按位补 0）。
 */
export const APP_VERSION = '1.4.0';

/** 更新提示相关 storage key（单一来源，避免各处硬编码字符串） */
export const UPDATE_STORAGE_KEYS = {
    /**
     * 用户点「稍后」时记录的当前版本号。
     * 用于「同一版本一次生命周期内只打扰一次」（.PRD/1.4.0 D6-A）。
     */
    SKIP_VERSION: 'APP_UPDATE_SKIP_VERSION',
};

/** 更新提示文案（集中维护，便于统一调整口径） */
export const UPDATE_TEXTS = {
    /** 弹窗标题 */
    TITLE: '更新提示',
    /** 新包下载完成：引导重启 */
    UPDATE_READY: '发现新版本，是否立即重启体验？',
    /** 新包下载失败：给出可执行的兜底引导 */
    UPDATE_FAILED: '新版本下载失败，请检查网络，或删除小程序后重新搜索进入。',
    /** 主按钮：重启到新版本 */
    BTN_RESTART: '立即重启',
    /** 次按钮：本本次启动周期内不再提示 */
    BTN_LATER: '稍后',
    /** 失败弹窗主按钮：重新触发检测 */
    BTN_RETRY: '重新检测',
    /** 失败弹窗次按钮 */
    BTN_CLOSE: '我知道了',
};

/**
 * 强制更新的起始版本号。
 *
 * 判定口径（见 index.js isForceUpdate）：
 *   当前包版本 < FORCE_UPDATE_FROM 时，一旦检测到新版本即强制
 *   —— 弹窗无取消按钮，用户必须重启才能继续使用。
 *
 * 取值说明：
 *   - '' / null：不强制，所有更新均为「建议更新」，用户可点「稍后」
 *   - '1.4.0'：需要强更时填本次发布的版本号，旧版本用户会被强制拉新
 *
 * 发版用法：
 *   普通发版 → 保持空串；需要强更 → 改成该版本号；强更收敛后 → 改回空串。
 */
export const FORCE_UPDATE_FROM = '';

export default {
    APP_VERSION,
    UPDATE_STORAGE_KEYS,
    UPDATE_TEXTS,
    FORCE_UPDATE_FROM,
};
