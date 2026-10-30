import tabbarList from '../tabbarList';

/**
 * 将页面路由归一化为以 '/' 开头的绝对路径
 * 小程序 getCurrentPages() 返回的 route 形如 'pages/waybill/index'（无前导斜杠），
 * tabbarList 中的 pagePath 形如 '/pages/waybill/index'，两者需统一格式后才能比对。
 * @param {string} route 页面路由，可带或不带前导斜杠
 * @returns {string} 归一化后的路径，如 '/pages/waybill/index'；入参为空时返回空字符串
 */
function normalizePath(route) {
    if (!route) return '';
    return '/' + String(route).replace(/^\//, '');
}

/**
 * 获取当前页面栈栈顶的路由（兼容 H5 / 微信小程序）
 * H5 端页面实例为 Vue 组件，路径挂在 $route.path 上；小程序端挂在 route 字段上。
 * @returns {string} 当前页面路由；页面栈为空时返回空字符串
 */
function getCurrentRoute() {
    const pages = getCurrentPages();
    if (!pages || !pages.length) return '';
    const currentPage = pages[pages.length - 1];
    return currentPage.route || (currentPage.$route && currentPage.$route.path) || '';
}

const store = {
    state: {
        tabbarZIndex: 0,
        currentTabbar: void 0,
        tabbarHeight: 0,
    },
    getters: {
        tabbarList: () => {
            return tabbarList['default']();
        },
        tabbarPathList: () => {
            return tabbarList['default']().map(el => el.pagePath);
        },
        tabbarListMap: () => {
            return tabbarList['default']().reduce((acc, cur) => {
                acc[cur.pagePath] = cur;
                return acc;
            }, {});
        },
        tabbarHeight: state => {
            return state.tabbarHeight;
        },
    },
    mutations: {
        SET_TABBAR_HEIGHT(state, val) {
            state.tabbarHeight = val;
        },
        SET_TABBAR_ZINDEX(state, val) {
            state.tabbarZIndex = val;
        },
        SET_CURRENT_TABBAR(state, val) {
            state.currentTabbar = val;
            uni.setStorageSync('currentTabbar', val);
        },
    },
    actions: {
        /**
         * 将 tabbar 选中态对齐为「当前显示的页面路由」
         *
         * 与 SwitchTabbar 的区别：本 action 只同步状态，不执行 uni.switchTab、不触发页面 refresh 事件，
         * 因此不会产生页面跳转，也不会丢失 URL 上的 query 参数。
         * 用于「非点击 tabbar 而进入页面」的所有场景：
         * 1. 微信服务号通知直达某个 tabbar 页（带 scene / query）；
         * 2. 从详情页 navigateBack、原生返回键返回 tabbar 页；
         * 3. 冷启动、H5 直接输入地址进入。
         *
         * @param {Object} ctx vuex action 上下文
         * @param {Function} ctx.commit 提交 mutation
         * @param {Object} ctx.getters getters 集合，使用其中的 tabbarPathList
         * @param {string} [route] 目标页面路由；不传时自动取当前页面栈栈顶的路由
         * @returns {boolean} 是否命中 tabbar 页面并完成同步（非 tabbar 页面返回 false）
         */
        SyncTabbar({ commit, getters }, route) {
            const currentRoute = normalizePath(route || getCurrentRoute());
            if (currentRoute && getters.tabbarPathList.includes(currentRoute)) {
                commit('SET_CURRENT_TABBAR', currentRoute);
                return true;
            }
            return false;
        },
        SwitchTabbar({ commit, getters }, val) {
            commit('SET_CURRENT_TABBAR', val);
            uni.switchTab({ url: val });
            // 刷新当前tabbar
            const tabbar = getters.tabbarListMap[val];
            if (tabbar && tabbar?.$event?.refresh) {
                uni.$emit(tabbar.$event.refresh);
            }
        },
        BackHome({ commit, dispatch }) {
            dispatch('SwitchTabbar', '/pages/home/index');
        },
    },
};

export default store;
