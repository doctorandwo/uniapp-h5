import * as Auth from '@/common/utils/auth';
const store = {
    state: {
        headerInfo: {},
        statusBarHeight: uni.getStorageSync('statusBarHeight') || 0,
        bottomSafeArea: uni.getStorageSync('bottomSafeArea') || 0,
        systemInfo: {},
        headerZIndex: 10,
    },
    getters: {
        headerInfo: state => state.headerInfo,
        statusBarHeight: state => state.statusBarHeight,
        bottomSafeArea: state => state.bottomSafeArea,
        isLogin: state => !!state.headerInfo.Authorization || !!state.headerInfo.token,
    },
    mutations: {
        /**
         * @description: 清除token
         */
        CLEAR_TOKEN: state => {
            state.headerInfo.Authorization = '';
            Auth.removeToken();
        },
        /* 仅更新token时候用 */
        UPDATE_TOEKN: (state, token) => {
            state.headerInfo.Authorization = token;
            Auth.setToken({ token });
        },
        /**
         * @description: 设置请求头。正常里面应该是包含token的
         * @param {Object} val 请求头对象
         */
        SET_HEADER: (state, val) => {
            state.headerInfo = val;
        },

        // 状态栏高度
        SET_STATUSBARHEIGHT: (state, val) => {
            state.statusBarHeight = val || 0;
        },
        // 底部安全距离
        SET_BOTTOMSAFEAREA: (state, val) => {
            state.bottomSafeArea = Number(val) || 0;
        },
        // 系统信息
        SET_SYSTEMINFO: (state, val) => {
            state.systemInfo = val;
        },
    },
    actions: {
        SetSystemInfo({ commit }, info) {
            const { statusBarHeight, safeAreaInsets, windowHeight, windowWidth } = info || {};
            commit('SET_SYSTEMINFO', info);

            commit('SET_STATUSBARHEIGHT', statusBarHeight || 0);
            commit('SET_BOTTOMSAFEAREA', safeAreaInsets?.bottom || 0);
            uni.setStorageSync('windowHeight', windowHeight);
            uni.setStorageSync('windowWidth', windowWidth);
        },
    },
};
export default store;
