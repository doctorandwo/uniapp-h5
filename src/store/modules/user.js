/**
 * @by oh-my-zerone
 */
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { onLoginStatus } from '@/common/platform/navigate';
import { ApiGetUserInfo, ApiGetShipmentInfo } from '@/api/user';

const store = {
    state: {
        userInfo: {},
        isAuth: false, // 是否认证
        shipmentInfo: {}, // 货主信息
        shipmentInfoUser: {}, // 用户信息中的货主信息（shipment.info）
        visibleToAuth: false, // 是否显示认证弹窗
    },
    getters: {
        userInfo: state => state.userInfo,
        isAuth: state => state.isAuth,
        shipmentInfo: state => state.shipmentInfo,
        shipmentInfoUser: state => state.shipmentInfoUser,
        visibleToAuth: state => state.visibleToAuth,
    },
    mutations: {
        SET_USERINFO: (state, val) => {
            state.userInfo = val;
        },
        SET_USERSTATUS: (state, val) => {
            state.isAuth = val;
        },
        SET_SHIPMENTINFO: (state, val) => {
            state.shipmentInfo = val;
        },
        SET_SHIPMENTINFO_USER: (state, val) => {
            state.shipmentInfoUser = val;
        },
        SET_VISIBLE_TO_AUTH: (state, val) => {
            state.visibleToAuth = val;
        },
    },
    actions: {
        async GetInfo({ commit, dispatch }) {
            const [err, res] = await useRequest(ApiGetUserInfo);
            if (err) return;
            const { user: info = {}, shipment } = res || {};

            console.log('用户信息==', info, shipment);
            commit('SET_USERINFO', info);
            commit('SET_SHIPMENTINFO_USER', shipment?.info || {});
            await dispatch('GetUserStatus');
            return true;
        },
        async GetUserStatus({ state, commit }) {
            const [err, res] = await useRequest(ApiGetShipmentInfo);
            if (err) return;
            const shipment = res?.data?.shipment || {};
            commit('SET_SHIPMENTINFO', shipment);
            commit('SET_VISIBLE_TO_AUTH', Object.keys(shipment).length == 0);
            // 货主认证状态：优先取 shipment.authStatus，为空则用 userInfo.shipment.info.authStatus 兜底
            const authStatus = shipment.authStatus || state.shipmentInfoUser?.authStatus;
            commit('SET_USERSTATUS', authStatus == 3);
            return true;
        },

        async LogOut({ commit }) {
            commit('CLEAR_TOKEN');
            commit('SET_USERINFO', {});
            commit('SET_SHIPMENTINFO', {});
            commit('SET_SHIPMENTINFO_USER', {});
            commit('SET_USERSTATUS', false);
            commit('SET_VISIBLE_TO_AUTH', false);
        },
        /**
         * @by oh-my-zerone 2026-10-13
         * 判断货主是否已认证（发布货源等业务前置校验）
         * @returns {boolean} 已认证返回 true，其余返回 false
         */
        IsOwnerAuth({ getters, dispatch }) {
            if (!onLoginStatus()) return false;
            // 通过与否与个人中心 isAuth 一致；未通过时再区分未认证、驳回、审核中
            if (getters.isAuth) return true;
            const authStatus = getters.shipmentInfo?.authStatus || getters.shipmentInfoUser?.authStatus;
            if (authStatus == 0 || authStatus == 2) {
                uni.showModal({
                    title: '提示',
                    content: '您需要先认证货主身份，点击确定切换至“我的”，点击“认证信息”，进行认证',
                    success: res => {
                        if (!res.confirm) return;
                        dispatch('SwitchTabbar', '/pages/user/index');
                    },
                });
                return false;
            }
            if (authStatus == 1) {
                uni.showModal({
                    title: '提示',
                    content: '您的货主身份正在审核中，认证通过后即可进行操作',
                    showCancel: false,
                });
                return false;
            }
            uni.showToast({
                title: '您的货主身份状态异常，请联系客服',
                icon: 'none',
            });
            return false;
        },
    },
};
export default store;
