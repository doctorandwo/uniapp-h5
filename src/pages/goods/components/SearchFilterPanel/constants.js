/**
 * @by oh-my-zerone
 * 货源页筛选项面板配置
 */

export const FILTER_KEYS = {
    ALL: 'all',
    TIME: 'time',
    // @by oh-my-zerone 该 key 现承载「发布方式」筛选（对应接口 publishMode），保留 key 名以兼容既有引用
    SMART: 'smart',
};

const LOAD_TIME_OPTIONS = [
    { value: '1-3', label: '1-3天内开始' },
    { value: '7', label: '7天内开始' },
    { value: '14', label: '14天内开始' },
    { value: '14+', label: '14天后开始' },
];

const UNLOAD_TIME_OPTIONS = [
    { value: '1-3', label: '1-3天内结束' },
    { value: '7', label: '7天内结束' },
    { value: '14', label: '14天内结束' },
    { value: '14+', label: '14天后结束' },
];

export const FILTER_CONFIG = [
    {
        key: FILTER_KEYS.ALL,
        label: '全部',
        // @by oh-my-zerone 货源状态改为单选（接口 status 为 integer，多值会 JSON.stringify 成数组导致参数异常）
        type: 'single',
        title: '货源状态',
        // @by oh-my-zerone 先注释掉「可多选」提示语
        // smallTitle: '（可多选）',
        // @by oh-my-zerone 状态值对齐 info.status 字典：0 已发布 · 1 下架 · 2 未发布 · 3 已完成
        options: [
            { value: '0', label: '已发布' },
            { value: '1', label: '已下架' },
            { value: '2', label: '未发布' },
            { value: '3', label: '已完成' },
        ],
    },
    {
        key: FILTER_KEYS.TIME,
        label: '时间排序',
        type: 'group',
        groups: [
            { key: 'loadStart', title: '开始时间', options: LOAD_TIME_OPTIONS },
            { key: 'unloadEnd', title: '结束时间', options: UNLOAD_TIME_OPTIONS },
        ],
    },
    {
        // @by oh-my-zerone 原「智能排序/增量货源」改为「发布方式」过滤（对应接口 publishMode）
        key: FILTER_KEYS.SMART,
        label: '发布方式',
        type: 'single',
        title: '发布方式',
        options: [
            { value: 0, label: '大厅不可见' },
            { value: 1, label: '大厅可见' },
        ],
    },
];

export function createDefaultFilterValue() {
    return {
        all: '0',
        time: {
            loadStart: '',
            unloadEnd: '',
        },
        smart: '',
    };
}
