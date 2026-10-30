import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { appletsToken } from '../service.js';
import store from '@/store';

/**
 * @description: 获取微信登录凭证
 * @return {Promise<[Boolean,info|err]>} 微信登录凭证code
 */
const getWxLoginCode = () => {
    return new Promise(resolve => {
        wx.login({
            success: info => {
                console.log('wx凭证==', info);
                if (!info?.code) {
                    resolve([true, info]);
                    return;
                }
                resolve([false, info]);
            },
            fail: err => {
                resolve([true, err]);
            },
        });
    });
};

/**
 * @description: code换取access_token
 * @param {string} code 微信登录凭证code
 * @return {Promise<Boolean>} 登陆是否成功
 */
const wxAuthLogin = async code => {
    const [err, res] = await useRequest(appletsToken, { code });
    if (err) return false;
    const { access_token, expires_in } = res.data;
    // store.commit('SET_HEADER', { Authorization: access_token, expires_in });

    return { Authorization: access_token, expires_in };
};

export { getWxLoginCode, wxAuthLogin };
